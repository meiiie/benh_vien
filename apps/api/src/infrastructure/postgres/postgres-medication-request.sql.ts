export const selectMedicationRequestSql = `SELECT
  id,
  patient_id,
  encounter_id,
  reason_condition_id,
  status,
  intent,
  category,
  priority,
  medication_code,
  dosage_instruction,
  authored_on,
  requester_practitioner_id,
  expected_supply_duration_days,
  note,
  created_at,
  updated_at
  FROM medication_requests`;

export const upsertMedicationRequestSql = `INSERT INTO medication_requests (
  id,
  patient_id,
  encounter_id,
  reason_condition_id,
  status,
  intent,
  category,
  priority,
  medication_code,
  dosage_instruction,
  authored_on,
  requester_practitioner_id,
  expected_supply_duration_days,
  note,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15, $16)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  encounter_id = EXCLUDED.encounter_id,
  reason_condition_id = EXCLUDED.reason_condition_id,
  status = EXCLUDED.status,
  intent = EXCLUDED.intent,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  medication_code = EXCLUDED.medication_code,
  dosage_instruction = EXCLUDED.dosage_instruction,
  authored_on = EXCLUDED.authored_on,
  requester_practitioner_id = EXCLUDED.requester_practitioner_id,
  expected_supply_duration_days = EXCLUDED.expected_supply_duration_days,
  note = EXCLUDED.note,
  updated_at = EXCLUDED.updated_at`;
