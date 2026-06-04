import type pg from "pg";
import type { Procedure } from "@benh-vien-so/domain";
import { procedureToUpsertValues } from "./postgres-procedure.mapper.js";
import { upsertProcedureSql } from "./postgres-procedure.sql.js";

export async function upsertProcedure(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  procedure: Procedure
): Promise<void> {
  await queryable.query(upsertProcedureSql, procedureToUpsertValues(procedure));
}
