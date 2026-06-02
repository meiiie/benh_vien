import type { ProviderDirectory } from "../provider-directory/provider-directory.js";
import type { FhirBundle } from "./fhir-types.js";
import {
  mapProviderEndpointToFhir,
  mapProviderOrganizationToFhir,
  mapProviderPractitionerRoleToFhir,
  mapProviderPractitionerToFhir,
  type ProviderDirectoryFhirResource
} from "./map-provider-directory-resources.js";

export {
  mapProviderEndpointToFhir,
  mapProviderOrganizationToFhir,
  mapProviderPractitionerRoleToFhir,
  mapProviderPractitionerToFhir
} from "./map-provider-directory-resources.js";

export function mapProviderDirectoryToFhirResources(
  directory: ProviderDirectory
): readonly ProviderDirectoryFhirResource[] {
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
