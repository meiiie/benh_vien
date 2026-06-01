import type {
  AuthenticatedActor,
  AuthenticatedSession,
  TokenPayload
} from "./auth-session.types.js";
import {
  assertValidDate,
  normalizeAuthenticatedActor
} from "./auth-session-claims.js";
import { getAuthTokenTtlSeconds } from "./auth-session-config.js";
import {
  authTokenIssuer,
  base64UrlEncode,
  signAuthTokenPayload
} from "./auth-session-codec.js";

export function createAccessToken(
  actor: AuthenticatedActor,
  now = new Date()
): AuthenticatedSession & {
  readonly accessToken: string;
} {
  assertValidDate(now, "Access token issued time is invalid.");
  const normalizedActor = normalizeAuthenticatedActor(actor);

  if (!normalizedActor) {
    throw new Error("Authenticated actor is invalid.");
  }

  const issuedAt = Math.floor(now.getTime() / 1000);
  const payload: TokenPayload = {
    ...normalizedActor,
    iat: issuedAt,
    exp: issuedAt + getAuthTokenTtlSeconds()
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signAuthTokenPayload(encodedPayload);

  return {
    accessToken: `${authTokenIssuer}.${encodedPayload}.${signature}`,
    actor: normalizedActor,
    expiresAt: new Date(payload.exp * 1000).toISOString()
  };
}
