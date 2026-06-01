export const selectAllergyIntoleranceSql = `SELECT
  id,
  patient_id,
  encounter_id,
  clinical_status,
  verification_status,
  type,
  category,
  criticality,
  code,
  reaction,
  recorded_at,
  recorder_practitioner_id,
  note,
  created_at,
  updated_at
  FROM allergy_intolerances`;

export const upsertAllergyIntoleranceSql = `INSERT INTO allergy_intolerances (
  id,
  patient_id,
  encounter_id,
  clinical_status,
  verification_status,
  type,
  category,
  criticality,
  code,
  reaction,
  recorded_at,
  recorder_practitioner_id,
  note,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  encounter_id = EXCLUDED.encounter_id,
  clinical_status = EXCLUDED.clinical_status,
  verification_status = EXCLUDED.verification_status,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  criticality = EXCLUDED.criticality,
  code = EXCLUDED.code,
  reaction = EXCLUDED.reaction,
  recorded_at = EXCLUDED.recorded_at,
  recorder_practitioner_id = EXCLUDED.recorder_practitioner_id,
  note = EXCLUDED.note,
  updated_at = EXCLUDED.updated_at`;
