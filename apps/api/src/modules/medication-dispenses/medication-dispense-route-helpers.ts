import type {
  MedicationDispense,
  MedicationDispenseSnapshot
} from "@benh-vien-so/domain";

export function toMedicationDispenseResponse(
  medicationDispense: MedicationDispense
): MedicationDispenseSnapshot {
  return medicationDispense.toSnapshot();
}
