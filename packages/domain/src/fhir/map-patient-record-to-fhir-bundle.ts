import type { FhirBundle } from "./fhir-types.js";
import {
  buildPatientRecordBundleResources,
  toPatientRecordBundleEntry
} from "./patient-record-bundle-resources.js";
import type { PatientRecordBundleInput } from "./patient-record-bundle.types.js";

export type { PatientRecordBundleInput } from "./patient-record-bundle.types.js";

export function mapPatientRecordToFhirBundle(input: PatientRecordBundleInput): FhirBundle {
  const generatedAt = input.generatedAt ?? new Date();
  const patientSnapshot = input.patient.toSnapshot();
  const resources = buildPatientRecordBundleResources(input);

  return {
    resourceType: "Bundle",
    id: `patient-record-${patientSnapshot.id}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
    },
    identifier: {
      system: "urn:wiiicare:nexus:fhir-bundle",
      value: `patient-record:${patientSnapshot.id}:${generatedAt.toISOString()}`
    },
    type: "collection",
    timestamp: generatedAt.toISOString(),
    entry: resources.map(toPatientRecordBundleEntry)
  };
}
