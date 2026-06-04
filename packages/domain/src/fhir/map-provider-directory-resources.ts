import type {
  FhirEndpoint,
  FhirOrganization,
  FhirPractitioner,
  FhirPractitionerRole
} from "./fhir-types.js";

export type ProviderDirectoryFhirResource =
  | FhirOrganization
  | FhirPractitioner
  | FhirPractitionerRole
  | FhirEndpoint;

export { mapProviderEndpointToFhir } from "./map-provider-endpoint-to-fhir.js";
export { mapProviderOrganizationToFhir } from "./map-provider-organization-to-fhir.js";
export { mapProviderPractitionerRoleToFhir } from "./map-provider-practitioner-role-to-fhir.js";
export { mapProviderPractitionerToFhir } from "./map-provider-practitioner-to-fhir.js";
