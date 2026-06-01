export const selectAuditEventSql = `SELECT
  id,
  occurred_at,
  actor_id,
  action,
  resource_type,
  resource_id,
  patient_id,
  purpose_of_use,
  ip_address::text AS ip_address,
  user_agent,
  metadata,
  hash_algorithm,
  previous_hash,
  payload_hash,
  integrity_hash
  FROM audit_events`;

export const lockAuditIntegrityScopeSql =
  "SELECT pg_advisory_xact_lock(hashtext($1)::bigint)";

export const selectLatestAuditIntegrityHashSql = `SELECT integrity_hash
FROM audit_events
WHERE patient_id IS NOT DISTINCT FROM $1
  AND integrity_hash IS NOT NULL
ORDER BY id DESC
LIMIT 1`;

export const insertAuditEventSql = `INSERT INTO audit_events (
  occurred_at,
  actor_id,
  action,
  resource_type,
  resource_id,
  patient_id,
  purpose_of_use,
  ip_address,
  user_agent,
  metadata
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10::jsonb)
RETURNING
  id,
  occurred_at,
  actor_id,
  action,
  resource_type,
  resource_id,
  patient_id,
  purpose_of_use,
  ip_address::text AS ip_address,
  user_agent,
  metadata,
  hash_algorithm,
  previous_hash,
  payload_hash,
  integrity_hash`;

export const updateAuditEventIntegritySql = `UPDATE audit_events
SET
  hash_algorithm = $2,
  previous_hash = $3,
  payload_hash = $4,
  integrity_hash = $5
WHERE id = $1`;
