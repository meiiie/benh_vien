import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import type { Encounter } from "../encounter/encounter.js";
import type { Patient } from "../patient/patient.js";
import type {
  FhirBundle,
  FhirDocumentReference,
  FhirEncounter,
  FhirPatient
} from "./fhir-types.js";
import { mapClinicalDocumentToFhir } from "./map-clinical-document-to-fhir.js";
import { mapEncounterToFhir } from "./map-encounter-to-fhir.js";
import { mapPatientToFhir } from "./map-patient-to-fhir.js";

export type PatientRecordBundleInput = {
  readonly patient: Patient;
  readonly encounters: readonly Encounter[];
  readonly documents: readonly ClinicalDocument[];
  readonly generatedAt?: Date;
};

export function mapPatientRecordToFhirBundle(input: PatientRecordBundleInput): FhirBundle {
  const generatedAt = input.generatedAt ?? new Date();
  const patient = mapPatientToFhir(input.patient);
  const encounters = input.encounters.map(mapEncounterToFhir);
  const documents = input.documents.map(mapClinicalDocumentToFhir);
  const resources = [patient, ...encounters, ...documents];

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
  resource: FhirPatient | FhirEncounter | FhirDocumentReference
): FhirBundle["entry"][number] {
  return {
    fullUrl: `urn:wiiicare:nexus:${resource.resourceType}:${resource.id}`,
    resource
  };
}
