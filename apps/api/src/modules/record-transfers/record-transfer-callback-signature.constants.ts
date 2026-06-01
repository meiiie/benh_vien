import type { CallbackSignatureAlgorithm } from "./record-transfer-callback-signature.types.js";

export const recordTransferCallbackTimestampHeader =
  "x-wiiicare-callback-timestamp";
export const recordTransferCallbackSignatureHeader =
  "x-wiiicare-callback-signature";
export const recordTransferCallbackKeyIdHeader = "x-wiiicare-callback-key-id";

export const callbackSecretEnv = "BVS_RECORD_TRANSFER_CALLBACK_SECRET";
export const callbackSecretsJsonEnv = "BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON";
export const minSecretLength = 32;
export const maxCallbackClockSkewMs = 5 * 60 * 1000;
export const maxSignatureLength = 128;
export const signatureAlgorithm: CallbackSignatureAlgorithm = "HMAC-SHA256";
