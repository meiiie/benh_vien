import type {
  DosageInstruction,
  MedicationCode
} from "../medication-request/medication-request.types.js";
import type { MedicationDispenseCategory } from "../medication-dispense/medication-dispense.types.js";
import type { FhirMedicationDispense } from "./fhir-types.js";

const medicationDispenseCategorySystem =
  "http://terminology.hl7.org/CodeSystem/medicationdispense-category";

export const medicationDispenseFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/MedicationDispense";
export const medicationDispenseIdentifierSystem =
  "urn:wiiicare:nexus:medication-dispense";

export function buildMedicationDispenseIdentifier(
  dispenseId: string
): NonNullable<FhirMedicationDispense["identifier"]>[number] {
  return {
    system: medicationDispenseIdentifierSystem,
    value: dispenseId
  };
}

export function buildMedicationDispenseCategory(
  category: MedicationDispenseCategory
): NonNullable<FhirMedicationDispense["category"]> {
  const display = formatMedicationDispenseCategory(category);

  return {
    coding: [
      {
        system: medicationDispenseCategorySystem,
        code: category,
        display
      }
    ],
    text: display
  };
}

export function toMedicationDispenseCodeableConcept(
  coding: MedicationCode
): FhirMedicationDispense["medicationCodeableConcept"] {
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

export function toMedicationDispenseDosageInstruction(
  dosageInstruction: DosageInstruction
): NonNullable<FhirMedicationDispense["dosageInstruction"]>[number] {
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

export function formatMedicationDispenseCategory(
  category: MedicationDispenseCategory
): string {
  const labels: Record<MedicationDispenseCategory, string> = {
    community: "Community",
    discharge: "Discharge",
    inpatient: "Inpatient",
    outpatient: "Outpatient"
  };

  return labels[category];
}
