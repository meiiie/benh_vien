import { signatureAlgorithm } from "./record-transfer-callback-signature.constants.js";
import type {
  CallbackSecretLookup,
  CallbackSignatureVerification
} from "./record-transfer-callback-signature.types.js";

export function toSecretLookupFailure(
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

export function signatureRequiredFailure(
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

export function signatureInvalidFailure(input: {
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

export function timestampInvalidFailure(input: {
  readonly timestamp: string;
  readonly keyId: string | undefined;
}): CallbackSignatureVerification {
  return {
    required: true,
    verified: false,
    algorithm: signatureAlgorithm,
    timestamp: input.timestamp,
    keyId: input.keyId,
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_TIMESTAMP_INVALID",
    message: "Timestamp của callback không phải thời điểm ISO-8601 hợp lệ."
  };
}

export function timestampExpiredFailure(input: {
  readonly timestamp: string;
  readonly keyId: string | undefined;
}): CallbackSignatureVerification {
  return {
    required: true,
    verified: false,
    algorithm: signatureAlgorithm,
    timestamp: input.timestamp,
    keyId: input.keyId,
    statusCode: 403,
    error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_EXPIRED",
    message: "Timestamp của callback nằm ngoài cửa sổ chấp nhận 5 phút."
  };
}
