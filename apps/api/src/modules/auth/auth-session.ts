import { createHmac, timingSafeEqual } from "node:crypto";
import type { ActorRole } from "@benh-vien-so/domain";

export type AuthenticatedActor = {
  readonly actorId: string;
  readonly displayName: string;
  readonly role: ActorRole;
};

export type AuthenticatedSession = {
  readonly actor: AuthenticatedActor;
  readonly expiresAt: string;
};

type TokenPayload = AuthenticatedActor & {
  readonly exp: number;
  readonly iat: number;
};

const tokenTtlSeconds = 60 * 60 * 8;
const issuer = "wiiicare-nexus";

export function createAccessToken(actor: AuthenticatedActor, now = new Date()): AuthenticatedSession & {
  readonly accessToken: string;
} {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload: TokenPayload = {
    ...actor,
    iat: issuedAt,
    exp: issuedAt + tokenTtlSeconds
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return {
    accessToken: `${issuer}.${encodedPayload}.${signature}`,
    actor,
    expiresAt: new Date(payload.exp * 1000).toISOString()
  };
}

export function verifyAccessToken(token: string, now = new Date()): AuthenticatedSession | undefined {
  const [tokenIssuer, encodedPayload, signature, extra] = token.split(".");

  if (tokenIssuer !== issuer || !encodedPayload || !signature || extra !== undefined) {
    return undefined;
  }

  if (!safeEqual(signature, sign(encodedPayload))) {
    return undefined;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<TokenPayload>;

    if (
      typeof payload.actorId !== "string" ||
      typeof payload.displayName !== "string" ||
      !isTokenRole(payload.role) ||
      typeof payload.exp !== "number"
    ) {
      return undefined;
    }

    if (payload.exp <= Math.floor(now.getTime() / 1000)) {
      return undefined;
    }

    return {
      actor: {
        actorId: payload.actorId,
        displayName: payload.displayName,
        role: payload.role
      },
      expiresAt: new Date(payload.exp * 1000).toISOString()
    };
  } catch {
    return undefined;
  }
}

export function getAuthSecret(): string {
  const secret = process.env.BVS_AUTH_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BVS_AUTH_SECRET must be set to at least 32 characters in production.");
  }

  return "wiiicare-dev-only-auth-secret-change-before-production";
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function isTokenRole(value: unknown): value is ActorRole {
  return value === "clinician" || value === "nurse" || value === "auditor" || value === "admin";
}
