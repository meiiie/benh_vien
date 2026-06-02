import type {
  ObservationCategory,
  ObservationCode
} from "../observation/observation.types.js";
import type { FhirObservation } from "./fhir-types.js";

const observationCategorySystem =
  "http://terminology.hl7.org/CodeSystem/observation-category";

const categoryCodings: Record<ObservationCategory, { readonly code: string; readonly display: string }> = {
  laboratory: {
    code: "laboratory",
    display: "Laboratory"
  },
  "vital-signs": {
    code: "vital-signs",
    display: "Vital Signs"
  }
};

export const observationFhirProfile = "http://hl7.org/fhir/StructureDefinition/Observation";

function codeableConcept(system: string, code: string, display: string) {
  return {
    coding: [{ system, code, display }],
    text: display
  };
}

export function toObservationCategory(
  category: ObservationCategory
): FhirObservation["category"][number] {
  const coding = categoryCodings[category];

  return codeableConcept(observationCategorySystem, coding.code, coding.display);
}

export function toObservationCodeableConcept(
  code: ObservationCode
): FhirObservation["code"] {
  return codeableConcept(code.system, code.code, code.display);
}
