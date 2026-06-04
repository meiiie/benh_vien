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
