import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { Consent, ConsentsResponse } from "../../types/consents.js";

export type RevokeConsentCommand = {
  readonly reason: string;
};

export function listPatientConsents(
  api: ClinicalApiClient,
  patientId: string
): Promise<ConsentsResponse> {
  return api.requestJson<ConsentsResponse>(`/patients/${patientId}/consents`, {
    purposeOfUse: "TREATMENT"
  });
}

export function exportConsentFhir(
  api: ClinicalApiClient,
  consentId: string
): Promise<unknown> {
  return api.requestJson<unknown>(`/consents/${consentId}/fhir`, {
    purposeOfUse: "TREATMENT"
  });
}

export function revokePatientConsent(
  api: ClinicalApiClient,
  patientId: string,
  consentId: string,
  command: RevokeConsentCommand
): Promise<Consent> {
  return api.requestJson<Consent>(`/patients/${patientId}/consents/${consentId}/revoke`, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: command
  });
}
