import type { IncomingHttpHeaders } from "node:http";
import { readCallbackSecret } from "./record-transfer-callback-secret.js";
import { readSingleHeader } from "./record-transfer-callback-headers.js";
import {
  maxSignatureLength,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader,
  signatureAlgorithm
} from "./record-transfer-callback-signature.constants.js";
import { buildRecordTransferCallbackSignature } from "./record-transfer-callback-signature-builder.js";
import {
  signatureInvalidFailure,
  signatureRequiredFailure,
  toSecretLookupFailure
} from "./record-transfer-callback-signature-failures.js";
import { safeEqual } from "./record-transfer-callback-signature-safe-equal.js";
import { validateCallbackTimestamp } from "./record-transfer-callback-signature-timestamp.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.types.js";

export function verifyRecordTransferCallbackSignature(input: {
  readonly headers: IncomingHttpHeaders;
  readonly recordTransferId: string;
  readonly body: unknown;
  readonly now?: Date;
}): CallbackSignatureVerification {
  const secretResult = readCallbackSecret(input.headers);

  if ("error" in secretResult) {
    return toSecretLookupFailure(secretResult);
  }

  if (!secretResult.secret) {
    return {
      required: false,
      verified: false
    };
  }

  const timestamp = readSingleHeader(input.headers[recordTransferCallbackTimestampHeader]);
  const receivedSignature = readSingleHeader(
    input.headers[recordTransferCallbackSignatureHeader]
  );

  if (!timestamp || !receivedSignature) {
    return signatureRequiredFailure(secretResult.keyId);
  }

  if (receivedSignature.length > maxSignatureLength) {
    return signatureInvalidFailure({
      timestamp,
      keyId: secretResult.keyId,
      message: "Chữ ký callback vượt quá độ dài cho phép."
    });
  }

  const timestampValidation = validateCallbackTimestamp(
    timestamp,
    input.now ?? new Date(),
    secretResult.keyId
  );

  if (timestampValidation) {
    return timestampValidation;
  }

  const expectedSignature = buildRecordTransferCallbackSignature({
    secret: secretResult.secret,
    timestamp,
    recordTransferId: input.recordTransferId,
    body: input.body
  });

  if (!safeEqual(receivedSignature, expectedSignature)) {
    return signatureInvalidFailure({
      timestamp,
      keyId: secretResult.keyId,
      message: "Chữ ký callback không khớp payload tiếp nhận."
    });
  }

  return {
    required: true,
    verified: true,
    algorithm: signatureAlgorithm,
    timestamp,
    keyId: secretResult.keyId
  };
}
