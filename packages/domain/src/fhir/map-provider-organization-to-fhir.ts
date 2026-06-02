import type { ProviderOrganizationSnapshot } from "../provider-directory/provider-directory.types.js";
import type { FhirOrganization } from "./fhir-types.js";
import {
  formatOrganizationType,
  mapOrganizationType,
  toFhirIdentifiers
} from "./map-provider-directory-codings.js";

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
