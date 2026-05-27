import type { Condition } from "./condition.js";

export interface ConditionRepository {
  findByPatientId(patientId: string): Promise<Condition[]>;
  findById(id: string): Promise<Condition | undefined>;
  save(condition: Condition): Promise<void>;
}
