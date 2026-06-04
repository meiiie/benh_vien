import type { FhirBundle, FhirBundleEntry, FhirComposition } from "./fhir-types.js";
import type { PatientRecordBundleInput } from "./patient-record-bundle-resources.js";
import {
  buildPatientRecordCompositionCustodian,
  resolvePatientRecordCompositionAuthor
} from "./patient-record-document-references.js";
import { buildPatientRecordDocumentSections } from "./patient-record-document-sections.js";

export const patientRecordDocumentBundleFhirProfile = "http://hl7.org/fhir/StructureDefinition/Bundle";
export const patientRecordCompositionFhirProfile = "http://hl7.org/fhir/StructureDefinition/Composition";
export const patientRecordDocumentBundleIdentifierSystem =
  "urn:wiiicare:nexus:fhir-document-bundle";

export type PatientRecordDocumentBundleInput = PatientRecordBundleInput & {
  readonly authorPractitionerId?: string;
  readonly custodianOrganizationId?: string;
};

export function buildPatientRecordComposition(
  input: PatientRecordDocumentBundleInput,
  entries: FhirBundle["entry"],
  generatedAt: Date
): FhirComposition {
  const patientSnapshot = input.patient.toSnapshot();
  const custodianOrganizationId =
    input.custodianOrganizationId ?? patientSnapshot.managingOrganizationId;

  return {
    resourceType: "Composition",
    id: `patient-summary-${patientSnapshot.id}`,
    meta: {
      profile: [patientRecordCompositionFhirProfile]
    },
    status: "final",
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "34133-9",
          display: "Summary of episode note"
        }
      ],
      text: "Tóm tắt hồ sơ bệnh án điện tử"
    },
    subject: {
      reference: `Patient/${patientSnapshot.id}`
    },
    date: generatedAt.toISOString(),
    author: [
      {
        reference: resolvePatientRecordCompositionAuthor(
          input,
          entries,
          patientSnapshot,
          custodianOrganizationId
        )
      }
    ],
    title: `Tóm tắt bệnh án điện tử - ${patientSnapshot.fullName}`,
    custodian: buildPatientRecordCompositionCustodian(entries, custodianOrganizationId),
    section: buildPatientRecordDocumentSections(entries)
  };
}

export function buildPatientRecordDocumentBundleIdentifier(
  patientId: string,
  generatedAt: Date
): NonNullable<FhirBundle["identifier"]> {
  return {
    system: patientRecordDocumentBundleIdentifierSystem,
    value: `patient-document:${patientId}:${generatedAt.toISOString()}`
  };
}

export function toPatientRecordCompositionEntry(
  composition: FhirComposition
): FhirBundleEntry {
  return {
    fullUrl: `urn:wiiicare:nexus:Composition:${composition.id}`,
    resource: composition
  };
}
