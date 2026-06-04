ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS merged_into_patient_id text REFERENCES patients(id),
  ADD COLUMN IF NOT EXISTS merged_at timestamptz,
  ADD COLUMN IF NOT EXISTS merged_by_actor_id text,
  ADD COLUMN IF NOT EXISTS merge_reason text;

ALTER TABLE patients
  ADD CONSTRAINT patients_merge_metadata_required
  CHECK (
    status <> 'merged'
    OR (
      merged_into_patient_id IS NOT NULL
      AND merged_into_patient_id <> id
      AND merged_at IS NOT NULL
      AND merged_by_actor_id IS NOT NULL
      AND merge_reason IS NOT NULL
      AND length(trim(merge_reason)) > 0
    )
  )
  NOT VALID;

ALTER TABLE patients
  VALIDATE CONSTRAINT patients_merge_metadata_required;

CREATE INDEX IF NOT EXISTS idx_patients_merged_into
  ON patients (merged_into_patient_id)
  WHERE merged_into_patient_id IS NOT NULL;
