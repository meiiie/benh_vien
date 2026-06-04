import type {
  MedicationRequest,
  MedicationRequestSnapshot
} from "@benh-vien-so/domain";

export function toMedicationRequestResponse(
  medicationRequest: MedicationRequest
): MedicationRequestSnapshot {
  return medicationRequest.toSnapshot();
}
