import {
  defaultLimit,
  defaultRetryDelayMs,
  defaultTimeoutMs,
  defaultWorkerActorId,
  normalizeDate,
  normalizePositiveInteger
} from "./record-transfer-delivery-worker.config.js";
import { defaultRecordTransferFhirBundleSender } from "./record-transfer-fhir-bundle-sender.js";
import type {
  ProcessQueuedRecordTransferDeliveriesInput,
  RecordTransferDeliveryWorkerDependencies,
  RecordTransferDeliveryWorkerRunContext
} from "./record-transfer-delivery-worker.types.js";

export function createRecordTransferDeliveryWorkerRunContext(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  input: ProcessQueuedRecordTransferDeliveriesInput
): RecordTransferDeliveryWorkerRunContext {
  return {
    checkedAt: normalizeDate(input.checkedAt ?? new Date(), "checkedAt"),
    limit: normalizePositiveInteger(input.limit ?? defaultLimit, "limit"),
    timeoutMs: normalizePositiveInteger(input.timeoutMs ?? defaultTimeoutMs, "timeoutMs"),
    retryDelayMs: normalizePositiveInteger(
      input.retryDelayMs ?? defaultRetryDelayMs,
      "retryDelayMs"
    ),
    actorId: input.actorId?.trim() || defaultWorkerActorId,
    sender: dependencies.sender ?? defaultRecordTransferFhirBundleSender
  };
}
