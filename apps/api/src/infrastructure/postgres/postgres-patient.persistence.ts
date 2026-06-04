import type { PatientSnapshot } from "@benh-vien-so/domain";
import {
  patientIdentifierIndexValues,
  patientToUpsertValues
} from "./postgres-patient.mapper.js";
import {
  deletePatientIdentifierIndexSql,
  insertPatientIdentifierIndexSql,
  upsertPatientSql
} from "./postgres-patient.sql.js";
import type { PostgresPatientQueryable } from "./postgres-patient.types.js";

export async function upsertPatientSnapshot(
  queryable: PostgresPatientQueryable,
  snapshot: PatientSnapshot
): Promise<void> {
  await queryable.query(upsertPatientSql, patientToUpsertValues(snapshot));
  await queryable.query(deletePatientIdentifierIndexSql, [snapshot.id]);

  for (const identifier of snapshot.identifiers) {
    await queryable.query(
      insertPatientIdentifierIndexSql,
      patientIdentifierIndexValues(snapshot, identifier)
    );
  }
}
