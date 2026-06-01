import type pg from "pg";
import type { Condition } from "@benh-vien-so/domain";
import { conditionToUpsertValues } from "./postgres-condition.mapper.js";
import { upsertConditionSql } from "./postgres-condition.sql.js";

export async function upsertCondition(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  condition: Condition
): Promise<void> {
  await queryable.query(upsertConditionSql, conditionToUpsertValues(condition));
}
