CREATE TABLE IF NOT EXISTS allergy_intolerances (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  clinical_status text NOT NULL CHECK (clinical_status IN ('active', 'inactive', 'resolved')),
  verification_status text NOT NULL CHECK (
    verification_status IN ('unconfirmed', 'confirmed', 'refuted', 'entered-in-error')
  ),
  type text NOT NULL CHECK (type IN ('allergy', 'intolerance')),
  category text NOT NULL CHECK (category IN ('food', 'medication', 'environment', 'biologic')),
  criticality text CHECK (criticality IN ('low', 'high', 'unable-to-assess')),
  code jsonb NOT NULL,
  reaction jsonb,
  recorded_at timestamptz NOT NULL,
  recorder_practitioner_id text NOT NULL,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_allergy_intolerances_patient_recorded
  ON allergy_intolerances (patient_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_allergy_intolerances_encounter
  ON allergy_intolerances (encounter_id);

CREATE INDEX IF NOT EXISTS idx_allergy_intolerances_code_gin
  ON allergy_intolerances USING gin (code jsonb_path_ops);
