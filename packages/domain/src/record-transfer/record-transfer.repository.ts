import type { RecordTransfer } from "./record-transfer.js";

export type RecordTransferRepository = {
  findByPatientId(patientId: string): Promise<RecordTransfer[]>;
  findById(id: string): Promise<RecordTransfer | undefined>;
  save(recordTransfer: RecordTransfer): Promise<void>;
};
