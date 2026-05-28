import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

export const recordTransferCallbackTimestampHeader =
  "x-wiiicare-callback-timestamp";
export const recordTransferCallbackSignatureHeader =
  "x-wiiicare-callback-signature";
export const recordTransferCallbackKeyIdHeader = "x-wiiicare-callback-key-id";

const callbackSecretEnv = "BVS_RECORD_TRANSFER_CALLBACK_SECRET";
const callbackSecretsJsonEnv = "BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON";
const minSecretLength = 32;
const maxCallbackClockSkewMs = 5 * 60 * 1000;
const maxSignatureLength = 128;
const signatureAlgorithm = "HMAC-SHA256";

type CallbackSignatureVerification =
  | {
      readonly required: false;
      readonly verified: false;
      readonly algorithm?: undefined;
      readonly timestamp?: undefined;
      readonly keyId?: undefined;
    }
  | {
      readonly required: true;
      readonly verified: true;
      readonly algorithm: typeof signatureAlgorithm;
      readonly timestamp: string;
      readonly keyId?: string;
    }
  | {
      readonly required: true;
      readonly verified: false;
      readonly algorithm?: typeof signatureAlgorithm;
      readonly timestamp?: string;
      readonly keyId?: string;
      readonly statusCode: 403 | 503;
      readonly error: string;
      readonly message: string;
    };

type CallbackSecretLookup =
  | {
      readonly secret: string | undefined;
      readonly keyId?: string;
    }
  | {
      readonly error: string;
      readonly errorCode: string;
      readonly statusCode: 403 | 503;
      readonly keyId?: string;
    };

export function buildRecordTransferCallbackSignature(input: {
  readonly secret: string;
  readonly timestamp: string;
  readonly recordTransferId: string;
  readonly body: unknown;
}): string {
  return createHmac("sha256", input.secret)
    .update(buildSignaturePayload(input.timestamp, input.recordTransferId, input.body))
    .digest("base64url");
}

export function verifyRecordTransferCallbackSignature(input: {
  readonly headers: IncomingHttpHeaders;
  readonly recordTransferId: string;
  readonly body: unknown;
  readonly now?: Date;
}): CallbackSignatureVerification {
  const secretResult = readCallbackSecret(input.headers);

  if ("error" in secretResult) {
    return {
      required: true,
      verified: false,
      statusCode: secretResult.statusCode,
      error: secretResult.errorCode,
      message: secretResult.error,
      keyId: secretResult.keyId
    };
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
    return {
      required: true,
      verified: false,
      algorithm: signatureAlgorithm,
      keyId: secretResult.keyId,
      statusCode: 403,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED",
      message:
        "Callback xác nhận nhận hồ sơ phải có timestamp và chữ ký HMAC hợp lệ."
    };
  }

  if (receivedSignature.length > maxSignatureLength) {
    return {
      required: true,
      verified: false,
      algorithm: signatureAlgorithm,
      timestamp,
      keyId: secretResult.keyId,
      statusCode: 403,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
      message: "Chữ ký callback vượt quá độ dài cho phép."
    };
  }

  const timestampMs = Date.parse(timestamp);
  const nowMs = (input.now ?? new Date()).getTime();

  if (!Number.isFinite(timestampMs)) {
    return {
      required: true,
      verified: false,
      algorithm: signatureAlgorithm,
      timestamp,
      keyId: secretResult.keyId,
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
      keyId: secretResult.keyId,
      statusCode: 403,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_EXPIRED",
      message: "Timestamp của callback nằm ngoài cửa sổ chấp nhận 5 phút."
    };
  }

  const expectedSignature = buildRecordTransferCallbackSignature({
    secret: secretResult.secret,
    timestamp,
    recordTransferId: input.recordTransferId,
    body: input.body
  });

  if (!safeEqual(receivedSignature, expectedSignature)) {
    return {
      required: true,
      verified: false,
      algorithm: signatureAlgorithm,
      timestamp,
      keyId: secretResult.keyId,
      statusCode: 403,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
      message: "Chữ ký callback không khớp payload tiếp nhận."
    };
  }

  return {
    required: true,
    verified: true,
    algorithm: signatureAlgorithm,
    timestamp,
    keyId: secretResult.keyId
  };
}

