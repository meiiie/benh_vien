import type { FastifyBaseLogger } from "fastify";
import type {
  RecordTransferDeliveryWorkerConfig,
  RecordTransferRetryWorkerConfig
} from "./runtime-config.js";
import {
  startRecordTransferDeliveryWorker,
  type RecordTransferDeliveryWorkerDependencies
} from "../record-transfer-delivery-attempts/record-transfer-delivery-worker.js";
import {
  startRecordTransferRetryWorker,
  type RecordTransferRetryWorkerDependencies
} from "../record-transfers/record-transfer-retry-worker.js";

export type RecordTransferWorkersConfig = {
  readonly delivery: RecordTransferDeliveryWorkerConfig | undefined;
  readonly retry: RecordTransferRetryWorkerConfig | undefined;
};

export type RecordTransferWorkersDependencies = {
  readonly delivery: RecordTransferDeliveryWorkerDependencies;
  readonly retry: RecordTransferRetryWorkerDependencies;
  readonly logger: FastifyBaseLogger;
};

export type StartedRecordTransferWorkers = {
  readonly deliveryWorkerEnabled: boolean;
  readonly retryWorkerEnabled: boolean;
  close(): void;
};

export function startRecordTransferWorkers(
  dependencies: RecordTransferWorkersDependencies,
  config: RecordTransferWorkersConfig
): StartedRecordTransferWorkers {
  const retryWorker = config.retry
    ? startRecordTransferRetryWorker(dependencies.retry, {
        ...config.retry,
        logger: dependencies.logger
      })
    : undefined;
  const deliveryWorker = config.delivery
    ? startRecordTransferDeliveryWorker(dependencies.delivery, {
        ...config.delivery,
        logger: dependencies.logger
      })
    : undefined;

  return {
    deliveryWorkerEnabled: Boolean(config.delivery),
    retryWorkerEnabled: Boolean(config.retry),
    close() {
      deliveryWorker?.close();
      retryWorker?.close();
    }
  };
}
