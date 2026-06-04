import type { FhirBundleEntry, FhirComposition } from "./fhir-types.js";

type PatientRecordDocumentSectionDefinition = {
  readonly title: string;
  readonly resourceTypes: readonly FhirBundleEntry["resource"]["resourceType"][];
};

const patientRecordDocumentSectionDefinitions: readonly PatientRecordDocumentSectionDefinition[] =
  [
    {
      title: "Cơ sở, nhân sự và endpoint liên thông",
      resourceTypes: ["Organization", "Practitioner", "PractitionerRole", "Endpoint"]
    },
    {
      title: "Đồng ý chia sẻ hồ sơ",
      resourceTypes: ["Consent"]
    },
    {
      title: "Lượt khám",
      resourceTypes: ["Encounter"]
    },
    {
      title: "Dị ứng và cảnh báo",
      resourceTypes: ["AllergyIntolerance"]
    },
    {
      title: "Chẩn đoán và vấn đề sức khỏe",
      resourceTypes: ["Condition"]
    },
    {
      title: "Y lệnh dịch vụ",
      resourceTypes: ["ServiceRequest"]
    },
    {
      title: "Luồng công việc thực thi chỉ định",
      resourceTypes: ["Task"]
    },
    {
      title: "Thủ thuật và hoạt động đã thực hiện",
      resourceTypes: ["Procedure"]
    },
    {
      title: "Chỉ số và kết quả nguyên tử",
      resourceTypes: ["Observation"]
    },
    {
      title: "Báo cáo kết quả",
      resourceTypes: ["DiagnosticReport"]
    },
    {
      title: "Nghiên cứu hình ảnh",
      resourceTypes: ["ImagingStudy"]
    },
    {
      title: "Chỉ định thuốc",
      resourceTypes: ["MedicationRequest"]
    },
    {
      title: "Cấp phát thuốc",
      resourceTypes: ["MedicationDispense"]
    },
    {
      title: "Dùng thuốc thực tế",
      resourceTypes: ["MedicationAdministration"]
    },
    {
      title: "Tài liệu lâm sàng",
      resourceTypes: ["DocumentReference"]
    },
    {
      title: "Nguồn gốc và ký xác nhận tài liệu",
      resourceTypes: ["Provenance"]
    }
  ];

export function buildPatientRecordDocumentSections(
  entries: readonly FhirBundleEntry[]
): NonNullable<FhirComposition["section"]> {
  return patientRecordDocumentSectionDefinitions.map((definition) =>
    buildPatientRecordDocumentSection(
      definition.title,
      entries,
      definition.resourceTypes
    )
  );
}

function buildPatientRecordDocumentSection(
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
