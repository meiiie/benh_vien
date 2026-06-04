export const selectConsentSql = `SELECT
  id,
  patient_id,
  status,
  category,
  grantee_organization_id,
  grantor_actor_id,
  evidence_document_id,
  revoked_by_actor_id,
  revoked_at,
  revocation_reason,
  valid_from,
  valid_until,
  created_at,
  updated_at
  FROM consents`;

export const upsertConsentSql = `INSERT INTO consents (
  id,
  patient_id,
  status,
  category,
  grantee_organization_id,
  grantor_actor_id,
  evidence_document_id,
  revoked_by_actor_id,
  revoked_at,
  revocation_reason,
  valid_from,
  valid_until,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  grantee_organization_id = EXCLUDED.grantee_organization_id,
  grantor_actor_id = EXCLUDED.grantor_actor_id,
  evidence_document_id = EXCLUDED.evidence_document_id,
  revoked_by_actor_id = EXCLUDED.revoked_by_actor_id,
  revoked_at = EXCLUDED.revoked_at,
  revocation_reason = EXCLUDED.revocation_reason,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  updated_at = EXCLUDED.updated_at`;
