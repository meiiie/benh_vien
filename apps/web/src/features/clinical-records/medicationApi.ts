import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  MedicationAdministration,
  MedicationAdministrationsResponse,
  MedicationDispense,
  MedicationDispensesResponse,
  MedicationRequest,
  MedicationRequestsResponse
} from "../../types/medications.js";
import { postTreatmentJson, requestTreatmentJson } from "./clinicalRecordHttp.js";

type CreateMedicationRequestCommand = Pick<
  MedicationRequest,
  "category" | "priority" | "medicationCode" | "dosageInstruction" | "requesterPractitionerId"
> &
  Partial<
    Pick<
      MedicationRequest,
      "encounterId" | "reasonConditionId" | "authoredOn" | "expectedSupplyDurationDays" | "note"
    >
  >;

type CreateMedicationDispenseCommand = Pick<
  MedicationDispense,
  "status" | "category" | "medicationCode"
> &
  Partial<
    Pick<
      MedicationDispense,
      | "encounterId"
      | "medicationRequestId"
      | "quantity"
      | "daysSupply"
      | "whenPrepared"
      | "whenHandedOver"
      | "dispenserPractitionerId"
      | "receiverPractitionerId"
      | "dosageInstruction"
      | "note"
    >
  >;

type CreateMedicationAdministrationCommand = Pick<
  MedicationAdministration,
  "status" | "category" | "medicationCode" | "effectivePeriod" | "performers"
> &
  Partial<
    Pick<
      MedicationAdministration,
      "encounterId" | "medicationRequestId" | "reasonConditionId" | "dosage" | "note"
    >
  >;

export function listMedicationRequests(
  api: ClinicalApiClient,
  patientId: string
): Promise<MedicationRequestsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/medication-requests`);
}

export function createMedicationRequest(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateMedicationRequestCommand
): Promise<MedicationRequest> {
  return postTreatmentJson(api, `/patients/${patientId}/medication-requests`, command);
}

export function exportMedicationRequestFhir(
  api: ClinicalApiClient,
  medicationRequestId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/medication-requests/${medicationRequestId}/fhir`);
}

export function listMedicationDispenses(
  api: ClinicalApiClient,
  patientId: string
): Promise<MedicationDispensesResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/medication-dispenses`);
}

export function createMedicationDispense(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateMedicationDispenseCommand
): Promise<MedicationDispense> {
  return postTreatmentJson(api, `/patients/${patientId}/medication-dispenses`, command);
}

export function exportMedicationDispenseFhir(
  api: ClinicalApiClient,
  medicationDispenseId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/medication-dispenses/${medicationDispenseId}/fhir`);
}

export function listMedicationAdministrations(
  api: ClinicalApiClient,
  patientId: string
): Promise<MedicationAdministrationsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/medication-administrations`);
}

export function createMedicationAdministration(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateMedicationAdministrationCommand
): Promise<MedicationAdministration> {
  return postTreatmentJson(
    api,
    `/patients/${patientId}/medication-administrations`,
    command
  );
}

export function exportMedicationAdministrationFhir(
  api: ClinicalApiClient,
  medicationAdministrationId: string
): Promise<unknown> {
  return requestTreatmentJson(
    api,
    `/medication-administrations/${medicationAdministrationId}/fhir`
  );
}
