import type { RecordTransfer } from "./record-transfer.js";

export type FindDueRecordTransferRetriesInput = {
  readonly dueAt: string;
  readonly limit: number;
  readonly maxRetryCount?: number;
};

export type RecordTransferRepository = {
  findByPatientId(patientId: string): Promise<RecordTransfer[]>;
  findById(id: string): Promise<RecordTransfer | undefined>;
  findDueRetries(input: FindDueRecordTransferRetriesInput): Promise<RecordTransfer[]>;
  findDueDeadLetters(input: FindDueRecordTransferRetriesInput): Promise<RecordTransfer[]>;
  save(recordTransfer: RecordTransfer): Promise<void>;
};
