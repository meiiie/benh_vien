CREATE TABLE IF NOT EXISTS service_requests (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  reason_condition_id text REFERENCES conditions(id),
  status text NOT NULL CHECK (
    status IN ('draft', 'active', 'on-hold', 'revoked', 'completed', 'entered-in-error', 'unknown')
  ),
  intent text NOT NULL CHECK (
    intent IN (
      'proposal',
      'plan',
      'directive',
      'order',
      'original-order',
      'reflex-order',
      'filler-order',
      'instance-order',
      'option'
    )
  ),
  category text NOT NULL CHECK (
    category IN ('laboratory', 'imaging', 'procedure', 'consultation', 'therapy')
  ),
  priority text NOT NULL CHECK (priority IN ('routine', 'urgent', 'asap', 'stat')),
  code jsonb NOT NULL,
  occurrence_at timestamptz,
  authored_on timestamptz NOT NULL,
  requester_practitioner_id text NOT NULL,
  performer_organization_id text,
  patient_instruction text,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_requests_patient_authored
  ON service_requests (patient_id, authored_on DESC);

CREATE INDEX IF NOT EXISTS idx_service_requests_encounter
  ON service_requests (encounter_id);

CREATE INDEX IF NOT EXISTS idx_service_requests_reason_condition
  ON service_requests (reason_condition_id);

CREATE INDEX IF NOT EXISTS idx_service_requests_code_gin
  ON service_requests USING gin (code jsonb_path_ops);
