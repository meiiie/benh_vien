import { processRecordTransferDeliveryAttempt } from "./record-transfer-delivery-attempt-processor.js";
import { createRecordTransferDeliveryWorkerRunContext } from "./record-transfer-delivery-worker-context.js";
import type {
  ProcessQueuedRecordTransferDeliveriesInput,
  ProcessQueuedRecordTransferDeliveriesResult,
  RecordTransferDeliveryWorkerDependencies
} from "./record-transfer-delivery-worker.types.js";

export async function processQueuedRecordTransferDeliveries(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  input: ProcessQueuedRecordTransferDeliveriesInput = {}
): Promise<ProcessQueuedRecordTransferDeliveriesResult> {
  const context = createRecordTransferDeliveryWorkerRunContext(dependencies, input);
  const queuedAttempts = await dependencies.deliveryAttemptRepository.findQueued({
    limit: context.limit
  });
  const deliveredAttemptIds: string[] = [];
  const failedAttemptIds: string[] = [];

  for (const attempt of queuedAttempts) {
    const result = await processRecordTransferDeliveryAttempt(
      dependencies,
      attempt,
      context
    );

    if (result.status === "delivered") {
      deliveredAttemptIds.push(result.attemptId);
    } else {
      failedAttemptIds.push(result.attemptId);
    }
  }

  return {
    status: "ok",
    checkedAt: context.checkedAt.toISOString(),
    queuedCount: queuedAttempts.length,
    deliveredCount: deliveredAttemptIds.length,
    failedCount: failedAttemptIds.length,
    deliveredAttemptIds,
    failedAttemptIds
  };
}
