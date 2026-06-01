import type pg from "pg";
import type { Consent } from "@benh-vien-so/domain";
import { consentToUpsertValues } from "./postgres-consent.mapper.js";
import { upsertConsentSql } from "./postgres-consent.sql.js";

export async function upsertConsent(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  consent: Consent
): Promise<void> {
  await queryable.query(upsertConsentSql, consentToUpsertValues(consent));
}
