import type {
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionCode,
  ConditionSeverity,
  ConditionVerificationStatus
} from "../condition/condition.types.js";
import type { FhirCondition } from "./fhir-types.js";

const conditionClinicalStatusSystem =
  "http://terminology.hl7.org/CodeSystem/condition-clinical";
const conditionVerificationStatusSystem =
  "http://terminology.hl7.org/CodeSystem/condition-ver-status";
const conditionCategorySystem = "http://terminology.hl7.org/CodeSystem/condition-category";

const categoryLabels: Record<ConditionCategory, string> = {
  "encounter-diagnosis": "Encounter Diagnosis",
  "problem-list-item": "Problem List Item"
};

const clinicalStatusLabels: Record<ConditionClinicalStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  recurrence: "Recurrence",
  relapse: "Relapse",
  remission: "Remission",
  resolved: "Resolved"
};

const verificationStatusLabels: Record<ConditionVerificationStatus, string> = {
  confirmed: "Confirmed",
  differential: "Differential",
  "entered-in-error": "Entered in Error",
  provisional: "Provisional",
  refuted: "Refuted",
  unconfirmed: "Unconfirmed"
};

const severityLabels: Record<ConditionSeverity, string> = {
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe"
};

export const conditionFhirProfile = "http://hl7.org/fhir/StructureDefinition/Condition";

function codeableConcept(system: string, code: string, display: string) {
  return {
    coding: [{ system, code, display }],
    text: display
  };
}

export function toConditionClinicalStatus(
  status: ConditionClinicalStatus
): NonNullable<FhirCondition["clinicalStatus"]> {
  const display = clinicalStatusLabels[status];

  return codeableConcept(conditionClinicalStatusSystem, status, display);
}

export function toConditionVerificationStatus(
  status: ConditionVerificationStatus
): FhirCondition["verificationStatus"] {
  const display = verificationStatusLabels[status];

  return codeableConcept(conditionVerificationStatusSystem, status, display);
}

export function toConditionCategory(
  category: ConditionCategory
): NonNullable<FhirCondition["category"]>[number] {
  const display = categoryLabels[category];

  return codeableConcept(conditionCategorySystem, category, display);
}

export function toConditionSeverity(
  severity: ConditionSeverity
): NonNullable<FhirCondition["severity"]> {
  return {
    text: severityLabels[severity]
  };
}

export function toConditionCodeableConcept(code: ConditionCode): FhirCondition["code"] {
  return codeableConcept(code.system, code.code, code.display);
}
