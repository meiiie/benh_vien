CREATE TABLE IF NOT EXISTS record_transfers (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  status text NOT NULL CHECK (
    status IN (
      'draft',
      'requested',
      'ready',
      'in-progress',
      'completed',
      'cancelled',
      'failed'
    )
  ),
  priority text NOT NULL CHECK (
    priority IN (
      'routine',
      'urgent',
      'asap',
      'stat'
    )
  ),
  bundle_type text NOT NULL CHECK (
    bundle_type IN (
      'collection',
      'document'
    )
  ),
  bundle_id text NOT NULL,
  source_organization_id text NOT NULL,
  recipient_organization_id text NOT NULL,
  consent_reference text NOT NULL,
  requested_by_actor_id text NOT NULL,
  reason text NOT NULL,
  requested_at timestamptz NOT NULL,
  sent_at timestamptz,
  received_at timestamptz,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT record_transfers_distinct_organizations CHECK (
    source_organization_id <> recipient_organization_id
  ),
  CONSTRAINT record_transfers_sent_after_requested CHECK (
    sent_at IS NULL
    OR sent_at >= requested_at
  ),
  CONSTRAINT record_transfers_received_after_sent CHECK (
    received_at IS NULL
    OR (
      sent_at IS NOT NULL
      AND received_at >= sent_at
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_record_transfers_patient_requested
  ON record_transfers (patient_id, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_record_transfers_recipient_status
  ON record_transfers (recipient_organization_id, status);

CREATE INDEX IF NOT EXISTS idx_record_transfers_consent
  ON record_transfers (consent_reference);
