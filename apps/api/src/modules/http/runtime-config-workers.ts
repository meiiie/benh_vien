import {
  readBooleanEnv,
  readPositiveIntegerEnv
} from "./runtime-config-env.js";

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
