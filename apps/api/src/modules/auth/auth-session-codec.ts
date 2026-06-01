import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "./auth-session-config.js";

export const authTokenIssuer = "wiiicare-nexus";
export const maxAccessTokenLength = 4096;
export const maxEncodedPayloadLength = 2048;
export const maxSignatureLength = 128;

const tokenSegmentPattern = /^[A-Za-z0-9_-]+$/;

export function signAuthTokenPayload(encodedPayload: string): string {
  return createHmac("sha256", getAuthSecret()).update(encodedPayload).digest("base64url");
}

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isSafeTokenSegment(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength &&
    tokenSegmentPattern.test(value)
  );
}

export function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

export function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}
