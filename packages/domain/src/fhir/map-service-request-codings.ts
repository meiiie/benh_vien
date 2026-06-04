import type {
  ServiceRequestCategory,
  ServiceRequestCode
} from "../service-request/service-request.types.js";
import type { FhirServiceRequest } from "./fhir-types.js";

const snomedSystem = "http://snomed.info/sct";

const serviceRequestCategoryCodings: Record<
  ServiceRequestCategory,
  { readonly code: string; readonly display: string }
> = {
  consultation: {
    code: "409063005",
    display: "Counselling"
  },
  imaging: {
    code: "363679005",
    display: "Imaging"
  },
  laboratory: {
    code: "108252007",
    display: "Laboratory procedure"
  },
  procedure: {
    code: "387713003",
    display: "Surgical procedure"
  },
  therapy: {
    code: "277132007",
    display: "Therapeutic procedure"
  }
};

export const serviceRequestFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/ServiceRequest";

export function buildServiceRequestCategory(
  category: ServiceRequestCategory
): NonNullable<FhirServiceRequest["category"]>[number] {
  const coding = serviceRequestCategoryCodings[category];

  return {
    coding: [
      {
        system: snomedSystem,
        code: coding.code,
        display: coding.display
      }
    ],
    text: coding.display
  };
}

export function toServiceRequestCodeableConcept(
  code: ServiceRequestCode
): NonNullable<FhirServiceRequest["code"]> {
  return {
    coding: [
      {
        system: code.system,
        code: code.code,
        display: code.display
      }
    ],
    text: code.display
  };
}
