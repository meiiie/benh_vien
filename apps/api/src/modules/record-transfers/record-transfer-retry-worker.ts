import { AuditEvent } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";

export type RecordTransferRetryWorkerDependencies = {
  readonly recordTransferRepository: RecordTransferRepository;
  readonly auditRepository: AuditEventRepository;
};

export type ProcessDueRecordTransferRetriesInput = {
  readonly dueAt?: Date;
  readonly limit?: number;
  readonly maxRetryCount?: number;
  readonly actorId?: string;
};

export type ProcessDueRecordTransferRetriesResult = {
  readonly status: "ok";
  readonly checkedAt: string;
  readonly dueCount: number;
  readonly retriedCount: number;
  readonly deadLetteredCount: number;
  readonly skippedCount: number;
  readonly retriedTransferIds: readonly string[];
  readonly deadLetteredTransferIds: readonly string[];
  readonly skippedTransferIds: readonly string[];
};

export type StartRecordTransferRetryWorkerInput = ProcessDueRecordTransferRetriesInput & {
  readonly intervalMs?: number;
  readonly runImmediately?: boolean;
  readonly logger?: RecordTransferRetryWorkerLogger;
};

export type StartedRecordTransferRetryWorker = {
  close(): void;
};

type RecordTransferRetryWorkerLogger = {
  info?(payload: Record<string, unknown>, message: string): void;
  error?(payload: Record<string, unknown>, message: string): void;
};

const defaultLimit = 25;
const defaultMaxRetryCount = 3;
const defaultIntervalMs = 60_000;
const defaultWorkerActorId = "system:record-transfer-retry-worker";

export async function processDueRecordTransferRetries(
  dependencies: RecordTransferRetryWorkerDependencies,
  input: ProcessDueRecordTransferRetriesInput = {}
): Promise<ProcessDueRecordTransferRetriesResult> {
  const dueAt = normalizeDate(input.dueAt ?? new Date(), "dueAt");
  const checkedAt = dueAt.toISOString();
  const limit = normalizePositiveInteger(input.limit ?? defaultLimit, "limit");
  const maxRetryCount = normalizePositiveInteger(
    input.maxRetryCount ?? defaultMaxRetryCount,
    "maxRetryCount"
  );
  const actorId = input.actorId?.trim() || defaultWorkerActorId;
  const dueDeadLetterTransfers = await dependencies.recordTransferRepository.findDueDeadLetters({
    dueAt: checkedAt,
    limit,
    maxRetryCount
  });
  const remainingRetryLimit = Math.max(limit - dueDeadLetterTransfers.length, 0);
  const dueTransfers =
    remainingRetryLimit > 0
      ? await dependencies.recordTransferRepository.findDueRetries({
          dueAt: checkedAt,
          limit: remainingRetryLimit,
          maxRetryCount
        })
      : [];
  const retriedTransferIds: string[] = [];
  const deadLetteredTransferIds: string[] = [];
  const skippedTransferIds: string[] = [];

  for (const recordTransfer of dueDeadLetterTransfers) {
    const before = recordTransfer.toSnapshot();

    try {
      recordTransfer.markDeadLettered({
        deadLetteredAt: checkedAt,
        note: "Retry worker đưa hồ sơ vào hàng lỗi cuối sau khi vượt quá số lần thử gửi."
      });
      await dependencies.recordTransferRepository.save(recordTransfer);

      const after = recordTransfer.toSnapshot();
      deadLetteredTransferIds.push(after.id);
      try {
        await dependencies.auditRepository.save(
          AuditEvent.record({
            occurredAt: dueAt,
            actorId,
            action: "record-transfer.dead-letter",
            resourceType: "RecordTransfer",
            resourceId: after.id,
            patientId: after.patientId,
            purposeOfUse: "OPERATIONS",
            metadata: {
              actorRole: "system",
              worker: "record-transfer-retry-worker",
              mode: "scheduled",
              status: after.status,
              retryCount: after.retryCount,
              maxRetryCount,
              scheduledRetryAt: before.nextRetryAt,
              previousFailureReason: before.failureReason,
              deadLetteredAt: after.deadLetteredAt,
              recipientOrganizationId: after.recipientOrganizationId
            }
          })
        );
      } catch {
        // Trạng thái nghiệp vụ đã lưu thành công; không báo sai là skipped.
      }
    } catch {
      skippedTransferIds.push(before.id);
    }
  }

  for (const recordTransfer of dueTransfers) {
    const before = recordTransfer.toSnapshot();

    try {
      recordTransfer.retry({
        retryAt: checkedAt,
        note: "Retry worker đưa lại gói hồ sơ vào hàng đợi gửi."
      });
      await dependencies.recordTransferRepository.save(recordTransfer);

      const after = recordTransfer.toSnapshot();
      retriedTransferIds.push(after.id);
      try {
        await dependencies.auditRepository.save(
          AuditEvent.record({
            occurredAt: dueAt,
            actorId,
            action: "record-transfer.retry",
            resourceType: "RecordTransfer",
            resourceId: after.id,
            patientId: after.patientId,
            purposeOfUse: "OPERATIONS",
            metadata: {
              actorRole: "system",
              worker: "record-transfer-retry-worker",
              mode: "scheduled",
              status: after.status,
              retryCount: after.retryCount,
              scheduledRetryAt: before.nextRetryAt,
              previousFailureReason: before.failureReason,
              recipientOrganizationId: after.recipientOrganizationId
            }
          })
        );
      } catch {
        // Trạng thái nghiệp vụ đã lưu thành công; không báo sai là skipped.
      }
    } catch {
      skippedTransferIds.push(before.id);
    }
  }

  return {
    status: "ok",
    checkedAt,
    dueCount: dueDeadLetterTransfers.length + dueTransfers.length,
    retriedCount: retriedTransferIds.length,
    deadLetteredCount: deadLetteredTransferIds.length,
    skippedCount: skippedTransferIds.length,
    retriedTransferIds,
    deadLetteredTransferIds,
    skippedTransferIds
  };
}

export function startRecordTransferRetryWorker(
  dependencies: RecordTransferRetryWorkerDependencies,
  input: StartRecordTransferRetryWorkerInput = {}
): StartedRecordTransferRetryWorker {
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

function normalizeDate(value: Date, name: string): Date {
  if (Number.isNaN(value.getTime())) {
    throw new Error(`${name} must be a valid Date.`);
  }

  return value;
}

function normalizePositiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}
