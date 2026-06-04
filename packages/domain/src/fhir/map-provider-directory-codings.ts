import type {
  ProviderCoding,
  ProviderEndpointConnectionType,
  ProviderOrganizationType
} from "../provider-directory/provider-directory.js";
import type { FhirIdentifier } from "./fhir-types.js";

export function toFhirIdentifiers(
  identifiers: readonly { readonly system: string; readonly value: string; readonly type?: string }[]
): readonly FhirIdentifier[] | undefined {
  if (identifiers.length === 0) {
    return undefined;
  }

  return identifiers.map((identifier) => ({
    system: identifier.system,
    value: identifier.value,
    type: identifier.type
      ? {
          text: identifier.type
        }
      : undefined
  }));
}

export function toCodeableConcept(coding: ProviderCoding): {
  readonly coding: readonly {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  }[];
  readonly text: string;
} {
  return {
    coding: [
      {
        system: coding.system,
        code: coding.code,
        display: coding.display
      }
    ],
    text: coding.display
  };
}

export function mapOrganizationType(type: ProviderOrganizationType): ProviderCoding {
  const codeByType: Record<ProviderOrganizationType, string> = {
    department: "dept",
    government: "govt",
    hospital: "prov",
    imaging: "dept",
    laboratory: "dept",
    other: "other",
    payer: "ins"
  };

  return {
    system: "http://terminology.hl7.org/CodeSystem/organization-type",
    code: codeByType[type],
    display: formatOrganizationType(type)
  };
}

export function formatOrganizationType(type: ProviderOrganizationType): string {
  const labels: Record<ProviderOrganizationType, string> = {
    department: "Department",
    government: "Government",
    hospital: "Healthcare Provider",
    imaging: "Diagnostic Imaging Department",
    laboratory: "Laboratory Department",
    other: "Other",
    payer: "Payer"
  };

  return labels[type];
}

export function mapEndpointConnectionType(type: ProviderEndpointConnectionType): {
  readonly system: string;
  readonly code: string;
  readonly display: string;
} {
  const displayByType: Record<ProviderEndpointConnectionType, string> = {
    "dicom-wado-rs": "DICOM WADO-RS",
    "direct-project": "Direct Project",
    "hl7-fhir-rest": "HL7 FHIR REST",
    "hl7v2-mllp": "HL7 v2 MLLP",
    "ihe-xds": "IHE XDS",
    other: "Other"
  };

  return {
    system: "http://terminology.hl7.org/CodeSystem/endpoint-connection-type",
    code: type,
    display: displayByType[type]
  };
}
