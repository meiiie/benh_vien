CREATE TABLE IF NOT EXISTS consents (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  status text NOT NULL CHECK (status IN ('active', 'revoked', 'expired')),
  category text NOT NULL CHECK (category IN ('record-sharing')),
  grantee_organization_id text NOT NULL,
  grantor_actor_id text NOT NULL,
  evidence_document_id text,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT consents_period_valid CHECK (valid_until IS NULL OR valid_until > valid_from)
);

CREATE INDEX IF NOT EXISTS idx_consents_patient
  ON consents (patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consents_patient_grantee
  ON consents (patient_id, grantee_organization_id, status);
