import { isLocalOnlyHostname } from "../network/local-only-hostname.js";

export type RecordTransferRetryWorkerConfig = {
  readonly intervalMs: number;
  readonly limit: number;
  readonly maxRetryCount: number;
  readonly runImmediately: boolean;
};

export type RecordTransferDeliveryWorkerConfig = {
  readonly intervalMs: number;
  readonly limit: number;
  readonly timeoutMs: number;
  readonly retryDelayMs: number;
  readonly runImmediately: boolean;
};

const defaultPublicApiBaseUrl = "http://localhost:7310/api/v1";
const defaultHttpBodyLimitBytes = 1_048_576;
const minHttpBodyLimitBytes = 1_024;
const maxHttpBodyLimitBytes = 10 * 1_024 * 1_024;

export function assertRepositoryConfiguration(): void {
  const repository = process.env.BVS_REPOSITORY ?? "in-memory";

  if (repository !== "postgres" && repository !== "in-memory") {
    throw new Error("BVS_REPOSITORY must be either 'postgres' or 'in-memory'.");
  }

  if (process.env.NODE_ENV === "production" && repository !== "postgres") {
    throw new Error("BVS_REPOSITORY must be 'postgres' in production.");
  }
}

export function resolvePublicApiBaseUrl(): string {
  const rawValue = process.env.BVS_PUBLIC_API_BASE_URL?.trim();

  if (!rawValue) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BVS_PUBLIC_API_BASE_URL must be set in production.");
    }

    return defaultPublicApiBaseUrl;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error("BVS_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  }

  if (parsedUrl.search || parsedUrl.hash) {
    throw new Error("BVS_PUBLIC_API_BASE_URL must not include query or fragment.");
  }

  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("BVS_PUBLIC_API_BASE_URL must use HTTPS in production.");
  }

  if (process.env.NODE_ENV === "production" && isLocalOnlyHostname(parsedUrl.hostname)) {
    throw new Error(
      "BVS_PUBLIC_API_BASE_URL must not use localhost, loopback, private or link-local hosts in production."
    );
  }

  return rawValue.replace(/\/+$/, "");
}

export function resolveHttpBodyLimitBytes(): number {
  return readBoundedIntegerEnv(
    "BVS_HTTP_BODY_LIMIT_BYTES",
    defaultHttpBodyLimitBytes,
    minHttpBodyLimitBytes,
    maxHttpBodyLimitBytes
  );
}

export function resolveApiDocsEnabled(): boolean {
  return readBooleanEnv("BVS_API_DOCS_ENABLED", process.env.NODE_ENV !== "production");
}

export function resolveCorsOrigins(): boolean | string[] {
  const configuredOrigins = process.env.BVS_CORS_ORIGINS;

  if (configuredOrigins) {
    const origins = configuredOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (origins.length > 0) {
      if (process.env.NODE_ENV === "production") {
        assertProductionCorsOrigins(origins);
      }

      return origins;
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BVS_CORS_ORIGINS must be set in production.");
  }

  return true;
}

export function resolveRecordTransferRetryWorkerConfig():
  | RecordTransferRetryWorkerConfig
  | undefined {
  const enabled = process.env.BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED?.trim();

  if (!enabled || enabled === "false") {
    return undefined;
  }

  if (enabled !== "true") {
    throw new Error(
      "BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED must be either 'true' or 'false'."
    );
  }

  return {
    intervalMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_RETRY_WORKER_INTERVAL_SECONDS", 60) *
      1000,
    limit: readPositiveIntegerEnv("BVS_RECORD_TRANSFER_RETRY_WORKER_LIMIT", 25),
    maxRetryCount: readPositiveIntegerEnv(
      "BVS_RECORD_TRANSFER_RETRY_WORKER_MAX_RETRY_COUNT",
      3
    ),
    runImmediately: readBooleanEnv(
      "BVS_RECORD_TRANSFER_RETRY_WORKER_RUN_IMMEDIATELY",
      false
    )
  };
}

export function resolveRecordTransferDeliveryWorkerConfig():
  | RecordTransferDeliveryWorkerConfig
  | undefined {
  const enabled = process.env.BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED?.trim();

  if (!enabled || enabled === "false") {
    return undefined;
  }

  if (enabled !== "true") {
    throw new Error(
      "BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED must be either 'true' or 'false'."
    );
  }

  return {
    intervalMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_INTERVAL_SECONDS", 60) *
      1000,
    limit: readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_LIMIT", 10),
    timeoutMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_TIMEOUT_SECONDS", 15) *
      1000,
    retryDelayMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_RETRY_DELAY_SECONDS", 300) *
      1000,
    runImmediately: readBooleanEnv(
      "BVS_RECORD_TRANSFER_DELIVERY_WORKER_RUN_IMMEDIATELY",
      false
    )
  };
}

function readPositiveIntegerEnv(name: string, defaultValue: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function readBoundedIntegerEnv(
  name: string,
  defaultValue: number,
  minValue: number,
  maxValue: number
): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < minValue || value > maxValue) {
    throw new Error(`${name} must be an integer between ${minValue} and ${maxValue}.`);
  }

  return value;
}

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`${name} must be either 'true' or 'false'.`);
}

function assertProductionCorsOrigins(origins: readonly string[]): void {
  for (const origin of origins) {
    if (origin === "*") {
      throw new Error("BVS_CORS_ORIGINS must not include wildcard '*' in production.");
    }

    let parsedOrigin: URL;

    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error("BVS_CORS_ORIGINS must contain valid URL origins in production.");
    }

    if (parsedOrigin.origin !== origin || parsedOrigin.protocol !== "https:") {
      throw new Error(
        "BVS_CORS_ORIGINS must contain canonical HTTPS origins in production."
      );
    }

    if (isLocalOnlyHostname(parsedOrigin.hostname)) {
      throw new Error(
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      );
    }
  }
}
