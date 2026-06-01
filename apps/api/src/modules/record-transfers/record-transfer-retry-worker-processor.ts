import {
  defaultMaxRetryCount,
  defaultRetryLimit,
  defaultRetryWorkerActorId,
  normalizeDate,
  normalizePositiveInteger
} from "./record-transfer-retry-worker.config.js";
import {
  deadLetterDueRecordTransfer,
  retryDueRecordTransfer
} from "./record-transfer-retry-worker-outcomes.js";
import type {
  ProcessDueRecordTransferRetriesInput,
  ProcessDueRecordTransferRetriesResult,
  RecordTransferRetryWorkerDependencies
} from "./record-transfer-retry-worker.types.js";

export async function processDueRecordTransferRetries(
  dependencies: RecordTransferRetryWorkerDependencies,
  input: ProcessDueRecordTransferRetriesInput = {}
): Promise<ProcessDueRecordTransferRetriesResult> {
  const dueAt = normalizeDate(input.dueAt ?? new Date(), "dueAt");
  const checkedAt = dueAt.toISOString();
  const limit = normalizePositiveInteger(input.limit ?? defaultRetryLimit, "limit");
  const maxRetryCount = normalizePositiveInteger(
    input.maxRetryCount ?? defaultMaxRetryCount,
    "maxRetryCount"
  );
  const actorId = input.actorId?.trim() || defaultRetryWorkerActorId;
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
    const transferId = recordTransfer.id;

    try {
      deadLetteredTransferIds.push(
        await deadLetterDueRecordTransfer({
          dependencies,
          recordTransfer,
          dueAt,
          checkedAt,
          actorId,
          maxRetryCount
        })
      );
    } catch {
      skippedTransferIds.push(transferId);
    }
  }

  for (const recordTransfer of dueTransfers) {
    const transferId = recordTransfer.id;

    try {
      retriedTransferIds.push(
        await retryDueRecordTransfer({
          dependencies,
          recordTransfer,
          dueAt,
          checkedAt,
          actorId
        })
      );
    } catch {
      skippedTransferIds.push(transferId);
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
