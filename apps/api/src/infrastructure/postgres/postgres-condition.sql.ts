export const selectConditionSql = `SELECT
  id,
  patient_id,
  encounter_id,
  clinical_status,
  verification_status,
  category,
  code,
  severity,
  onset_at,
  recorded_at,
  recorder_practitioner_id,
  note,
  created_at,
  updated_at
  FROM conditions`;

export const upsertConditionSql = `INSERT INTO conditions (
  id,
  patient_id,
  encounter_id,
  clinical_status,
  verification_status,
  category,
  code,
  severity,
  onset_at,
  recorded_at,
  recorder_practitioner_id,
  note,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  encounter_id = EXCLUDED.encounter_id,
  clinical_status = EXCLUDED.clinical_status,
  verification_status = EXCLUDED.verification_status,
  category = EXCLUDED.category,
  code = EXCLUDED.code,
  severity = EXCLUDED.severity,
  onset_at = EXCLUDED.onset_at,
  recorded_at = EXCLUDED.recorded_at,
  recorder_practitioner_id = EXCLUDED.recorder_practitioner_id,
  note = EXCLUDED.note,
  updated_at = EXCLUDED.updated_at`;
