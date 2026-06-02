import type {
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "../provider-directory/provider-directory.types.js";
import type {
  FhirEndpoint,
  FhirOrganization,
  FhirPractitioner,
  FhirPractitionerRole
} from "./fhir-types.js";
import {
  formatOrganizationType,
  mapEndpointConnectionType,
  mapOrganizationType,
  toCodeableConcept,
  toFhirIdentifiers
} from "./map-provider-directory-codings.js";

export type ProviderDirectoryFhirResource =
  | FhirOrganization
  | FhirPractitioner
  | FhirPractitionerRole
  | FhirEndpoint;

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
