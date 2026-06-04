import type {
  MedicationAdministrationCategory,
  MedicationAdministrationDosage,
  MedicationAdministrationPerformer
} from "../medication-administration/medication-administration.types.js";
import type { MedicationCode } from "../medication-request/medication-request.types.js";
import type { FhirMedicationAdministration } from "./fhir-types.js";

const medicationAdministrationCategorySystem =
  "http://terminology.hl7.org/CodeSystem/medication-admin-category";

export const medicationAdministrationFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/MedicationAdministration";
export const medicationAdministrationIdentifierSystem =
  "urn:wiiicare:nexus:medication-administration";

export function buildMedicationAdministrationIdentifier(
  administrationId: string
): NonNullable<FhirMedicationAdministration["identifier"]>[number] {
  return {
    system: medicationAdministrationIdentifierSystem,
    value: administrationId
  };
}

export function buildMedicationAdministrationCategory(
  category: MedicationAdministrationCategory
): NonNullable<FhirMedicationAdministration["category"]> {
  const display = formatMedicationAdministrationCategory(category);

  return {
    coding: [
      {
        system: medicationAdministrationCategorySystem,
        code: category,
        display
      }
    ],
    text: display
  };
}

export function toMedicationAdministrationCodeableConcept(
  coding: MedicationCode
): FhirMedicationAdministration["medicationCodeableConcept"] {
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

export function toFhirMedicationAdministrationPerformer(
  performer: MedicationAdministrationPerformer
): NonNullable<FhirMedicationAdministration["performer"]>[number] {
  return {
    function: performer.function
      ? toMedicationAdministrationCodeableConcept(performer.function)
      : undefined,
    actor: {
      reference: `${performer.actorType}/${performer.actorId}`
    }
  };
}

export function toMedicationAdministrationDosage(
  dosage: MedicationAdministrationDosage
): NonNullable<FhirMedicationAdministration["dosage"]> {
  return {
    text: dosage.text,
    route: dosage.route
      ? toMedicationAdministrationCodeableConcept(dosage.route)
      : undefined,
    dose: dosage.doseQuantity
  };
}

export function formatMedicationAdministrationCategory(
  category: MedicationAdministrationCategory
): string {
  const labels: Record<MedicationAdministrationCategory, string> = {
    community: "Community",
    inpatient: "Inpatient",
    outpatient: "Outpatient",
    "patient-specified": "Patient specified"
  };

  return labels[category];
}
