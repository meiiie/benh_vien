import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type {
  ClinicalDocument,
  ClinicalDocumentsResponse,
  NewClinicalDocumentForm
} from "../../types/clinical.js";

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
  form: NewClinicalDocumentForm
): Promise<ClinicalDocument> {
  return api.requestJson<ClinicalDocument>(`/patients/${patientId}/documents`, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: {
      encounterId: form.encounterId || undefined,
      type: form.type,
      title: form.title,
      storageUri: form.storageUri.replace("/current/", `/${patientId}/`),
      attachmentContentType: form.attachmentContentType || undefined,
      attachmentSizeBytes: form.attachmentSizeBytes
        ? Number(form.attachmentSizeBytes)
        : undefined,
      attachmentHashSha1Base64: form.attachmentHashSha1Base64 || undefined,
      attachmentCreatedAt: form.attachmentCreatedAt
        ? toApiDateTime(form.attachmentCreatedAt)
        : undefined,
      authorPractitionerId: form.authorPractitionerId
    }
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
