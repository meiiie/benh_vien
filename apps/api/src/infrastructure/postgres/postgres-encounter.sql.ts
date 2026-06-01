export const selectEncounterSql = `SELECT
  id,
  patient_id,
  status,
  encounter_class,
  service_type,
  reason_text,
  department_id,
  attending_practitioner_id,
  started_at,
  ended_at,
  created_at,
  updated_at
  FROM encounters`;

export const upsertEncounterSql = `INSERT INTO encounters (
  id,
  patient_id,
  status,
  encounter_class,
  service_type,
  reason_text,
  department_id,
  attending_practitioner_id,
  started_at,
  ended_at,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  status = EXCLUDED.status,
  encounter_class = EXCLUDED.encounter_class,
  service_type = EXCLUDED.service_type,
  reason_text = EXCLUDED.reason_text,
  department_id = EXCLUDED.department_id,
  attending_practitioner_id = EXCLUDED.attending_practitioner_id,
  started_at = EXCLUDED.started_at,
  ended_at = EXCLUDED.ended_at,
  updated_at = EXCLUDED.updated_at`;
