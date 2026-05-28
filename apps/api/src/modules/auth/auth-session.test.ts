import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ActorRole } from "@benh-vien-so/domain";
import { createAccessToken, verifyAccessToken } from "./auth-session.js";

const testSecret = "wiiicare-auth-session-test-secret-32-characters";
const issuer = "wiiicare-nexus";

type TestTokenPayload = {
  readonly actorId: string;
  readonly displayName: string;
  readonly role: ActorRole;
  readonly iat?: number;
  readonly exp?: number;
};

describe("auth session tokens", () => {
  const originalAuthSecret = process.env.BVS_AUTH_SECRET;
  const originalAuthTokenTtlSeconds = process.env.BVS_AUTH_TOKEN_TTL_SECONDS;

  beforeEach(() => {
    process.env.BVS_AUTH_SECRET = testSecret;
    delete process.env.BVS_AUTH_TOKEN_TTL_SECONDS;
  });

  afterEach(() => {
    restoreEnv("BVS_AUTH_SECRET", originalAuthSecret);
    restoreEnv("BVS_AUTH_TOKEN_TTL_SECONDS", originalAuthTokenTtlSeconds);
  });

  it("verifies a signed demo token inside the configured lifetime", () => {
    process.env.BVS_AUTH_TOKEN_TTL_SECONDS = "600";
    const issuedAt = new Date("2026-05-27T00:00:00.000Z");
    const session = createAccessToken(
      {
        actorId: "practitioner-demo-001",
        displayName: "Bac si dieu tri",
        role: "clinician"
      },
      issuedAt
    );

    expect(verifyAccessToken(session.accessToken, new Date("2026-05-27T00:05:00.000Z"))).toMatchObject({
      actor: {
        actorId: "practitioner-demo-001",
        role: "clinician"
      },
      expiresAt: "2026-05-27T00:10:00.000Z"
    });
  });

  it("rejects signed tokens with unsafe lifetime claims", () => {
    const now = Math.floor(new Date("2026-05-27T00:00:00.000Z").getTime() / 1000);
    const basePayload = {
      actorId: "practitioner-demo-001",
      displayName: "Bac si dieu tri",
      role: "clinician" as const
    };

    expect(
      verifyAccessToken(
        buildSignedToken({
          ...basePayload,
          exp: now + 600
        }),
        new Date("2026-05-27T00:00:00.000Z")
      )
    ).toBeUndefined();

    expect(
      verifyAccessToken(
        buildSignedToken({
          ...basePayload,
          iat: now + 120,
          exp: now + 600
        }),
        new Date("2026-05-27T00:00:00.000Z")
      )
    ).toBeUndefined();

    expect(
      verifyAccessToken(
        buildSignedToken({
          ...basePayload,
          iat: now,
          exp: now
        }),
        new Date("2026-05-27T00:00:00.000Z")
      )
    ).toBeUndefined();

    expect(
      verifyAccessToken(
        buildSignedToken({
          ...basePayload,
          iat: now,
          exp: now + 60 * 60 * 9
        }),
        new Date("2026-05-27T00:00:00.000Z")
      )
    ).toBeUndefined();
  });

  it("rejects oversized or malformed token segments before deep verification", () => {
    const validSession = createAccessToken(
      {
        actorId: "practitioner-demo-001",
        displayName: "Bac si dieu tri",
        role: "clinician"
      },
      new Date("2026-05-27T00:00:00.000Z")
    );
    const [, encodedPayload, signature] = validSession.accessToken.split(".");

    expect(
      verifyAccessToken(
        `${issuer}.${"a".repeat(2049)}.${signature}`,
        new Date("2026-05-27T00:01:00.000Z")
      )
    ).toBeUndefined();
    expect(
      verifyAccessToken(
        `${issuer}.${encodedPayload}.${"a".repeat(129)}`,
        new Date("2026-05-27T00:01:00.000Z")
      )
    ).toBeUndefined();
    expect(
      verifyAccessToken(
        `${issuer}.${encodedPayload}.bad signature`,
        new Date("2026-05-27T00:01:00.000Z")
      )
    ).toBeUndefined();
    expect(
      verifyAccessToken(
        `${issuer}.${"a".repeat(4097)}.${signature}`,
        new Date("2026-05-27T00:01:00.000Z")
      )
    ).toBeUndefined();
  });
});

function buildSignedToken(payload: TestTokenPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", testSecret).update(encodedPayload).digest("base64url");

  return `${issuer}.${encodedPayload}.${signature}`;
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
