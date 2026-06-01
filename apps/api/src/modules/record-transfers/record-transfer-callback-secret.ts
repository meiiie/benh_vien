import type { IncomingHttpHeaders } from "node:http";
import { readSingleHeader } from "./record-transfer-callback-headers.js";
import {
  callbackSecretEnv,
  callbackSecretsJsonEnv,
  recordTransferCallbackKeyIdHeader
} from "./record-transfer-callback-signature.constants.js";
import {
  assertCallbackSecretsByKeyId,
  missingProductionSecretMessage,
  parseCallbackSecretsByKeyId,
  validateCallbackSecret
} from "./record-transfer-callback-secret-validation.js";
import type { CallbackSecretLookup } from "./record-transfer-callback-signature.types.js";

export function assertRecordTransferCallbackSignatureConfiguration(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secretsByKeyId = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON?.trim();

  if (secretsByKeyId) {
    assertCallbackSecretsByKeyId(secretsByKeyId);
    return;
  }

  const secret = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET?.trim();

  if (!secret) {
    throw new Error(missingProductionSecretMessage());
  }

  const secretValidation = validateCallbackSecret(secret, callbackSecretEnv);

  if (secretValidation) {
    throw new Error(secretValidation.error);
  }
}

export function readCallbackSecret(headers: IncomingHttpHeaders): CallbackSecretLookup {
  const secretsByKeyId = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON?.trim();

  if (secretsByKeyId) {
    return readCallbackSecretByKeyId(headers, secretsByKeyId);
  }

  const secret = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return {
        error: missingProductionSecretMessage(),
        errorCode: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
        statusCode: 503
      };
    }

    return {
      secret: undefined
    };
  }

  const secretValidation = validateCallbackSecret(secret, callbackSecretEnv);

  if (secretValidation) {
    return secretValidation;
  }

  return {
    secret
  };
}

function readCallbackSecretByKeyId(
  headers: IncomingHttpHeaders,
  rawSecretsByKeyId: string
): CallbackSecretLookup {
  const keyId = readSingleHeader(headers[recordTransferCallbackKeyIdHeader])?.trim();

  if (!keyId) {
    return {
      error: "Callback xác nhận nhận hồ sơ phải gửi key id của gateway.",
      errorCode: "RECORD_TRANSFER_CALLBACK_KEY_ID_REQUIRED",
      statusCode: 403
    };
  }

  const parsedSecrets = parseCallbackSecretsByKeyId(rawSecretsByKeyId);

  if ("error" in parsedSecrets) {
    return {
      ...parsedSecrets,
      keyId
    };
  }

  const secret = parsedSecrets.secrets[keyId]?.trim();

  if (!secret) {
    return {
      error: "Key id của callback không khớp gateway đã cấu hình.",
      errorCode: "RECORD_TRANSFER_CALLBACK_KEY_ID_UNKNOWN",
      statusCode: 403,
      keyId
    };
  }

  const secretValidation = validateCallbackSecret(secret, callbackSecretsJsonEnv);

  if (secretValidation) {
    return {
      ...secretValidation,
      keyId
    };
  }

  return {
    secret,
    keyId
  };
}
