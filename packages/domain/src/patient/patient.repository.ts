import type { Patient, PatientIdentifier } from "./patient.js";

export type PatientIdentifierConflict = {
  readonly existingPatientId: string;
  readonly identifier: PatientIdentifier;
};

export class PatientIdentifierConflictError extends Error {
  readonly conflict: PatientIdentifierConflict;

  constructor(conflict: PatientIdentifierConflict) {
    super("Patient identifier is already assigned to another patient record.");
    this.name = "PatientIdentifierConflictError";
    this.conflict = conflict;
  }
}

export interface PatientRepository {
  findAll(): Promise<Patient[]>;
  findById(id: string): Promise<Patient | undefined>;
  findByIdentifier(
    identifier: Pick<PatientIdentifier, "system" | "value">
  ): Promise<Patient | undefined>;
  save(patient: Patient): Promise<void>;
}
