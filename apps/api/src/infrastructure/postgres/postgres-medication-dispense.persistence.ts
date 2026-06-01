import type pg from "pg";
import type { MedicationDispense } from "@benh-vien-so/domain";
import { medicationDispenseToUpsertValues } from "./postgres-medication-dispense.mapper.js";
import { upsertMedicationDispenseSql } from "./postgres-medication-dispense.sql.js";

export async function upsertMedicationDispense(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  medicationDispense: MedicationDispense
): Promise<void> {
  await queryable.query(
    upsertMedicationDispenseSql,
    medicationDispenseToUpsertValues(medicationDispense)
  );
}
