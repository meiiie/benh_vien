import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AllergyIntolerance,
  AllergyIntolerancesResponse
} from "../../types/allergies.js";
import type {
  Condition,
  ConditionsResponse
} from "../../types/conditions.js";
import type {
  Observation,
  ObservationsResponse
} from "../../types/observations.js";
import { postTreatmentJson, requestTreatmentJson } from "./clinicalRecordHttp.js";

type CreateAllergyIntoleranceCommand = Pick<
  AllergyIntolerance,
  "clinicalStatus" | "verificationStatus" | "type" | "category" | "code" | "recorderPractitionerId"
> &
  Partial<Pick<AllergyIntolerance, "encounterId" | "criticality" | "reaction" | "recordedAt" | "note">>;

type CreateConditionCommand = Pick<
  Condition,
  "clinicalStatus" | "verificationStatus" | "category" | "code" | "recorderPractitionerId"
> &
  Partial<Pick<Condition, "encounterId" | "severity" | "onsetAt" | "note">>;

type CreateObservationCommand = Pick<Observation, "category" | "code" | "effectiveAt"> &
  Partial<Pick<Observation, "encounterId" | "valueQuantity" | "valueText" | "performerPractitionerId">>;

export function listAllergyIntolerances(
  api: ClinicalApiClient,
  patientId: string
): Promise<AllergyIntolerancesResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/allergy-intolerances`);
}

export function createAllergyIntolerance(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateAllergyIntoleranceCommand
): Promise<AllergyIntolerance> {
  return postTreatmentJson(api, `/patients/${patientId}/allergy-intolerances`, command);
}

export function exportAllergyIntoleranceFhir(
  api: ClinicalApiClient,
  allergyIntoleranceId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/allergy-intolerances/${allergyIntoleranceId}/fhir`);
}

export function listConditions(
  api: ClinicalApiClient,
  patientId: string
): Promise<ConditionsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/conditions`);
}

export function createCondition(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateConditionCommand
): Promise<Condition> {
  return postTreatmentJson(api, `/patients/${patientId}/conditions`, command);
}

export function exportConditionFhir(
  api: ClinicalApiClient,
  conditionId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/conditions/${conditionId}/fhir`);
}

export function listObservations(
  api: ClinicalApiClient,
  patientId: string
): Promise<ObservationsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/observations`);
}

export function createObservation(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateObservationCommand
): Promise<Observation> {
  return postTreatmentJson(api, `/patients/${patientId}/observations`, command);
}

export function exportObservationFhir(
  api: ClinicalApiClient,
  observationId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/observations/${observationId}/fhir`);
}
