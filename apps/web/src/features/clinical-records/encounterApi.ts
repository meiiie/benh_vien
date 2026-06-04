import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  Encounter,
  EncountersResponse
} from "../../types/encounters.js";
import { postTreatmentJson, requestTreatmentJson } from "./clinicalRecordHttp.js";

type CreateEncounterCommand = Pick<
  Encounter,
  "class" | "serviceType" | "reasonText" | "departmentId" | "attendingPractitionerId" | "startedAt"
>;

export function listEncounters(
  api: ClinicalApiClient,
  patientId: string
): Promise<EncountersResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/encounters`);
}

export function createEncounter(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateEncounterCommand
): Promise<Encounter> {
  return postTreatmentJson(api, `/patients/${patientId}/encounters`, command);
}

export function finishEncounter(
  api: ClinicalApiClient,
  encounterId: string
): Promise<Encounter> {
  return postTreatmentJson(api, `/encounters/${encounterId}/finish`);
}

export function exportEncounterFhir(
  api: ClinicalApiClient,
  encounterId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/encounters/${encounterId}/fhir`);
}
