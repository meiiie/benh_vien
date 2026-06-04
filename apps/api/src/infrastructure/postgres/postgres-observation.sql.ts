export const selectObservationSql = `SELECT
  id,
  patient_id,
  encounter_id,
  status,
  category,
  code,
  effective_at,
  value_quantity,
  value_text,
  performer_practitioner_id,
  created_at,
  updated_at
  FROM observations`;

export const upsertObservationSql = `INSERT INTO observations (
  id,
  patient_id,
  encounter_id,
  status,
  category,
  code,
  effective_at,
  value_quantity,
  value_text,
  performer_practitioner_id,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9, $10, $11, $12)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  encounter_id = EXCLUDED.encounter_id,
  status = EXCLUDED.status,
  category = EXCLUDED.category,
  code = EXCLUDED.code,
  effective_at = EXCLUDED.effective_at,
  value_quantity = EXCLUDED.value_quantity,
  value_text = EXCLUDED.value_text,
  performer_practitioner_id = EXCLUDED.performer_practitioner_id,
  updated_at = EXCLUDED.updated_at`;
