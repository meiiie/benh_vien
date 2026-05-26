import type { Patient } from "./patient.js";

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | undefined>;
  save(patient: Patient): Promise<void>;
}

