import type {
  AuthenticatedSession,
  TokenPayload
} from "./auth-session.types.js";
import {
  hasValidTokenLifetime,
  normalizeAuthenticatedActor
} from "./auth-session-claims.js";
import {
  authTokenIssuer,
  base64UrlDecode,
  isSafeTokenSegment,
  maxAccessTokenLength,
  maxEncodedPayloadLength,
  maxSignatureLength,
  safeEqual,
  signAuthTokenPayload
} from "./auth-session-codec.js";

export function verifyAccessToken(
  token: string,
  now = new Date()
): AuthenticatedSession | undefined {
  if (Number.isNaN(now.getTime())) {
    return undefined;
  }

  if (token.length > maxAccessTokenLength) {
    return undefined;
  }

  const [tokenIssuer, encodedPayload, signature, extra] = token.split(".");

  if (
    tokenIssuer !== authTokenIssuer ||
    !isSafeTokenSegment(encodedPayload, maxEncodedPayloadLength) ||
    !isSafeTokenSegment(signature, maxSignatureLength) ||
    extra !== undefined
  ) {
    return undefined;
  }

  if (!safeEqual(signature, signAuthTokenPayload(encodedPayload))) {
    return undefined;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<TokenPayload>;
    const actor = normalizeAuthenticatedActor(payload);

    if (!actor || !hasValidTokenLifetime(payload, now)) {
      return undefined;
    }

    return {
      actor,
      expiresAt: new Date(payload.exp * 1000).toISOString()
    };
  } catch {
    return undefined;
  }
}
