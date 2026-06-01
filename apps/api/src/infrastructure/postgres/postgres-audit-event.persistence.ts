import type { AuditEvent, AuditEventSnapshot } from "@benh-vien-so/domain";
import {
  auditEventIntegrityValues,
  auditEventToInsertValues,
  rowToAuditEvent
} from "./postgres-audit-event.mapper.js";
import {
  insertAuditEventSql,
  lockAuditIntegrityScopeSql,
  selectLatestAuditIntegrityHashSql,
  updateAuditEventIntegritySql
} from "./postgres-audit-event.sql.js";
import type { AuditEventRow, PostgresAuditQueryable } from "./postgres-audit-event.types.js";

export async function lockAuditIntegrityScope(
  queryable: PostgresAuditQueryable,
  patientId: string | undefined
): Promise<void> {
  await queryable.query(lockAuditIntegrityScopeSql, [patientId ?? "__system__"]);
}

export async function findLatestAuditIntegrityHash(
  queryable: PostgresAuditQueryable,
  patientId: string | undefined
): Promise<string | undefined> {
  const result = await queryable.query<{ readonly integrity_hash: string | null }>(
    selectLatestAuditIntegrityHashSql,
    [patientId ?? null]
  );

  return result.rows[0]?.integrity_hash ?? undefined;
}

export async function insertAuditEvent(
  queryable: PostgresAuditQueryable,
  snapshot: AuditEventSnapshot
): Promise<AuditEvent> {
  const result = await queryable.query<AuditEventRow>(
    insertAuditEventSql,
    auditEventToInsertValues(snapshot)
  );

  return rowToAuditEvent(result.rows[0]);
}

export async function updateAuditEventIntegrity(
  queryable: PostgresAuditQueryable,
  snapshot: AuditEventSnapshot
): Promise<void> {
  await queryable.query(updateAuditEventIntegritySql, auditEventIntegrityValues(snapshot));
}
