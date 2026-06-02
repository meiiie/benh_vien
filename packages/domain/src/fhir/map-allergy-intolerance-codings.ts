import type {
  AllergyClinicalStatus,
  AllergyCode,
  AllergyReaction,
  AllergyVerificationStatus
} from "../allergy-intolerance/allergy-intolerance.types.js";
import type { FhirAllergyIntolerance } from "./fhir-types.js";

const allergyClinicalStatusSystem =
  "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical";
const allergyVerificationStatusSystem =
  "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification";

const clinicalStatusLabels: Record<AllergyClinicalStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  resolved: "Resolved"
};

const verificationStatusLabels: Record<AllergyVerificationStatus, string> = {
  confirmed: "Confirmed",
  "entered-in-error": "Entered in Error",
  refuted: "Refuted",
  unconfirmed: "Unconfirmed"
};

export const allergyIntoleranceFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/AllergyIntolerance";

function codeableConcept(system: string, code: string, display: string) {
  return {
    coding: [{ system, code, display }],
    text: display
  };
}

export function toAllergyClinicalStatus(
  status: AllergyClinicalStatus
): NonNullable<FhirAllergyIntolerance["clinicalStatus"]> {
  return codeableConcept(allergyClinicalStatusSystem, status, clinicalStatusLabels[status]);
}

export function toAllergyVerificationStatus(
  status: AllergyVerificationStatus
): NonNullable<FhirAllergyIntolerance["verificationStatus"]> {
  return codeableConcept(
    allergyVerificationStatusSystem,
    status,
    verificationStatusLabels[status]
  );
}

export function toAllergyCodeableConcept(
  code: AllergyCode
): NonNullable<FhirAllergyIntolerance["code"]> {
  return codeableConcept(code.system, code.code, code.display);
}

export function toAllergyReaction(
  reaction: AllergyReaction
): NonNullable<FhirAllergyIntolerance["reaction"]>[number] {
  return {
    manifestation: [toAllergyCodeableConcept(reaction.manifestation)],
    severity: reaction.severity,
    description: reaction.description
  };
}
