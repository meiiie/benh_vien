CREATE TABLE IF NOT EXISTS conditions (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  clinical_status text NOT NULL CHECK (
    clinical_status IN ('active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved')
  ),
  verification_status text NOT NULL CHECK (
    verification_status IN (
      'unconfirmed',
      'provisional',
      'differential',
      'confirmed',
      'refuted',
      'entered-in-error'
    )
  ),
  category text NOT NULL CHECK (category IN ('problem-list-item', 'encounter-diagnosis')),
  code jsonb NOT NULL,
  severity text CHECK (severity IN ('mild', 'moderate', 'severe')),
  onset_at timestamptz,
  recorded_at timestamptz NOT NULL,
  recorder_practitioner_id text NOT NULL,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conditions_patient_recorded
  ON conditions (patient_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_conditions_encounter
  ON conditions (encounter_id);

CREATE INDEX IF NOT EXISTS idx_conditions_code_gin
  ON conditions USING gin (code jsonb_path_ops);
