import type { MedicationAdministration } from "./medication-administration.js";

export interface MedicationAdministrationRepository {
  findByPatientId(patientId: string): Promise<MedicationAdministration[]>;
  findById(id: string): Promise<MedicationAdministration | undefined>;
  save(medicationAdministration: MedicationAdministration): Promise<void>;
}
