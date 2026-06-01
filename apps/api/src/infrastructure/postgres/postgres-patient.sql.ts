export const selectPatientSql = `SELECT
  id,
  identifiers,
  full_name,
  birth_date::text AS birth_date,
  gender,
  address,
  phone,
  managing_organization_id,
  status,
  merged_into_patient_id,
  merged_at,
  merged_by_actor_id,
  merge_reason,
  created_at,
  updated_at
  FROM patients`;

export const selectPatientByIdentifierSql = `SELECT
  p.id,
  p.identifiers,
  p.full_name,
  p.birth_date::text AS birth_date,
  p.gender,
  p.address,
  p.phone,
  p.managing_organization_id,
  p.status,
  p.merged_into_patient_id,
  p.merged_at,
  p.merged_by_actor_id,
  p.merge_reason,
  p.created_at,
  p.updated_at
FROM patients p
INNER JOIN patient_identifier_index pii ON pii.patient_id = p.id
WHERE pii.system = $1 AND pii.value = $2
ORDER BY p.created_at ASC
LIMIT 1`;

export const upsertPatientSql = `INSERT INTO patients (
  id,
  identifiers,
  full_name,
  birth_date,
  gender,
  address,
  phone,
  managing_organization_id,
  status,
  merged_into_patient_id,
  merged_at,
  merged_by_actor_id,
  merge_reason,
  created_at,
  updated_at
)
VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
ON CONFLICT (id) DO UPDATE SET
  identifiers = EXCLUDED.identifiers,
  full_name = EXCLUDED.full_name,
  birth_date = EXCLUDED.birth_date,
  gender = EXCLUDED.gender,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  managing_organization_id = EXCLUDED.managing_organization_id,
  status = EXCLUDED.status,
  merged_into_patient_id = EXCLUDED.merged_into_patient_id,
  merged_at = EXCLUDED.merged_at,
  merged_by_actor_id = EXCLUDED.merged_by_actor_id,
  merge_reason = EXCLUDED.merge_reason,
  updated_at = EXCLUDED.updated_at`;

export const deletePatientIdentifierIndexSql =
  "DELETE FROM patient_identifier_index WHERE patient_id = $1";

export const insertPatientIdentifierIndexSql = `INSERT INTO patient_identifier_index (patient_id, system, value, type)
VALUES ($1, $2, $3, $4)`;
