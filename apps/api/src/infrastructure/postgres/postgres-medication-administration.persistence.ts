import type pg from "pg";
import type { MedicationAdministration } from "@benh-vien-so/domain";
import { medicationAdministrationToUpsertValues } from "./postgres-medication-administration.mapper.js";
import { upsertMedicationAdministrationSql } from "./postgres-medication-administration.sql.js";

export async function upsertMedicationAdministration(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  medicationAdministration: MedicationAdministration
): Promise<void> {
  await queryable.query(
    upsertMedicationAdministrationSql,
    medicationAdministrationToUpsertValues(medicationAdministration)
  );
}
