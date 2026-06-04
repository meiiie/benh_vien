import type { ProviderEndpointSnapshot } from "../provider-directory/provider-directory.types.js";
import type { FhirEndpoint } from "./fhir-types.js";
import {
  mapEndpointConnectionType,
  toCodeableConcept
} from "./map-provider-directory-codings.js";

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
