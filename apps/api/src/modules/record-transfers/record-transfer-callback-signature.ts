import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

export const recordTransferCallbackTimestampHeader =
  "x-wiiicare-callback-timestamp";
export const recordTransferCallbackSignatureHeader =
  "x-wiiicare-callback-signature";

const callbackSecretEnv = "BVS_RECORD_TRANSFER_CALLBACK_SECRET";
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
    }
  | {
      readonly required: true;
      readonly verified: true;
      readonly algorithm: typeof signatureAlgorithm;
      readonly timestamp: string;
    }
  | {
      readonly required: true;
      readonly verified: false;
      readonly algorithm?: typeof signatureAlgorithm;
      readonly timestamp?: string;
      readonly statusCode: 403 | 503;
      readonly error: string;
      readonly message: string;
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
  const secretResult = readCallbackSecret();

  if ("error" in secretResult) {
    return {
      required: true,
      verified: false,
      statusCode: 503,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED",
      message: secretResult.error
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
      statusCode: 403,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
      message: "Chữ ký callback không khớp payload tiếp nhận."
    };
  }

  return {
    required: true,
    verified: true,
    algorithm: signatureAlgorithm,
    timestamp
  };
}

function buildSignaturePayload(
  timestamp: string,
  recordTransferId: string,
  body: unknown
): string {
  return `${timestamp}.${recordTransferId}.${canonicalJson(body ?? {})}`;
}

function readCallbackSecret():
  | { readonly secret: string | undefined }
  | { readonly error: string } {
  const secret = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return {
        error: `${callbackSecretEnv} phải được cấu hình tối thiểu ${minSecretLength} ký tự trong production.`
      };
    }

    return {
      secret: undefined
    };
  }

  if (secret.length < minSecretLength) {
    return {
      error: `${callbackSecretEnv} phải dài tối thiểu ${minSecretLength} ký tự.`
    };
  }

  if (process.env.NODE_ENV === "production" && isPlaceholderSecret(secret)) {
    return {
      error: `${callbackSecretEnv} không được dùng giá trị mẫu trong production.`
    };
  }

  return {
    secret
  };
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
