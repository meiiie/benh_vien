import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AuditEventsResponse,
  AuditIntegrityReportResponse
} from "../../types/clinical.js";

export function listPatientAuditEvents(
  api: ClinicalApiClient,
  patientId: string
): Promise<AuditEventsResponse> {
  return api.requestJson<AuditEventsResponse>(`/patients/${patientId}/audit-events`, {
    purposeOfUse: "AUDIT"
  });
}

export function listGlobalAuditEvents(
  api: ClinicalApiClient,
  limit = 100
): Promise<AuditEventsResponse> {
  return api.requestJson<AuditEventsResponse>(`/audit-events?limit=${limit}`, {
    purposeOfUse: "AUDIT"
  });
}

export function verifyPatientAuditIntegrity(
  api: ClinicalApiClient,
  patientId: string
): Promise<AuditIntegrityReportResponse> {
  return api.requestJson<AuditIntegrityReportResponse>(
    `/patients/${patientId}/audit-integrity`,
    {
      purposeOfUse: "AUDIT"
    }
  );
}

export function exportPatientAuditFhirBundle(
  api: ClinicalApiClient,
  patientId: string
): Promise<unknown> {
  return api.requestJson<unknown>(`/patients/${patientId}/audit-events/fhir-bundle`, {
    purposeOfUse: "AUDIT"
  });
}
