import type {
  RecordTransfer,
  RecordTransferRepository
} from "@benh-vien-so/domain";

export async function seedRecordTransfersIfEmpty(
  repository: RecordTransferRepository,
  seedRecordTransfers: readonly RecordTransfer[]
): Promise<void> {
  const firstPatientId = seedRecordTransfers[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const recordTransfers = await repository.findByPatientId(firstPatientId);

  if (recordTransfers.length > 0) {
    return;
  }

  for (const recordTransfer of seedRecordTransfers) {
    await repository.save(recordTransfer);
  }
}
