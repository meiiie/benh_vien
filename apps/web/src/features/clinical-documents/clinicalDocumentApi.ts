import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { ClinicalDocument, ClinicalDocumentsResponse } from "../../types/clinical.js";

export type CreateClinicalDocumentCommand = {
  readonly encounterId?: string;
  readonly type: ClinicalDocument["type"];
  readonly title: string;
  readonly storageUri: string;
  readonly attachmentContentType?: string;
  readonly attachmentSizeBytes?: number;
  readonly attachmentHashSha1Base64?: string;
  readonly attachmentCreatedAt?: string;
  readonly authorPractitionerId: string;
};

export function listClinicalDocuments(
  api: ClinicalApiClient,
  patientId: string
): Promise<ClinicalDocumentsResponse> {
  return api.requestJson<ClinicalDocumentsResponse>(`/patients/${patientId}/documents`, {
    purposeOfUse: "TREATMENT"
  });
}

export function exportClinicalDocumentFhir(
  api: ClinicalApiClient,
  documentId: string
): Promise<unknown> {
  return api.requestJson<unknown>(`/clinical-documents/${documentId}/fhir`, {
    purposeOfUse: "TREATMENT"
  });
}

export function exportClinicalDocumentProvenanceFhir(
  api: ClinicalApiClient,
  documentId: string
): Promise<unknown> {
  return api.requestJson<unknown>(`/clinical-documents/${documentId}/provenance/fhir`, {
    purposeOfUse: "TREATMENT"
  });
}

export function createClinicalDocument(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateClinicalDocumentCommand
): Promise<ClinicalDocument> {
  return api.requestJson<ClinicalDocument>(`/patients/${patientId}/documents`, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: command
  });
}

export function signClinicalDocument(
  api: ClinicalApiClient,
  documentId: string
): Promise<ClinicalDocument> {
  return api.requestJson<ClinicalDocument>(`/clinical-documents/${documentId}/sign`, {
    method: "POST",
    purposeOfUse: "TREATMENT"
  });
}
