import { timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { readCallbackSecret } from "./record-transfer-callback-secret.js";
import { readSingleHeader } from "./record-transfer-callback-headers.js";
import {
  maxCallbackClockSkewMs,
  maxSignatureLength,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader,
  signatureAlgorithm
} from "./record-transfer-callback-signature.constants.js";
import { buildRecordTransferCallbackSignature } from "./record-transfer-callback-signature-builder.js";
import type {
  CallbackSecretLookup,
  CallbackSignatureVerification
} from "./record-transfer-callback-signature.types.js";

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

function toSecretLookupFailure(
  secretResult: Extract<CallbackSecretLookup, { readonly error: string }>
): CallbackSignatureVerification {
  return {
    required: true,
    verified: false,
    statusCode: secretResult.statusCode,
    error: secretResult.errorCode,
    message: secretResult.error,
    keyId: secretResult.keyId
  };
}

function signatureRequiredFailure(
  keyId: string | undefined
): CallbackSignatureVerification {
  return {
    required: true,
    verified: false,
    algorithm: signatureAlgorithm,
    keyId,
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED",
    message:
      "Callback xác nhận nhận hồ sơ phải có timestamp và chữ ký HMAC hợp lệ."
  };
}

function signatureInvalidFailure(input: {
  readonly timestamp: string;
  readonly keyId: string | undefined;
  readonly message: string;
}): CallbackSignatureVerification {
  return {
    required: true,
    verified: false,
    algorithm: signatureAlgorithm,
    timestamp: input.timestamp,
    keyId: input.keyId,
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
    message: input.message
  };
}

function validateCallbackTimestamp(
  timestamp: string,
  now: Date,
  keyId: string | undefined
): CallbackSignatureVerification | undefined {
  const timestampMs = Date.parse(timestamp);
  const nowMs = now.getTime();

  if (!Number.isFinite(timestampMs)) {
    return {
      required: true,
      verified: false,
      algorithm: signatureAlgorithm,
      timestamp,
      keyId,
      statusCode: 403,
      error: "RECORD_TRANSFER_CALLBACK_TIMESTAMP_INVALID",
      message: "Timestamp của callback không phải thời điểm ISO-8601 hợp lệ."
    };
  }

  if (Math.abs(nowMs - timestampMs) > maxCallbackClockSkewMs) {
    return {
      required: true,
      verified: false,
      algorithm: signatureAlgorithm,
      timestamp,
      keyId,
      statusCode: 403,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_EXPIRED",
      message: "Timestamp của callback nằm ngoài cửa sổ chấp nhận 5 phút."
    };
  }

  return undefined;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
