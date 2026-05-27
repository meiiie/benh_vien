import { RecordTransfer } from "@benh-vien-so/domain";
import type { RecordTransferRepository } from "@benh-vien-so/domain";

export class InMemoryRecordTransferRepository implements RecordTransferRepository {
  private readonly recordTransfers = new Map<string, RecordTransfer>();

  constructor(seedRecordTransfers: readonly RecordTransfer[] = []) {
    for (const recordTransfer of seedRecordTransfers) {
      this.recordTransfers.set(recordTransfer.id, cloneRecordTransfer(recordTransfer));
    }
  }

  async findByPatientId(patientId: string): Promise<RecordTransfer[]> {
    return [...this.recordTransfers.values()]
      .filter((recordTransfer) => recordTransfer.patientId === patientId)
      .sort((left, right) =>
        right.toSnapshot().requestedAt.localeCompare(left.toSnapshot().requestedAt)
      )
      .map(cloneRecordTransfer);
  }

  async findById(id: string): Promise<RecordTransfer | undefined> {
    const recordTransfer = this.recordTransfers.get(id);
    return recordTransfer ? cloneRecordTransfer(recordTransfer) : undefined;
  }

  async save(recordTransfer: RecordTransfer): Promise<void> {
    this.recordTransfers.set(recordTransfer.id, cloneRecordTransfer(recordTransfer));
  }
}

export function createSeedRecordTransfers(): RecordTransfer[] {
  return [
    RecordTransfer.create({
      id: "record-transfer-demo-001",
      patientId: "patient-demo-001",
      status: "ready",
      priority: "urgent",
      bundleType: "document",
      bundleId: "patient-document-patient-demo-001",
      sourceOrganizationId: "hospital-hai-phong-demo",
      recipientOrganizationId: "hospital-hai-phong-referral",
      consentReference: "consent-demo-transfer-001",
      requestedByActorId: "practitioner-demo-001",
      reason: "Chuyển hồ sơ sang bệnh viện tiếp nhận để theo dõi tim mạch sau cấp cứu.",
      requestedAt: "2026-05-27T03:15:00.000Z",
      note: "Gói chuyển viện dùng FHIR document Bundle, có Composition làm mục lục lâm sàng."
    })
  ];
}

function cloneRecordTransfer(recordTransfer: RecordTransfer): RecordTransfer {
  return RecordTransfer.rehydrate(recordTransfer.toSnapshot());
}
