import type { ProviderDirectory } from "../../types/providerDirectory.js";

type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatProviderEndpointConnectionType(type: string): string {
  return labelOf(
    {
      "dicom-wado-rs": "DICOMweb/WADO-RS",
      "direct-project": "Direct Project",
      "hl7-fhir-rest": "HL7 FHIR REST",
      "hl7v2-mllp": "HL7 v2 MLLP",
      "ihe-xds": "IHE XDS",
      other: "Khác"
    },
    type
  );
}

export function resolveProviderOrganizationLabel(
  providerDirectory: ProviderDirectory | undefined,
  organizationId: string
): string {
  const organization = providerDirectory?.organizations.find(
    (item) => item.id === organizationId
  );

  return organization ? `${organization.name} (${organization.id})` : organizationId;
}
