import type { Observation } from "./observation.js";

export interface ObservationRepository {
  findByPatientId(patientId: string): Promise<Observation[]>;
  findById(id: string): Promise<Observation | undefined>;
  save(observation: Observation): Promise<void>;
}
