import type { MedicationDispense } from "./medication-dispense.js";

export interface MedicationDispenseRepository {
  findByPatientId(patientId: string): Promise<MedicationDispense[]>;
  findById(id: string): Promise<MedicationDispense | undefined>;
  save(medicationDispense: MedicationDispense): Promise<void>;
}
