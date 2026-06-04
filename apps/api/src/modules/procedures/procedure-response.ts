import type { Procedure, ProcedureSnapshot } from "@benh-vien-so/domain";

export function toProcedureResponse(procedure: Procedure): ProcedureSnapshot {
  return procedure.toSnapshot();
}
