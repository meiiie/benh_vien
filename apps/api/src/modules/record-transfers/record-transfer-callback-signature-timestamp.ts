import { maxCallbackClockSkewMs } from "./record-transfer-callback-signature.constants.js";
import {
  timestampExpiredFailure,
  timestampInvalidFailure
} from "./record-transfer-callback-signature-failures.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.types.js";

export function validateCallbackTimestamp(
  timestamp: string,
  now: Date,
  keyId: string | undefined
): CallbackSignatureVerification | undefined {
  const timestampMs = Date.parse(timestamp);
  const nowMs = now.getTime();

  if (!Number.isFinite(timestampMs)) {
    return timestampInvalidFailure({ timestamp, keyId });
  }

  if (Math.abs(nowMs - timestampMs) > maxCallbackClockSkewMs) {
    return timestampExpiredFailure({ timestamp, keyId });
  }

  return undefined;
}
