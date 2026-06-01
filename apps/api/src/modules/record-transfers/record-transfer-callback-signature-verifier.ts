import type { IncomingHttpHeaders } from "node:http";
import { readCallbackSecret } from "./record-transfer-callback-secret.js";
import { toSecretLookupFailure } from "./record-transfer-callback-secret-failure.js";
import { signatureAlgorithm } from "./record-transfer-callback-signature.constants.js";
import { buildRecordTransferCallbackSignature } from "./record-transfer-callback-signature-builder.js";
import { callbackSignatureMismatchMessage } from "./record-transfer-callback-signature-failure-catalog.js";
import { signatureInvalidFailure } from "./record-transfer-callback-signature-failures.js";
import { readReceivedCallbackSignature } from "./record-transfer-callback-signature-received.js";
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

  const receivedSignatureResult = readReceivedCallbackSignature({
    headers: input.headers,
    keyId: secretResult.keyId
  });

  if (!receivedSignatureResult.ok) {
    return receivedSignatureResult.failure;
  }

  const timestampValidation = validateCallbackTimestamp(
    receivedSignatureResult.timestamp,
    input.now ?? new Date(),
    secretResult.keyId
  );

  if (timestampValidation) {
    return timestampValidation;
  }

  const expectedSignature = buildRecordTransferCallbackSignature({
    secret: secretResult.secret,
    timestamp: receivedSignatureResult.timestamp,
    recordTransferId: input.recordTransferId,
    body: input.body
  });

  if (!safeEqual(receivedSignatureResult.receivedSignature, expectedSignature)) {
    return signatureInvalidFailure({
      timestamp: receivedSignatureResult.timestamp,
      keyId: secretResult.keyId,
      message: callbackSignatureMismatchMessage
    });
  }

  return {
    required: true,
    verified: true,
    algorithm: signatureAlgorithm,
    timestamp: receivedSignatureResult.timestamp,
    keyId: secretResult.keyId
  };
}
