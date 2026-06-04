import { Patient } from "@benh-vien-so/domain";
import type { PatientSnapshot } from "@benh-vien-so/domain";

export function toPatientResponse(patient: Patient): PatientSnapshot {
  return patient.toSnapshot();
}
