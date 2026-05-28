CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  checksum_sha256 text,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id text PRIMARY KEY,
  identifiers jsonb NOT NULL,
  full_name text NOT NULL,
  birth_date date,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other', 'unknown')),
  address text,
  phone text,
  managing_organization_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'merged', 'inactive')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT patients_identifiers_not_empty CHECK (jsonb_array_length(identifiers) > 0)
);

CREATE INDEX IF NOT EXISTS idx_patients_identifiers_gin
  ON patients USING gin (identifiers jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_patients_full_name
  ON patients (full_name);

CREATE INDEX IF NOT EXISTS idx_patients_managing_organization
  ON patients (managing_organization_id);

CREATE TABLE IF NOT EXISTS clinical_documents (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text,
  document_type text NOT NULL,
  title text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'signed', 'superseded', 'entered-in-error')),
  storage_uri text NOT NULL,
  author_practitioner_id text NOT NULL,
  signed_at timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clinical_documents_patient
  ON clinical_documents (patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  patient_id text,
  purpose_of_use text,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_events_patient_time
  ON audit_events (patient_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_resource
  ON audit_events (resource_type, resource_id);
