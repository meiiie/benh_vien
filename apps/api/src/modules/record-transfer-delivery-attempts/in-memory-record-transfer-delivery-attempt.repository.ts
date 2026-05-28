import { RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";
import type {
  FindQueuedRecordTransferDeliveryAttemptsInput,
  RecordTransferDeliveryAttemptRepository
} from "@benh-vien-so/domain";

export class InMemoryRecordTransferDeliveryAttemptRepository
  implements RecordTransferDeliveryAttemptRepository
{
  private readonly attempts = new Map<string, RecordTransferDeliveryAttempt>();

  async findByRecordTransferId(
    recordTransferId: string
  ): Promise<RecordTransferDeliveryAttempt[]> {
    return [...this.attempts.values()]
      .filter((attempt) => attempt.recordTransferId === recordTransferId)
      .sort((left, right) => left.toSnapshot().attemptNumber - right.toSnapshot().attemptNumber)
      .map(cloneAttempt);
  }

  async findQueued(
    input: FindQueuedRecordTransferDeliveryAttemptsInput
  ): Promise<RecordTransferDeliveryAttempt[]> {
    const limit = normalizeLimit(input.limit);

    if (limit === 0) {
      return [];
    }

    return [...this.attempts.values()]
      .filter((attempt) => attempt.toSnapshot().status === "queued")
      .sort((left, right) =>
        left.toSnapshot().queuedAt.localeCompare(right.toSnapshot().queuedAt)
      )
      .slice(0, limit)
      .map(cloneAttempt);
  }

  async save(attempt: RecordTransferDeliveryAttempt): Promise<void> {
    this.attempts.set(attempt.id, cloneAttempt(attempt));
  }
}

function cloneAttempt(attempt: RecordTransferDeliveryAttempt): RecordTransferDeliveryAttempt {
  return RecordTransferDeliveryAttempt.rehydrate(attempt.toSnapshot());
}

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1) {
    return 0;
  }

  return limit;
}
