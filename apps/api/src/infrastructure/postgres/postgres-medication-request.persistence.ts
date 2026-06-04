import type pg from "pg";
import type { MedicationRequest } from "@benh-vien-so/domain";
import { medicationRequestToUpsertValues } from "./postgres-medication-request.mapper.js";
import { upsertMedicationRequestSql } from "./postgres-medication-request.sql.js";

export async function upsertMedicationRequest(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  medicationRequest: MedicationRequest
): Promise<void> {
  await queryable.query(
    upsertMedicationRequestSql,
    medicationRequestToUpsertValues(medicationRequest)
  );
}
