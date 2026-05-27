CREATE TABLE IF NOT EXISTS diagnostic_reports (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  based_on_service_request_id text REFERENCES service_requests(id),
  status text NOT NULL CHECK (
    status IN (
      'registered',
      'partial',
      'preliminary',
      'final',
      'amended',
      'corrected',
      'appended',
      'cancelled',
      'entered-in-error',
      'unknown'
    )
  ),
  category text NOT NULL CHECK (category IN ('laboratory', 'imaging', 'pathology', 'other')),
  code jsonb NOT NULL,
  effective_at timestamptz NOT NULL,
  issued_at timestamptz NOT NULL,
  performer_organization_id text,
  results_interpreter_practitioner_id text,
  result_observation_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  conclusion text,
  presented_form_url text,
  presented_form_title text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT diagnostic_reports_result_observation_ids_array CHECK (
    jsonb_typeof(result_observation_ids) = 'array'
  ),
  CONSTRAINT diagnostic_reports_has_result_or_conclusion CHECK (
    jsonb_array_length(result_observation_ids) > 0
    OR conclusion IS NOT NULL
    OR presented_form_url IS NOT NULL
  ),
  CONSTRAINT diagnostic_reports_presented_title_requires_url CHECK (
    presented_form_title IS NULL OR presented_form_url IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_patient_issued
  ON diagnostic_reports (patient_id, issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_encounter
  ON diagnostic_reports (encounter_id);

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_based_on_service_request
  ON diagnostic_reports (based_on_service_request_id);

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_code_gin
  ON diagnostic_reports USING gin (code jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_result_ids_gin
  ON diagnostic_reports USING gin (result_observation_ids jsonb_path_ops);
