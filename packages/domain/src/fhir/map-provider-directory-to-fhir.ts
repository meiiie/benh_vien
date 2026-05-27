import type {
  ProviderCoding,
  ProviderDirectory,
  ProviderEndpointConnectionType,
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderOrganizationType,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "../provider-directory/provider-directory.js";
import type {
  FhirBundle,
  FhirEndpoint,
  FhirIdentifier,
  FhirOrganization,
  FhirPractitioner,
  FhirPractitionerRole
} from "./fhir-types.js";

export function mapProviderDirectoryToFhirResources(
  directory: ProviderDirectory
): readonly (FhirOrganization | FhirPractitioner | FhirPractitionerRole | FhirEndpoint)[] {
  const snapshot = directory.toSnapshot();

  return [
    ...snapshot.organizations.map(mapProviderOrganizationToFhir),
    ...snapshot.practitioners.map(mapProviderPractitionerToFhir),
    ...snapshot.practitionerRoles.map(mapProviderPractitionerRoleToFhir),
    ...snapshot.endpoints.map(mapProviderEndpointToFhir)
  ];
}

export function mapProviderDirectoryToFhirBundle(
  directory: ProviderDirectory,
  generatedAt = new Date()
): FhirBundle {
  const resources = mapProviderDirectoryToFhirResources(directory);

  return {
    resourceType: "Bundle",
    id: "provider-directory",
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
    },
    identifier: {
      system: "urn:wiiicare:nexus:provider-directory",
      value: `provider-directory:${generatedAt.toISOString()}`
    },
    type: "collection",
    timestamp: generatedAt.toISOString(),
    entry: resources.map((resource) => ({
      fullUrl: `urn:wiiicare:nexus:${resource.resourceType}:${resource.id}`,
      resource
    }))
  };
}

export function mapProviderOrganizationToFhir(
  organization: ProviderOrganizationSnapshot
): FhirOrganization {
  return {
    resourceType: "Organization",
    id: organization.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Organization"]
    },
    identifier: toFhirIdentifiers(organization.identifiers),
    active: organization.active,
    type: [
      {
        coding: [mapOrganizationType(organization.type)],
        text: formatOrganizationType(organization.type)
      }
    ],
    name: organization.name,
    alias: organization.alias,
    telecom: organization.telecom,
    address: organization.address
      ? [
          {
            text: organization.address
          }
        ]
      : undefined,
    partOf: organization.partOfOrganizationId
      ? {
          reference: `Organization/${organization.partOfOrganizationId}`
        }
      : undefined
  };
}

export function mapProviderPractitionerToFhir(
  practitioner: ProviderPractitionerSnapshot
): FhirPractitioner {
  return {
    resourceType: "Practitioner",
    id: practitioner.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Practitioner"]
    },
    identifier: toFhirIdentifiers(practitioner.identifiers),
    active: practitioner.active,
    name: [
      {
        text: practitioner.fullName
      }
    ],
    telecom: practitioner.telecom,
    qualification: practitioner.qualification
      ? [
          {
            code: {
              text: practitioner.qualification
            }
          }
        ]
      : undefined
  };
}

export function mapProviderEndpointToFhir(endpoint: ProviderEndpointSnapshot): FhirEndpoint {
  return {
    resourceType: "Endpoint",
    id: endpoint.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Endpoint"]
    },
    status: endpoint.status,
    connectionType: mapEndpointConnectionType(endpoint.connectionType),
    name: endpoint.name,
    managingOrganization: {
      reference: `Organization/${endpoint.managingOrganizationId}`
    },
    contact: endpoint.contact,
    payloadType: endpoint.payloadTypes.map(toCodeableConcept),
    address: endpoint.address
  };
}

export function mapProviderPractitionerRoleToFhir(
  role: ProviderPractitionerRoleSnapshot
): FhirPractitionerRole {
  return {
    resourceType: "PractitionerRole",
    id: role.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/PractitionerRole"]
    },
    active: role.active,
    period:
      role.periodStart || role.periodEnd
        ? {
            start: role.periodStart,
            end: role.periodEnd
          }
        : undefined,
    practitioner: role.practitionerId
      ? {
          reference: `Practitioner/${role.practitionerId}`
        }
      : undefined,
    organization: {
      reference: `Organization/${role.organizationId}`
    },
    code: [toCodeableConcept(role.code)],
    specialty: role.specialty ? [toCodeableConcept(role.specialty)] : undefined,
    telecom: role.telecom,
    endpoint: role.endpointIds?.map((endpointId) => ({
      reference: `Endpoint/${endpointId}`
    }))
  };
}

function toFhirIdentifiers(
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

function toCodeableConcept(coding: ProviderCoding): {
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

function mapOrganizationType(type: ProviderOrganizationType): ProviderCoding {
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

function formatOrganizationType(type: ProviderOrganizationType): string {
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

function mapEndpointConnectionType(type: ProviderEndpointConnectionType): {
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
