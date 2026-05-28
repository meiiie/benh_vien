import type { RecordTransferDeliveryAttempt } from "./record-transfer-delivery-attempt.js";

export type RecordTransferDeliveryAttemptRepository = {
  findByRecordTransferId(recordTransferId: string): Promise<RecordTransferDeliveryAttempt[]>;
  save(attempt: RecordTransferDeliveryAttempt): Promise<void>;
};
