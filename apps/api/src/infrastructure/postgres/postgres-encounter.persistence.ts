import type pg from "pg";
import type { Encounter } from "@benh-vien-so/domain";
import { encounterToUpsertValues } from "./postgres-encounter.mapper.js";
import { upsertEncounterSql } from "./postgres-encounter.sql.js";

export async function upsertEncounter(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  encounter: Encounter
): Promise<void> {
  await queryable.query(upsertEncounterSql, encounterToUpsertValues(encounter));
}
