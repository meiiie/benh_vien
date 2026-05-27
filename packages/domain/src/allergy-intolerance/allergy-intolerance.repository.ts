import type { AllergyIntolerance } from "./allergy-intolerance.js";

export interface AllergyIntoleranceRepository {
  findByPatientId(patientId: string): Promise<AllergyIntolerance[]>;
  findById(id: string): Promise<AllergyIntolerance | undefined>;
  save(allergyIntolerance: AllergyIntolerance): Promise<void>;
}
