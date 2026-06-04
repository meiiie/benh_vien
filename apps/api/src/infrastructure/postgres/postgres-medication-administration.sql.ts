export const selectMedicationAdministrationSql = `SELECT
  id,
  patient_id,
  encounter_id,
  medication_request_id,
  reason_condition_id,
  status,
  status_reason,
  category,
  medication_code,
  effective_period,
  performers,
  dosage,
  note,
  created_at,
  updated_at
  FROM medication_administrations`;

export const upsertMedicationAdministrationSql = `INSERT INTO medication_administrations (
  id,
  patient_id,
  encounter_id,
  medication_request_id,
  reason_condition_id,
  status,
  status_reason,
  category,
  medication_code,
  effective_period,
  performers,
  dosage,
  note,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13, $14, $15)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  encounter_id = EXCLUDED.encounter_id,
  medication_request_id = EXCLUDED.medication_request_id,
  reason_condition_id = EXCLUDED.reason_condition_id,
  status = EXCLUDED.status,
  status_reason = EXCLUDED.status_reason,
  category = EXCLUDED.category,
  medication_code = EXCLUDED.medication_code,
  effective_period = EXCLUDED.effective_period,
  performers = EXCLUDED.performers,
  dosage = EXCLUDED.dosage,
  note = EXCLUDED.note,
  updated_at = EXCLUDED.updated_at`;
