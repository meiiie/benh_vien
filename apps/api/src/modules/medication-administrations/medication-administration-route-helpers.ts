import type {
  MedicationAdministration,
  MedicationAdministrationSnapshot
} from "@benh-vien-so/domain";

export function toMedicationAdministrationResponse(
  medicationAdministration: MedicationAdministration
): MedicationAdministrationSnapshot {
  return medicationAdministration.toSnapshot();
}
