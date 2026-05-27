import type { AllergyIntolerance } from "../allergy-intolerance/allergy-intolerance.js";
import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import type { Condition } from "../condition/condition.js";
import type { Encounter } from "../encounter/encounter.js";
import type { MedicationRequest } from "../medication-request/medication-request.js";
import type { Observation } from "../observation/observation.js";
import type { Patient } from "../patient/patient.js";
import type {
  FhirBundle,
  FhirAllergyIntolerance,
  FhirCondition,
  FhirDocumentReference,
  FhirEncounter,
  FhirMedicationRequest,
  FhirObservation,
  FhirPatient
} from "./fhir-types.js";
import { mapAllergyIntoleranceToFhir } from "./map-allergy-intolerance-to-fhir.js";
import { mapClinicalDocumentToFhir } from "./map-clinical-document-to-fhir.js";
import { mapConditionToFhir } from "./map-condition-to-fhir.js";
import { mapEncounterToFhir } from "./map-encounter-to-fhir.js";
import { mapMedicationRequestToFhir } from "./map-medication-request-to-fhir.js";
import { mapObservationToFhir } from "./map-observation-to-fhir.js";
import { mapPatientToFhir } from "./map-patient-to-fhir.js";

export type PatientRecordBundleInput = {
  readonly patient: Patient;
  readonly encounters: readonly Encounter[];
  readonly allergyIntolerances?: readonly AllergyIntolerance[];
  readonly conditions?: readonly Condition[];
  readonly observations?: readonly Observation[];
  readonly medicationRequests?: readonly MedicationRequest[];
  readonly documents: readonly ClinicalDocument[];
  readonly generatedAt?: Date;
};

export function mapPatientRecordToFhirBundle(input: PatientRecordBundleInput): FhirBundle {
  const generatedAt = input.generatedAt ?? new Date();
  const patient = mapPatientToFhir(input.patient);
  const encounters = input.encounters.map(mapEncounterToFhir);
  const allergyIntolerances =
    input.allergyIntolerances?.map(mapAllergyIntoleranceToFhir) ?? [];
  const conditions = input.conditions?.map(mapConditionToFhir) ?? [];
  const observations = input.observations?.map(mapObservationToFhir) ?? [];
  const medicationRequests = input.medicationRequests?.map(mapMedicationRequestToFhir) ?? [];
  const documents = input.documents.map(mapClinicalDocumentToFhir);
  const resources = [
    patient,
    ...encounters,
    ...allergyIntolerances,
    ...conditions,
    ...observations,
    ...medicationRequests,
    ...documents
  ];

  return {
    resourceType: "Bundle",
    id: `patient-record-${patient.id}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
    },
    identifier: {
      system: "urn:wiiicare:nexus:fhir-bundle",
      value: `patient-record:${patient.id}:${generatedAt.toISOString()}`
    },
    type: "collection",
    timestamp: generatedAt.toISOString(),
    entry: resources.map(toBundleEntry)
  };
}

function toBundleEntry(
  resource:
    | FhirPatient
    | FhirEncounter
    | FhirAllergyIntolerance
    | FhirCondition
    | FhirObservation
    | FhirMedicationRequest
    | FhirDocumentReference
): FhirBundle["entry"][number] {
  return {
    fullUrl: `urn:wiiicare:nexus:${resource.resourceType}:${resource.id}`,
    resource
  };
}
