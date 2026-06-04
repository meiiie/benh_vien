import type {
  DosageInstruction,
  MedicationCode,
  MedicationRequestCategory
} from "../medication-request/medication-request.types.js";
import type { FhirMedicationRequest } from "./fhir-types.js";

const medicationRequestCategorySystem =
  "http://terminology.hl7.org/CodeSystem/medicationrequest-category";
const medicationRequestSupplyDurationSystem = "http://unitsofmeasure.org";

export const medicationRequestFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/MedicationRequest";

export function buildMedicationRequestCategory(
  category: MedicationRequestCategory
): NonNullable<FhirMedicationRequest["category"]>[number] {
  const display = formatMedicationRequestCategory(category);

  return {
    coding: [
      {
        system: medicationRequestCategorySystem,
        code: category,
        display
      }
    ],
    text: display
  };
}

export function toMedicationRequestCodeableConcept(
  coding: MedicationCode
): FhirMedicationRequest["medicationCodeableConcept"] {
  return {
    coding: [
      {
        system: coding.system,
        code: coding.code,
        display: coding.display
      }
    ],
    text: coding.display
  };
}

export function toMedicationRequestDosageInstruction(
  dosageInstruction: DosageInstruction
): NonNullable<FhirMedicationRequest["dosageInstruction"]>[number] {
  return {
    text: dosageInstruction.text,
    route: dosageInstruction.route
      ? {
          text: dosageInstruction.route
        }
      : undefined,
    timing:
      dosageInstruction.frequency &&
      dosageInstruction.period &&
      dosageInstruction.periodUnit
        ? {
            repeat: {
              frequency: dosageInstruction.frequency,
              period: dosageInstruction.period,
              periodUnit: dosageInstruction.periodUnit
            }
          }
        : undefined,
    doseAndRate: dosageInstruction.doseQuantity
      ? [
          {
            doseQuantity: dosageInstruction.doseQuantity
          }
        ]
      : undefined
  };
}

export function buildMedicationRequestDispenseRequest(
  expectedSupplyDurationDays: number
): NonNullable<FhirMedicationRequest["dispenseRequest"]> {
  return {
    expectedSupplyDuration: {
      value: expectedSupplyDurationDays,
      unit: "day",
      system: medicationRequestSupplyDurationSystem,
      code: "d"
    }
  };
}

export function formatMedicationRequestCategory(
  category: MedicationRequestCategory
): string {
  const labels: Record<MedicationRequestCategory, string> = {
    community: "Community",
    discharge: "Discharge",
    inpatient: "Inpatient",
    outpatient: "Outpatient"
  };

  return labels[category];
}
