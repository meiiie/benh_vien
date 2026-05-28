import { ClinicalDocument } from "@benh-vien-so/domain";
import type { ClinicalDocumentRepository } from "@benh-vien-so/domain";

export class InMemoryClinicalDocumentRepository implements ClinicalDocumentRepository {
  private readonly documents = new Map<string, ClinicalDocument>();

  constructor(seedDocuments: readonly ClinicalDocument[] = []) {
    for (const document of seedDocuments) {
      this.documents.set(document.id, cloneDocument(document));
    }
  }

  async findByPatientId(patientId: string): Promise<ClinicalDocument[]> {
    return [...this.documents.values()]
      .filter((document) => document.patientId === patientId)
      .sort((left, right) => right.toSnapshot().createdAt.localeCompare(left.toSnapshot().createdAt))
      .map(cloneDocument);
  }

  async findById(id: string): Promise<ClinicalDocument | undefined> {
    const document = this.documents.get(id);
    return document ? cloneDocument(document) : undefined;
  }

  async save(document: ClinicalDocument): Promise<void> {
    this.documents.set(document.id, cloneDocument(document));
  }
}

export function createSeedClinicalDocuments(): ClinicalDocument[] {
  const dischargeSummary = ClinicalDocument.create({
    id: "clinical-document-demo-001",
    patientId: "patient-demo-001",
    encounterId: "encounter-demo-001",
    type: "discharge-summary",
    title: "Tóm tắt ra viện - Nguyễn Văn An",
    storageUri: "s3://wiiicare-demo/patients/patient-demo-001/discharge-summary.pdf",
    attachmentContentType: "application/pdf",
    attachmentSizeBytes: 245760,
    attachmentHashSha1Base64: "Kb0sBAJESyiK08beYsfPVMQp3xU=",
    attachmentCreatedAt: "2026-05-27T01:55:00.000Z",
    authorPractitionerId: "practitioner-demo-001"
  });

  dischargeSummary.sign(new Date("2026-05-27T02:00:00.000Z"));

  return [
    dischargeSummary,
    ClinicalDocument.create({
      id: "clinical-document-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      type: "lab-report",
      title: "Kết quả xét nghiệm máu ngoại vi",
      storageUri: "s3://wiiicare-demo/patients/patient-demo-001/lab-report.pdf",
      attachmentContentType: "application/pdf",
      attachmentSizeBytes: 98304,
      attachmentHashSha1Base64: "j9xB1pxfa1BIflIHJOu+LZKiaYE=",
      attachmentCreatedAt: "2026-05-27T03:20:00.000Z",
      authorPractitionerId: "practitioner-demo-002"
    }),
    ClinicalDocument.create({
      id: "clinical-document-demo-003",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      type: "ccr",
      title: "Hồ sơ CCR chuyển tuyến nội bộ",
      storageUri: "s3://wiiicare-demo/patients/patient-demo-001/continuity-of-care-record.xml",
      attachmentContentType: "application/xml",
      attachmentSizeBytes: 65536,
      attachmentHashSha1Base64: "kfBteyihVDUWmV1BEx3BsImZcYc=",
      attachmentCreatedAt: "2026-05-27T04:00:00.000Z",
      authorPractitionerId: "practitioner-demo-002"
    })
  ];
}

function cloneDocument(document: ClinicalDocument): ClinicalDocument {
  return ClinicalDocument.rehydrate(document.toSnapshot());
}
