import { createHash } from "node:crypto";
import type {
  ProviderEndpointSnapshot,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { RecordTransfer, RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";

export function buildDeliveryIdempotencyKey(input: {
  readonly recordTransferId: string;
  readonly attemptNumber: number;
  readonly bundleId: string;
  readonly targetEndpointId: string;
  readonly queuedAt: string;
}): string {
  const hash = createHash("sha256")
    .update(
      [
        input.recordTransferId,
        String(input.attemptNumber),
        input.bundleId,
        input.targetEndpointId,
        input.queuedAt
      ].join("|")
    )
    .digest("hex");

  return `wiiicare-record-transfer-${hash}`;
}

type TransactionalRecordTransferRepository = RecordTransferRepository & {
  saveWithDeliveryAttempt(
    recordTransfer: RecordTransfer,
    deliveryAttempt: RecordTransferDeliveryAttempt
  ): Promise<void>;
};

export async function saveRecordTransferWithDeliveryAttempt(
  recordTransferRepository: RecordTransferRepository,
  deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository,
  recordTransfer: RecordTransfer,
  deliveryAttempt: RecordTransferDeliveryAttempt
): Promise<void> {
  if (isTransactionalRecordTransferRepository(recordTransferRepository)) {
    await recordTransferRepository.saveWithDeliveryAttempt(recordTransfer, deliveryAttempt);
    return;
  }

  const previousRecordTransfer = await recordTransferRepository.findById(recordTransfer.id);
  await recordTransferRepository.save(recordTransfer);

  try {
    await deliveryAttemptRepository.save(deliveryAttempt);
  } catch (error) {
    if (previousRecordTransfer) {
      await recordTransferRepository.save(previousRecordTransfer);
    }

    throw error;
  }
}

export async function queueRecordTransferDeliveryAttempt(input: {
  readonly recordTransferRepository: RecordTransferRepository;
  readonly deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository;
  readonly recordTransfer: RecordTransfer;
  readonly targetEndpoint: ProviderEndpointSnapshot;
  readonly id: string;
}): Promise<RecordTransferDeliveryAttempt> {
  const snapshot = input.recordTransfer.toSnapshot();
  const existingAttempts =
    await input.deliveryAttemptRepository.findByRecordTransferId(
      input.recordTransfer.id
    );
  const attemptNumber = existingAttempts.length + 1;
  const queuedAt = snapshot.sentAt ?? new Date().toISOString();
  const deliveryAttempt = RecordTransferDeliveryAttempt.queue({
    id: input.id,
    recordTransferId: snapshot.id,
    patientId: snapshot.patientId,
    targetEndpointId: input.targetEndpoint.id,
    targetEndpointAddress: input.targetEndpoint.address,
    bundleId: snapshot.bundleId,
    bundleType: snapshot.bundleType,
    idempotencyKey: buildDeliveryIdempotencyKey({
      recordTransferId: snapshot.id,
      attemptNumber,
      bundleId: snapshot.bundleId,
      targetEndpointId: input.targetEndpoint.id,
      queuedAt
    }),
    attemptNumber,
    queuedAt
  });

  await saveRecordTransferWithDeliveryAttempt(
    input.recordTransferRepository,
    input.deliveryAttemptRepository,
    input.recordTransfer,
    deliveryAttempt
  );

  return deliveryAttempt;
}

function isTransactionalRecordTransferRepository(
  repository: RecordTransferRepository
): repository is TransactionalRecordTransferRepository {
  return (
    typeof (repository as Partial<TransactionalRecordTransferRepository>)
      .saveWithDeliveryAttempt === "function"
  );
}
