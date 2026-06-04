import type { RecordTransferDeliveryAttempt } from "./record-transfer-delivery-attempt.js";

export type FindQueuedRecordTransferDeliveryAttemptsInput = {
  readonly limit: number;
};

export type RecordTransferDeliveryAttemptRepository = {
  findByRecordTransferId(recordTransferId: string): Promise<RecordTransferDeliveryAttempt[]>;
  findQueued(
    input: FindQueuedRecordTransferDeliveryAttemptsInput
  ): Promise<RecordTransferDeliveryAttempt[]>;
  save(attempt: RecordTransferDeliveryAttempt): Promise<void>;
};
