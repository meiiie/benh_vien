CREATE TABLE IF NOT EXISTS imaging_studies (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  based_on_service_request_id text REFERENCES service_requests(id),
  diagnostic_report_id text REFERENCES diagnostic_reports(id),
  status text NOT NULL CHECK (
    status IN ('registered', 'available', 'cancelled', 'entered-in-error', 'unknown')
  ),
  study_instance_uid text NOT NULL,
  accession_number text,
  description text,
  started_at timestamptz,
  referrer_practitioner_id text,
  interpreter_practitioner_id text,
  endpoint_id text,
  number_of_series integer NOT NULL CHECK (number_of_series >= 0),
  number_of_instances integer NOT NULL CHECK (number_of_instances >= 0),
  series jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT imaging_studies_series_array CHECK (jsonb_typeof(series) = 'array'),
  CONSTRAINT imaging_studies_has_series CHECK (jsonb_array_length(series) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_imaging_studies_study_instance_uid
  ON imaging_studies (study_instance_uid);

CREATE INDEX IF NOT EXISTS idx_imaging_studies_patient_started
  ON imaging_studies (patient_id, (COALESCE(started_at, created_at)) DESC);

CREATE INDEX IF NOT EXISTS idx_imaging_studies_encounter
  ON imaging_studies (encounter_id);

CREATE INDEX IF NOT EXISTS idx_imaging_studies_based_on_service_request
  ON imaging_studies (based_on_service_request_id);

CREATE INDEX IF NOT EXISTS idx_imaging_studies_diagnostic_report
  ON imaging_studies (diagnostic_report_id);

CREATE INDEX IF NOT EXISTS idx_imaging_studies_series_gin
  ON imaging_studies USING gin (series jsonb_path_ops);