export function assertRecordTransferCallbackSignatureConfiguration(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const secretsByKeyId = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON?.trim();

  if (secretsByKeyId) {
    const parsedSecrets = parseCallbackSecretsByKeyId(secretsByKeyId);

    if ("error" in parsedSecrets) {
      throw new Error(parsedSecrets.error);
    }

    for (const [keyId, secret] of Object.entries(parsedSecrets.secrets)) {
      if (!keyId.trim()) {
        throw new Error(`${callbackSecretsJsonEnv} phải dùng key id gateway không rỗng.`);
      }

      const secretValidation = validateCallbackSecret(
        secret.trim(),
        callbackSecretsJsonEnv
      );

      if (secretValidation) {
        throw new Error(secretValidation.error);
      }
    }

    return;
  }

  const secret = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET?.trim();

  if (!secret) {
    throw new Error(
      `${callbackSecretEnv} hoặc ${callbackSecretsJsonEnv} phải được cấu hình tối thiểu ${minSecretLength} ký tự trong production.`
    );
  }

  const secretValidation = validateCallbackSecret(secret, callbackSecretEnv);

  if (secretValidation) {
    throw new Error(secretValidation.error);
  }
}

function buildSignaturePayload(
  timestamp: string,
  recordTransferId: string,
  body: unknown
): string {
  return `${timestamp}.${recordTransferId}.${canonicalJson(body ?? {})}`;
}

function readCallbackSecret(headers: IncomingHttpHeaders): CallbackSecretLookup {
  const secretsByKeyId = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON?.trim();

  if (secretsByKeyId) {
    return readCallbackSecretByKeyId(headers, secretsByKeyId);
  }

  const secret = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return {
        error: `${callbackSecretEnv} hoặc ${callbackSecretsJsonEnv} phải được cấu hình tối thiểu ${minSecretLength} ký tự trong production.`,
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

function parseCallbackSecretsByKeyId(
  rawSecretsByKeyId: string
):
  | { readonly secrets: Record<string, string> }
  | { readonly error: string; readonly errorCode: string; readonly statusCode: 503 } {
  try {
    const parsed = JSON.parse(rawSecretsByKeyId) as unknown;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      Object.keys(parsed).length === 0 ||
      !Object.values(parsed).every((value) => typeof value === "string")
    ) {
      return invalidCallbackSecretsJson();
    }

    return {
      secrets: parsed as Record<string, string>
    };
  } catch {
    return invalidCallbackSecretsJson();
  }
}

function invalidCallbackSecretsJson(): {
  readonly error: string;
  readonly errorCode: string;
  readonly statusCode: 503;
} {
  return {
    error: `${callbackSecretsJsonEnv} phải là JSON object ánh xạ key id gateway sang secret.`,
    errorCode: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
    statusCode: 503
  };
}

function validateCallbackSecret(
  secret: string,
  sourceEnvName: string
): { readonly error: string; readonly errorCode: string; readonly statusCode: 503 } | undefined {
  if (secret.length < minSecretLength) {
    return {
      error: `${sourceEnvName} phải chứa secret dài tối thiểu ${minSecretLength} ký tự.`,
      errorCode: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
      statusCode: 503
    };
  }

  if (process.env.NODE_ENV === "production" && isPlaceholderSecret(secret)) {
    return {
      error: `${sourceEnvName} không được dùng giá trị mẫu trong production.`,
      errorCode: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
      statusCode: 503
    };
  }

  return undefined;
}

function isPlaceholderSecret(secret: string): boolean {
  const normalizedSecret = secret.toLowerCase();

  return normalizedSecret.includes("change-me") || normalizedSecret.includes("dev-only");
}

function readSingleHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, nestedValue]) => [key, sortJsonValue(nestedValue)])
    );
  }

  return value;
}
