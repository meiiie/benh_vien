import type { ProviderPractitionerRoleSnapshot } from "../provider-directory/provider-directory.types.js";
import type { FhirPractitionerRole } from "./fhir-types.js";
import { toCodeableConcept } from "./map-provider-directory-codings.js";

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
