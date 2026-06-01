import type pg from "pg";
import type { AllergyIntolerance } from "@benh-vien-so/domain";
import { allergyIntoleranceToUpsertValues } from "./postgres-allergy-intolerance.mapper.js";
import { upsertAllergyIntoleranceSql } from "./postgres-allergy-intolerance.sql.js";

export async function upsertAllergyIntolerance(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  allergyIntolerance: AllergyIntolerance
): Promise<void> {
  await queryable.query(
    upsertAllergyIntoleranceSql,
    allergyIntoleranceToUpsertValues(allergyIntolerance)
  );
}
