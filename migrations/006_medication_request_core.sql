CREATE TABLE IF NOT EXISTS medication_requests (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  reason_condition_id text REFERENCES conditions(id),
  status text NOT NULL CHECK (
    status IN (
      'active',
      'on-hold',
      'cancelled',
      'completed',
      'entered-in-error',
      'stopped',
      'draft',
      'unknown'
    )
  ),
  intent text NOT NULL CHECK (
    intent IN (
      'proposal',
      'plan',
      'order',
      'original-order',
      'reflex-order',
      'filler-order',
      'instance-order',
      'option'
    )
  ),
  category text NOT NULL CHECK (category IN ('inpatient', 'outpatient', 'community', 'discharge')),
  priority text NOT NULL CHECK (priority IN ('routine', 'urgent', 'asap', 'stat')),
  medication_code jsonb NOT NULL,
  dosage_instruction jsonb NOT NULL,
  authored_on timestamptz NOT NULL,
  requester_practitioner_id text NOT NULL,
  expected_supply_duration_days integer CHECK (expected_supply_duration_days > 0),
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_medication_requests_patient_authored
  ON medication_requests (patient_id, authored_on DESC);

CREATE INDEX IF NOT EXISTS idx_medication_requests_encounter
  ON medication_requests (encounter_id);

CREATE INDEX IF NOT EXISTS idx_medication_requests_reason_condition
  ON medication_requests (reason_condition_id);

CREATE INDEX IF NOT EXISTS idx_medication_requests_code_gin
  ON medication_requests USING gin (medication_code jsonb_path_ops);
