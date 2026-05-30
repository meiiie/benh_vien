CREATE TABLE IF NOT EXISTS record_transfer_delivery_attempts (
  id text PRIMARY KEY,
  record_transfer_id text NOT NULL REFERENCES record_transfers(id) ON DELETE CASCADE,
  patient_id text NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  target_endpoint_id text NOT NULL,
  target_endpoint_address text NOT NULL,
  bundle_id text NOT NULL,
  bundle_type text NOT NULL CHECK (bundle_type IN ('collection', 'document')),
  idempotency_key text NOT NULL UNIQUE,
  attempt_number integer NOT NULL CHECK (attempt_number >= 1),
  status text NOT NULL CHECK (status IN ('queued', 'succeeded', 'failed')),
  queued_at timestamptz NOT NULL,
  completed_at timestamptz,
  http_status integer CHECK (http_status BETWEEN 100 AND 599),
  response_body_preview text,
  error_message text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  UNIQUE (record_transfer_id, attempt_number),
  CONSTRAINT record_transfer_delivery_attempt_completed_when_terminal CHECK (
    (status = 'queued' AND completed_at IS NULL)
    OR (status IN ('succeeded', 'failed') AND completed_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_record_transfer_delivery_attempts_transfer
  ON record_transfer_delivery_attempts (record_transfer_id, attempt_number);

CREATE INDEX IF NOT EXISTS idx_record_transfer_delivery_attempts_status
  ON record_transfer_delivery_attempts (status, queued_at);
