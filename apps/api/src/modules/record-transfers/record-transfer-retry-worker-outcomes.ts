import { AuditEvent } from "@benh-vien-so/domain";
import type { RecordTransfer } from "@benh-vien-so/domain";
import type { RecordTransferRetryWorkerDependencies } from "./record-transfer-retry-worker.types.js";

export async function deadLetterDueRecordTransfer(input: {
  readonly dependencies: RecordTransferRetryWorkerDependencies;
  readonly recordTransfer: RecordTransfer;
  readonly dueAt: Date;
  readonly checkedAt: string;
  readonly actorId: string;
  readonly maxRetryCount: number;
}): Promise<string> {
  const before = input.recordTransfer.toSnapshot();

  input.recordTransfer.markDeadLettered({
    deadLetteredAt: input.checkedAt,
    note: "Retry worker đưa hồ sơ vào hàng lỗi cuối sau khi vượt quá số lần thử gửi."
  });
  await input.dependencies.recordTransferRepository.save(input.recordTransfer);

  const after = input.recordTransfer.toSnapshot();
  await saveRetryWorkerAuditEvent(input.dependencies, {
    occurredAt: input.dueAt,
    actorId: input.actorId,
    action: "record-transfer.dead-letter",
    resourceId: after.id,
    patientId: after.patientId,
    metadata: {
      status: after.status,
      retryCount: after.retryCount,
      maxRetryCount: input.maxRetryCount,
      scheduledRetryAt: before.nextRetryAt,
      previousFailureReason: before.failureReason,
      deadLetteredAt: after.deadLetteredAt,
      recipientOrganizationId: after.recipientOrganizationId
    }
  });

  return after.id;
}

export async function retryDueRecordTransfer(input: {
  readonly dependencies: RecordTransferRetryWorkerDependencies;
  readonly recordTransfer: RecordTransfer;
  readonly dueAt: Date;
  readonly checkedAt: string;
  readonly actorId: string;
}): Promise<string> {
  const before = input.recordTransfer.toSnapshot();

  input.recordTransfer.retry({
    retryAt: input.checkedAt,
    note: "Retry worker đưa lại gói hồ sơ vào hàng đợi gửi."
  });
  await input.dependencies.recordTransferRepository.save(input.recordTransfer);

  const after = input.recordTransfer.toSnapshot();
  await saveRetryWorkerAuditEvent(input.dependencies, {
    occurredAt: input.dueAt,
    actorId: input.actorId,
    action: "record-transfer.retry",
    resourceId: after.id,
    patientId: after.patientId,
    metadata: {
      status: after.status,
      retryCount: after.retryCount,
      scheduledRetryAt: before.nextRetryAt,
      previousFailureReason: before.failureReason,
      recipientOrganizationId: after.recipientOrganizationId
    }
  });

  return after.id;
}

async function saveRetryWorkerAuditEvent(
  dependencies: RecordTransferRetryWorkerDependencies,
  input: {
    readonly occurredAt: Date;
    readonly actorId: string;
    readonly action: "record-transfer.dead-letter" | "record-transfer.retry";
    readonly resourceId: string;
    readonly patientId: string;
    readonly metadata: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await dependencies.auditRepository.save(
      AuditEvent.record({
        occurredAt: input.occurredAt,
        actorId: input.actorId,
        action: input.action,
        resourceType: "RecordTransfer",
        resourceId: input.resourceId,
        patientId: input.patientId,
        purposeOfUse: "OPERATIONS",
        metadata: {
          actorRole: "system",
          worker: "record-transfer-retry-worker",
          mode: "scheduled",
          ...input.metadata
        }
      })
    );
  } catch {
    // Trạng thái nghiệp vụ đã lưu thành công; không báo sai là skipped.
  }
}
