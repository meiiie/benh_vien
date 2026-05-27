import type { PatientRecordBundleInput } from "./map-patient-record-to-fhir-bundle.js";
import { mapPatientRecordToFhirBundle } from "./map-patient-record-to-fhir-bundle.js";
import type {
  FhirBundle,
  FhirBundleEntry,
  FhirComposition
} from "./fhir-types.js";

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
  entries: readonly FhirBundleEntry[],
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
    section: [
      buildSection("Cơ sở, nhân sự và endpoint liên thông", entries, [
        "Organization",
        "Practitioner",
        "PractitionerRole",
        "Endpoint"
      ]),
      buildSection("Lượt khám", entries, ["Encounter"]),
      buildSection("Dị ứng và cảnh báo", entries, ["AllergyIntolerance"]),
      buildSection("Chẩn đoán và vấn đề sức khỏe", entries, ["Condition"]),
      buildSection("Y lệnh dịch vụ", entries, ["ServiceRequest"]),
      buildSection("Luồng công việc thực thi chỉ định", entries, ["Task"]),
      buildSection("Chỉ số và kết quả nguyên tử", entries, ["Observation"]),
      buildSection("Báo cáo kết quả", entries, ["DiagnosticReport"]),
      buildSection("Nghiên cứu hình ảnh", entries, ["ImagingStudy"]),
      buildSection("Chỉ định thuốc", entries, ["MedicationRequest"]),
      buildSection("Tài liệu lâm sàng", entries, ["DocumentReference"])
    ]
  };
}

function buildSection(
  title: string,
  entries: readonly FhirBundleEntry[],
  resourceTypes: readonly FhirBundleEntry["resource"]["resourceType"][]
): NonNullable<FhirComposition["section"]>[number] {
  const sectionEntries = entries
    .filter((entry) => resourceTypes.includes(entry.resource.resourceType))
    .map((entry) => ({
      reference: `${entry.resource.resourceType}/${entry.resource.id}`
    }));

  return {
    title,
    text: {
      status: "generated",
      div: `<div xmlns="http://www.w3.org/1999/xhtml">${escapeXml(title)}: ${sectionEntries.length} mục</div>`
    },
    entry: sectionEntries.length > 0 ? sectionEntries : undefined
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
