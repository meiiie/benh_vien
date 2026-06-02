import type { ProviderPractitionerSnapshot } from "../provider-directory/provider-directory.types.js";
import type { FhirPractitioner } from "./fhir-types.js";
import { toFhirIdentifiers } from "./map-provider-directory-codings.js";

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
