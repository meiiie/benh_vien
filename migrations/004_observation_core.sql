CREATE TABLE IF NOT EXISTS observations (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  status text NOT NULL CHECK (
    status IN ('registered', 'preliminary', 'final', 'amended', 'cancelled', 'entered-in-error')
  ),
  category text NOT NULL CHECK (category IN ('vital-signs', 'laboratory')),
  code jsonb NOT NULL,
  effective_at timestamptz NOT NULL,
  value_quantity jsonb,
  value_text text,
  performer_practitioner_id text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT observations_value_oneof CHECK (
    (value_quantity IS NOT NULL AND value_text IS NULL)
    OR (value_quantity IS NULL AND value_text IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_observations_patient_effective
  ON observations (patient_id, effective_at DESC);

CREATE INDEX IF NOT EXISTS idx_observations_encounter
  ON observations (encounter_id);

CREATE INDEX IF NOT EXISTS idx_observations_code_gin
  ON observations USING gin (code jsonb_path_ops);
