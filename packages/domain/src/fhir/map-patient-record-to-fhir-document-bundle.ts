import { mapPatientRecordToFhirBundle } from "./map-patient-record-to-fhir-bundle.js";
import type { FhirBundle } from "./fhir-types.js";
import type { PatientRecordDocumentBundleInput } from "./patient-record-document-composition.js";
import {
  buildPatientRecordComposition,
  buildPatientRecordDocumentBundleIdentifier,
  patientRecordDocumentBundleFhirProfile,
  toPatientRecordCompositionEntry
} from "./patient-record-document-composition.js";

export type { PatientRecordDocumentBundleInput } from "./patient-record-document-composition.js";

export function mapPatientRecordToFhirDocumentBundle(
  input: PatientRecordDocumentBundleInput
): FhirBundle {
  const generatedAt = input.generatedAt ?? new Date();
  const collectionBundle = mapPatientRecordToFhirBundle({
    ...input,
    generatedAt
  });
  const patientSnapshot = input.patient.toSnapshot();
  const composition = buildPatientRecordComposition(
    input,
    collectionBundle.entry,
    generatedAt
  );

  return {
    resourceType: "Bundle",
    id: `patient-document-${patientSnapshot.id}`,
    meta: {
      profile: [patientRecordDocumentBundleFhirProfile]
    },
    identifier: buildPatientRecordDocumentBundleIdentifier(patientSnapshot.id, generatedAt),
    type: "document",
    timestamp: generatedAt.toISOString(),
    entry: [toPatientRecordCompositionEntry(composition), ...collectionBundle.entry]
  };
}
