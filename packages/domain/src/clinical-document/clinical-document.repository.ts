import type { ClinicalDocument } from "./clinical-document.js";

export interface ClinicalDocumentRepository {
  findByPatientId(patientId: string): Promise<ClinicalDocument[]>;
  findById(id: string): Promise<ClinicalDocument | undefined>;
  save(document: ClinicalDocument): Promise<void>;
}
