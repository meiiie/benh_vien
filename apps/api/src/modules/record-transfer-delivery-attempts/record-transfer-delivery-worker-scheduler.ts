import {
  defaultIntervalMs,
  normalizePositiveInteger
} from "./record-transfer-delivery-worker.config.js";
import { processQueuedRecordTransferDeliveries } from "./record-transfer-delivery-worker-processor.js";
import type {
  RecordTransferDeliveryWorkerDependencies,
  StartedRecordTransferDeliveryWorker,
  StartRecordTransferDeliveryWorkerInput
} from "./record-transfer-delivery-worker.types.js";

export function startRecordTransferDeliveryWorker(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  input: StartRecordTransferDeliveryWorkerInput = {}
): StartedRecordTransferDeliveryWorker {
  const intervalMs = normalizePositiveInteger(
    input.intervalMs ?? defaultIntervalMs,
    "intervalMs"
  );
  let isRunning = false;

  const runOnce = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const result = await processQueuedRecordTransferDeliveries(dependencies, input);

      if (result.deliveredCount > 0 || result.failedCount > 0) {
        input.logger?.info?.(
          { result },
          "Record transfer delivery worker processed queued attempts."
        );
      }
    } catch (error) {
      input.logger?.error?.(
        { err: error },
        "Record transfer delivery worker failed to process queued attempts."
      );
    } finally {
      isRunning = false;
    }
  };

  const timer = setInterval(() => {
    void runOnce();
  }, intervalMs);

  timer.unref?.();

  if (input.runImmediately) {
    void runOnce();
  }

  return {
    close() {
      clearInterval(timer);
    }
  };
}
