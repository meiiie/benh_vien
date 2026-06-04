import type pg from "pg";
import type { ClinicalDocument } from "@benh-vien-so/domain";
import { clinicalDocumentToUpsertValues } from "./postgres-clinical-document.mapper.js";
import { upsertClinicalDocumentSql } from "./postgres-clinical-document.sql.js";

export async function upsertClinicalDocument(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  document: ClinicalDocument
): Promise<void> {
  await queryable.query(
    upsertClinicalDocumentSql,
    clinicalDocumentToUpsertValues(document)
  );
}
