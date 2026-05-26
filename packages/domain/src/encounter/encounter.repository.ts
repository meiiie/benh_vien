import type { Encounter } from "./encounter.js";

export interface EncounterRepository {
  findByPatientId(patientId: string): Promise<Encounter[]>;
  findById(id: string): Promise<Encounter | undefined>;
  save(encounter: Encounter): Promise<void>;
}
