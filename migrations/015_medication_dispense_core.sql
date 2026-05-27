CREATE TABLE IF NOT EXISTS medication_dispenses (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  medication_request_id text REFERENCES medication_requests(id),
  status text NOT NULL CHECK (
    status IN (
      'preparation',
      'in-progress',
      'cancelled',
      'on-hold',
      'completed',
      'entered-in-error',
      'stopped',
      'declined',
      'unknown'
    )
  ),
  status_reason jsonb,
  category text NOT NULL CHECK (
    category IN (
      'inpatient',
      'outpatient',
      'community',
      'discharge'
    )
  ),
  medication_code jsonb NOT NULL,
  quantity jsonb,
  days_supply jsonb,
  when_prepared timestamptz,
  when_handed_over timestamptz,
  dispenser_practitioner_id text,
  destination_location_id text,
  receiver_practitioner_id text,
  dosage_instruction jsonb,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT medication_dispenses_medication_code_object CHECK (
    jsonb_typeof(medication_code) = 'object'
  ),
  CONSTRAINT medication_dispenses_quantity_object CHECK (
    quantity IS NULL OR jsonb_typeof(quantity) = 'object'
  ),
  CONSTRAINT medication_dispenses_days_supply_object CHECK (
    days_supply IS NULL OR jsonb_typeof(days_supply) = 'object'
  ),
  CONSTRAINT medication_dispenses_dosage_instruction_object CHECK (
    dosage_instruction IS NULL OR jsonb_typeof(dosage_instruction) = 'object'
  ),
  CONSTRAINT medication_dispenses_completed_has_handover CHECK (
    status <> 'completed'
    OR when_handed_over IS NOT NULL
  ),
  CONSTRAINT medication_dispenses_completed_has_quantity CHECK (
    status <> 'completed'
    OR quantity IS NOT NULL
  ),
  CONSTRAINT medication_dispenses_handover_after_prepared CHECK (
    when_prepared IS NULL
    OR when_handed_over IS NULL
    OR when_handed_over >= when_prepared
  )
);

CREATE INDEX IF NOT EXISTS idx_medication_dispenses_patient_handed
  ON medication_dispenses (patient_id, (COALESCE(when_handed_over, when_prepared, updated_at)) DESC);

CREATE INDEX IF NOT EXISTS idx_medication_dispenses_encounter
  ON medication_dispenses (encounter_id);

CREATE INDEX IF NOT EXISTS idx_medication_dispenses_medication_request
  ON medication_dispenses (medication_request_id);

CREATE INDEX IF NOT EXISTS idx_medication_dispenses_medication_code_gin
  ON medication_dispenses USING gin (medication_code jsonb_path_ops);
