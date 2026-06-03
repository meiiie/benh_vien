import { RecordTransfer } from "./record-transfer.js";

type RecordTransferCreateInput = Parameters<typeof RecordTransfer.create>[0];

export function createRecordTransferInput(
  overrides: Partial<RecordTransferCreateInput> = {}
): RecordTransferCreateInput {
  return {
    id: "record-transfer-test-fixture",
    patientId: "patient-test-001",
    bundleType: "document",
    bundleId: "patient-document-patient-test-001",
    sourceOrganizationId: "hospital-source",
    recipientOrganizationId: "hospital-recipient",
    consentReference: "consent-test-001",
    requestedByActorId: "practitioner-test-001",
    reason: "Chuyển hồ sơ để hội chẩn chuyên khoa.",
    requestedAt: "2026-05-28T02:00:00.000Z",
    ...overrides
  };
}

export function createRecordTransfer(
  overrides: Partial<RecordTransferCreateInput> = {}
): RecordTransfer {
  return RecordTransfer.create(createRecordTransferInput(overrides));
}

export function createFailedRecordTransfer(
  overrides: Partial<RecordTransferCreateInput> = {}
): RecordTransfer {
  const transfer = createRecordTransfer(overrides);
  transfer.markSent({
    sentAt: "2026-05-28T02:30:00.000Z"
  });
  transfer.markFailed({
    failedAt: "2026-05-28T02:35:00.000Z",
    failureReason: "Gateway bệnh viện nhận tạm thời không phản hồi.",
    nextRetryAt: "2026-05-28T02:50:00.000Z"
  });
  return transfer;
}
