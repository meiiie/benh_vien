CREATE TABLE IF NOT EXISTS encounters (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  status text NOT NULL CHECK (status IN ('planned', 'in-progress', 'finished', 'cancelled', 'entered-in-error')),
  encounter_class text NOT NULL CHECK (encounter_class IN ('ambulatory', 'inpatient', 'emergency', 'virtual')),
  service_type text NOT NULL,
  reason_text text NOT NULL,
  department_id text,
  attending_practitioner_id text NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT encounters_period_valid CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX IF NOT EXISTS idx_encounters_patient_started
  ON encounters (patient_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_encounters_status
  ON encounters (status);
