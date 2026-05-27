CREATE TABLE IF NOT EXISTS procedures (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  based_on_service_request_id text REFERENCES service_requests(id),
  part_of_procedure_id text REFERENCES procedures(id),
  status text NOT NULL CHECK (
    status IN (
      'preparation',
      'in-progress',
      'not-done',
      'on-hold',
      'stopped',
      'completed',
      'entered-in-error',
      'unknown'
    )
  ),
  status_reason jsonb,
  category text NOT NULL CHECK (
    category IN (
      'surgical',
      'diagnostic',
      'therapeutic',
      'counseling',
      'rehabilitation',
      'other'
    )
  ),
  code jsonb NOT NULL,
  performed_period jsonb,
  recorder_practitioner_id text,
  asserter_practitioner_id text,
  performers jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason_condition_id text REFERENCES conditions(id),
  body_site jsonb,
  outcome jsonb,
  report_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT procedures_performers_array CHECK (jsonb_typeof(performers) = 'array'),
  CONSTRAINT procedures_reports_array CHECK (jsonb_typeof(report_references) = 'array'),
  CONSTRAINT procedures_completed_has_performed_period CHECK (
    status <> 'completed'
    OR performed_period ? 'start'
    OR performed_period ? 'end'
  ),
  CONSTRAINT procedures_completed_has_performer CHECK (
    status <> 'completed'
    OR jsonb_array_length(performers) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_procedures_patient_performed
  ON procedures (patient_id, ((performed_period->>'start')) DESC);

CREATE INDEX IF NOT EXISTS idx_procedures_encounter
  ON procedures (encounter_id);

CREATE INDEX IF NOT EXISTS idx_procedures_based_on_service_request
  ON procedures (based_on_service_request_id);

CREATE INDEX IF NOT EXISTS idx_procedures_reason_condition
  ON procedures (reason_condition_id);

CREATE INDEX IF NOT EXISTS idx_procedures_code_gin
  ON procedures USING gin (code jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_procedures_report_references_gin
  ON procedures USING gin (report_references jsonb_path_ops);
