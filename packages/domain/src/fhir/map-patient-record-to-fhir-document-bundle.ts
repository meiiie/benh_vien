import type { PatientRecordBundleInput } from "./map-patient-record-to-fhir-bundle.js";
import { mapPatientRecordToFhirBundle } from "./map-patient-record-to-fhir-bundle.js";
import type { FhirBundle, FhirComposition } from "./fhir-types.js";
import { buildPatientRecordDocumentSections } from "./patient-record-document-sections.js";

export type PatientRecordDocumentBundleInput = PatientRecordBundleInput & {
  readonly authorPractitionerId?: string;
  readonly custodianOrganizationId?: string;
};

export function mapPatientRecordToFhirDocumentBundle(
  input: PatientRecordDocumentBundleInput
): FhirBundle {
  const generatedAt = input.generatedAt ?? new Date();
  const collectionBundle = mapPatientRecordToFhirBundle({
    ...input,
    generatedAt
  });
  const patientSnapshot = input.patient.toSnapshot();
  const composition = buildComposition(input, collectionBundle.entry, generatedAt);

  return {
    resourceType: "Bundle",
    id: `patient-document-${patientSnapshot.id}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
    },
    identifier: {
      system: "urn:wiiicare:nexus:fhir-document-bundle",
      value: `patient-document:${patientSnapshot.id}:${generatedAt.toISOString()}`
    },
    type: "document",
    timestamp: generatedAt.toISOString(),
    entry: [
      {
        fullUrl: `urn:wiiicare:nexus:Composition:${composition.id}`,
        resource: composition
      },
      ...collectionBundle.entry
    ]
  };
}

function buildComposition(
  input: PatientRecordDocumentBundleInput,
  entries: FhirBundle["entry"],
  generatedAt: Date
): FhirComposition {
  const patientSnapshot = input.patient.toSnapshot();
  const authorPractitionerId = input.authorPractitionerId ?? "practitioner-demo-001";
  const custodianOrganizationId =
    input.custodianOrganizationId ?? patientSnapshot.managingOrganizationId;

  return {
    resourceType: "Composition",
    id: `patient-summary-${patientSnapshot.id}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Composition"]
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
        reference: `Practitioner/${authorPractitionerId}`
      }
    ],
    title: `Tóm tắt bệnh án điện tử - ${patientSnapshot.fullName}`,
    custodian: custodianOrganizationId
      ? {
          reference: `Organization/${custodianOrganizationId}`
        }
      : undefined,
    section: buildPatientRecordDocumentSections(entries)
  };
}
