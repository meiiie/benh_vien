import type pg from "pg";
import type { Observation } from "@benh-vien-so/domain";
import { observationToUpsertValues } from "./postgres-observation.mapper.js";
import { upsertObservationSql } from "./postgres-observation.sql.js";

export async function upsertObservation(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  observation: Observation
): Promise<void> {
  await queryable.query(upsertObservationSql, observationToUpsertValues(observation));
}
