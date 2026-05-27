CREATE TABLE IF NOT EXISTS medication_administrations (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  medication_request_id text REFERENCES medication_requests(id),
  reason_condition_id text REFERENCES conditions(id),
  status text NOT NULL CHECK (
    status IN (
      'in-progress',
      'not-done',
      'on-hold',
      'completed',
      'entered-in-error',
      'stopped',
      'unknown'
    )
  ),
  status_reason jsonb,
  category text NOT NULL CHECK (
    category IN (
      'inpatient',
      'outpatient',
      'community',
      'patient-specified'
    )
  ),
  medication_code jsonb NOT NULL,
  effective_period jsonb NOT NULL DEFAULT '{}'::jsonb,
  performers jsonb NOT NULL DEFAULT '[]'::jsonb,
  dosage jsonb,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT medication_administrations_effective_period_object CHECK (
    jsonb_typeof(effective_period) = 'object'
  ),
  CONSTRAINT medication_administrations_performers_array CHECK (
    jsonb_typeof(performers) = 'array'
  ),
  CONSTRAINT medication_administrations_completed_has_effective_period CHECK (
    status <> 'completed'
    OR effective_period ? 'start'
    OR effective_period ? 'end'
  ),
  CONSTRAINT medication_administrations_completed_has_performer CHECK (
    status <> 'completed'
    OR jsonb_array_length(performers) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_medication_administrations_patient_effective
  ON medication_administrations (patient_id, ((effective_period->>'start')) DESC);

CREATE INDEX IF NOT EXISTS idx_medication_administrations_encounter
  ON medication_administrations (encounter_id);

CREATE INDEX IF NOT EXISTS idx_medication_administrations_medication_request
  ON medication_administrations (medication_request_id);

CREATE INDEX IF NOT EXISTS idx_medication_administrations_reason_condition
  ON medication_administrations (reason_condition_id);

CREATE INDEX IF NOT EXISTS idx_medication_administrations_medication_code_gin
  ON medication_administrations USING gin (medication_code jsonb_path_ops);
