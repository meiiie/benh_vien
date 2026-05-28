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

const defaultTokenTtlSeconds = 60 * 60 * 8;
const minTokenTtlSeconds = 60 * 5;
const maxTokenTtlSeconds = 60 * 60 * 8;
const maxClockSkewSeconds = 60;
const maxAccessTokenLength = 4096;
const maxEncodedPayloadLength = 2048;
const maxSignatureLength = 128;
const tokenSegmentPattern = /^[A-Za-z0-9_-]+$/;
const issuer = "wiiicare-nexus";

export function createAccessToken(actor: AuthenticatedActor, now = new Date()): AuthenticatedSession & {
  readonly accessToken: string;
} {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload: TokenPayload = {
    ...actor,
    iat: issuedAt,
    exp: issuedAt + getAuthTokenTtlSeconds()
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
  if (token.length > maxAccessTokenLength) {
    return undefined;
  }

  const [tokenIssuer, encodedPayload, signature, extra] = token.split(".");

  if (
    tokenIssuer !== issuer ||
    !isSafeTokenSegment(encodedPayload, maxEncodedPayloadLength) ||
    !isSafeTokenSegment(signature, maxSignatureLength) ||
    extra !== undefined
  ) {
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
      !hasValidTokenLifetime(payload, now)
    ) {
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
    if (process.env.NODE_ENV === "production" && isPlaceholderSecret(secret)) {
      throw new Error("BVS_AUTH_SECRET must not use placeholder values in production.");
    }

    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BVS_AUTH_SECRET must be set to at least 32 characters in production.");
  }

  return "wiiicare-dev-only-auth-secret-change-before-production";
}

export function assertAuthConfiguration(): void {
  getAuthSecret();
  getAuthTokenTtlSeconds();
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("base64url");
}

function isPlaceholderSecret(secret: string): boolean {
  const normalizedSecret = secret.toLowerCase();

  return normalizedSecret.includes("change-me") || normalizedSecret.includes("dev-only");
}

function getAuthTokenTtlSeconds(): number {
  const rawValue = process.env.BVS_AUTH_TOKEN_TTL_SECONDS;

  if (!rawValue?.trim()) {
    return defaultTokenTtlSeconds;
  }

  const parsed = Number(rawValue);

  if (
    !Number.isInteger(parsed) ||
    parsed < minTokenTtlSeconds ||
    parsed > maxTokenTtlSeconds
  ) {
    throw new Error(
      `BVS_AUTH_TOKEN_TTL_SECONDS must be an integer between ${minTokenTtlSeconds} and ${maxTokenTtlSeconds}.`
    );
  }

  return parsed;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function hasValidTokenLifetime(
  payload: Partial<TokenPayload>,
  now: Date
): payload is TokenPayload {
  if (!isUnixTimestamp(payload.iat) || !isUnixTimestamp(payload.exp)) {
    return false;
  }

  const nowSeconds = Math.floor(now.getTime() / 1000);

  return (
    payload.iat <= nowSeconds + maxClockSkewSeconds &&
    payload.exp > nowSeconds &&
    payload.exp > payload.iat &&
    payload.exp - payload.iat <= maxTokenTtlSeconds
  );
}

function isUnixTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value > 0
  );
}

function isSafeTokenSegment(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength &&
    tokenSegmentPattern.test(value)
  );
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
