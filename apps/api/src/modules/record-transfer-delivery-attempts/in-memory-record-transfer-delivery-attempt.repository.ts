import { RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";
import type { RecordTransferDeliveryAttemptRepository } from "@benh-vien-so/domain";

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

  async save(attempt: RecordTransferDeliveryAttempt): Promise<void> {
    this.attempts.set(attempt.id, cloneAttempt(attempt));
  }
}

function cloneAttempt(attempt: RecordTransferDeliveryAttempt): RecordTransferDeliveryAttempt {
  return RecordTransferDeliveryAttempt.rehydrate(attempt.toSnapshot());
}
