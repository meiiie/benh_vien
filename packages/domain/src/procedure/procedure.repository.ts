import type { Procedure } from "./procedure.js";

export interface ProcedureRepository {
  findByPatientId(patientId: string): Promise<Procedure[]>;
  findById(id: string): Promise<Procedure | undefined>;
  save(procedure: Procedure): Promise<void>;
}
