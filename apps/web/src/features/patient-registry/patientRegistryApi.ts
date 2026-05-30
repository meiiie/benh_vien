import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  Patient,
  PatientIdentifier,
  PatientsResponse,
  PurposeOfUse
} from "../../types/clinical.js";

type CreatePatientCommand = {
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender: Patient["gender"];
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
};

type MergePatientCommand = {
  readonly targetPatientId: string;
  readonly reason: string;
};

export function listPatients(
  api: ClinicalApiClient,
  purposeOfUse: PurposeOfUse
): Promise<PatientsResponse> {
  return api.requestJson<PatientsResponse>("/patients", {
    purposeOfUse
  });
}

export function createPatient(
  api: ClinicalApiClient,
  command: CreatePatientCommand
): Promise<Patient> {
  return api.requestJson<Patient>("/patients", {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: command
  });
}

export function mergePatient(
  api: ClinicalApiClient,
  patientId: string,
  command: MergePatientCommand
): Promise<Patient> {
  return api.requestJson<Patient>(`/patients/${patientId}/merge`, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: command
  });
}

export function exportPatientFhir(
  api: ClinicalApiClient,
  patientId: string,
  purposeOfUse: PurposeOfUse
): Promise<unknown> {
  return api.requestJson<unknown>(`/patients/${patientId}/fhir`, {
    purposeOfUse
  });
}

export function exportPatientFhirBundle(
  api: ClinicalApiClient,
  patientId: string
): Promise<unknown> {
  return api.requestJson<unknown>(`/patients/${patientId}/fhir-bundle`, {
    purposeOfUse: "TREATMENT"
  });
}

export function exportPatientFhirDocumentBundle(
  api: ClinicalApiClient,
  patientId: string
): Promise<unknown> {
  return api.requestJson<unknown>(`/patients/${patientId}/fhir-document-bundle`, {
    purposeOfUse: "TREATMENT"
  });
}
