import {
  defaultRetryIntervalMs,
  normalizePositiveInteger
} from "./record-transfer-retry-worker.config.js";
import { processDueRecordTransferRetries } from "./record-transfer-retry-worker-processor.js";
import type {
  RecordTransferRetryWorkerDependencies,
  StartedRecordTransferRetryWorker,
  StartRecordTransferRetryWorkerInput
} from "./record-transfer-retry-worker.types.js";

export function startRecordTransferRetryWorker(
  dependencies: RecordTransferRetryWorkerDependencies,
  input: StartRecordTransferRetryWorkerInput = {}
): StartedRecordTransferRetryWorker {
  const intervalMs = normalizePositiveInteger(
    input.intervalMs ?? defaultRetryIntervalMs,
    "intervalMs"
  );
  let isRunning = false;

  const runOnce = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const result = await processDueRecordTransferRetries(dependencies, input);

      if (result.retriedCount > 0 || result.deadLetteredCount > 0 || result.skippedCount > 0) {
        input.logger?.info?.(
          { result },
          "Record transfer retry worker processed due transfers."
        );
      }
    } catch (error) {
      input.logger?.error?.(
        { err: error },
        "Record transfer retry worker failed to process due transfers."
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
