import { signatureAlgorithm } from "./record-transfer-callback-signature.constants.js";
import { callbackSignatureFailureCatalog } from "./record-transfer-callback-signature-failure-catalog.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.types.js";

type CallbackSignatureCatalogFailure =
  (typeof callbackSignatureFailureCatalog)[keyof typeof callbackSignatureFailureCatalog];

export function signatureRequiredFailure(
  keyId: string | undefined
): CallbackSignatureVerification {
  return toCallbackSignatureFailure({
    failure: callbackSignatureFailureCatalog.signatureRequired,
    keyId
  });
}

export function signatureInvalidFailure(input: {
  readonly timestamp: string;
  readonly keyId: string | undefined;
  readonly message: string;
}): CallbackSignatureVerification {
  return toCallbackSignatureFailure({
    failure: callbackSignatureFailureCatalog.signatureInvalid,
    timestamp: input.timestamp,
    keyId: input.keyId,
    message: input.message
  });
}

export function timestampInvalidFailure(input: {
  readonly timestamp: string;
  readonly keyId: string | undefined;
}): CallbackSignatureVerification {
  return toCallbackSignatureFailure({
    failure: callbackSignatureFailureCatalog.timestampInvalid,
    timestamp: input.timestamp,
    keyId: input.keyId
  });
}

export function timestampExpiredFailure(input: {
  readonly timestamp: string;
  readonly keyId: string | undefined;
}): CallbackSignatureVerification {
  return toCallbackSignatureFailure({
    failure: callbackSignatureFailureCatalog.timestampExpired,
    timestamp: input.timestamp,
    keyId: input.keyId
  });
}

function toCallbackSignatureFailure(input: {
  readonly failure: CallbackSignatureCatalogFailure;
  readonly timestamp?: string;
  readonly keyId: string | undefined;
  readonly message?: string;
}): CallbackSignatureVerification {
  return {
    required: true,
    verified: false,
    algorithm: signatureAlgorithm,
    timestamp: input.timestamp,
    keyId: input.keyId,
    statusCode: input.failure.statusCode,
    error: input.failure.error,
    message: input.message ?? input.failure.message
  };
}
