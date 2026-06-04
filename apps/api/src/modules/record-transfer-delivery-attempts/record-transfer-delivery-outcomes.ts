import { AuditEvent } from "@benh-vien-so/domain";
import type {
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "@benh-vien-so/domain";
import { truncatePreview } from "./record-transfer-delivery-format.js";
import type { RecordTransferDeliveryWorkerDependencies } from "./record-transfer-delivery-worker.types.js";

export async function markDeliveryAttemptSucceeded(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  recordTransfer: RecordTransfer,
  attempt: RecordTransferDeliveryAttempt,
  completedAt: Date,
  actorId: string,
  sendResult: {
    readonly httpStatus: number;
    readonly responseBodyPreview?: string;
  }
): Promise<void> {
  attempt.markSucceeded({
    completedAt: completedAt.toISOString(),
    httpStatus: sendResult.httpStatus,
    responseBodyPreview: truncatePreview(sendResult.responseBodyPreview)
  });
  await dependencies.deliveryAttemptRepository.save(attempt);
  await recordDeliveryAuditEvent(dependencies, recordTransfer, attempt, completedAt, actorId, {
    deliveryStatus: "succeeded",
    httpStatus: sendResult.httpStatus
  });
}

export async function failDeliveryAttemptOnly(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  attempt: RecordTransferDeliveryAttempt,
  completedAt: Date,
  input: {
    readonly errorMessage: string;
    readonly httpStatus?: number;
    readonly responseBodyPreview?: string;
  }
): Promise<void> {
  attempt.markFailed({
    completedAt: completedAt.toISOString(),
    httpStatus: input.httpStatus,
    responseBodyPreview: truncatePreview(input.responseBodyPreview),
    errorMessage: input.errorMessage
  });
  await dependencies.deliveryAttemptRepository.save(attempt);
}

export async function failDeliveryAttemptAndTransfer(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  recordTransfer: RecordTransfer,
  attempt: RecordTransferDeliveryAttempt,
  completedAt: Date,
  actorId: string,
  input: {
    readonly errorMessage: string;
    readonly httpStatus?: number;
    readonly responseBodyPreview?: string;
    readonly retryDelayMs: number;
  }
): Promise<void> {
  await failDeliveryAttemptOnly(dependencies, attempt, completedAt, input);

  const nextRetryAt = new Date(completedAt.getTime() + input.retryDelayMs).toISOString();
  recordTransfer.markFailed({
    failedAt: completedAt.toISOString(),
    failureReason: input.errorMessage,
    nextRetryAt,
    note: "Delivery worker ghi nhận lỗi khi gửi FHIR Bundle sang endpoint đích."
  });
  await dependencies.recordTransferRepository.save(recordTransfer);
  await recordDeliveryAuditEvent(dependencies, recordTransfer, attempt, completedAt, actorId, {
    deliveryStatus: "failed",
    httpStatus: input.httpStatus,
    nextRetryAt,
    errorMessage: input.errorMessage
  });
}

export function isSuccessfulHttpStatus(value: number | undefined): value is number {
  return typeof value === "number" && value >= 200 && value <= 299;
}

async function recordDeliveryAuditEvent(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  recordTransfer: RecordTransfer,
  attempt: RecordTransferDeliveryAttempt,
  occurredAt: Date,
  actorId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const transferSnapshot = recordTransfer.toSnapshot();
  const attemptSnapshot = attempt.toSnapshot();

  await dependencies.auditRepository.save(
    AuditEvent.record({
      occurredAt,
      actorId,
      action: metadata.deliveryStatus === "failed" ? "record-transfer.fail" : "record-transfer.send",
      resourceType: "RecordTransfer",
      resourceId: transferSnapshot.id,
      patientId: transferSnapshot.patientId,
      purposeOfUse: "OPERATIONS",
      metadata: {
        actorRole: "system",
        worker: "record-transfer-delivery-worker",
        deliveryAttemptId: attemptSnapshot.id,
        deliveryAttemptNumber: attemptSnapshot.attemptNumber,
        targetEndpointId: attemptSnapshot.targetEndpointId,
        targetEndpointAddress: attemptSnapshot.targetEndpointAddress,
        bundleId: attemptSnapshot.bundleId,
        bundleType: attemptSnapshot.bundleType,
        idempotencyKey: attemptSnapshot.idempotencyKey,
        ...metadata
      }
    })
  );
}
