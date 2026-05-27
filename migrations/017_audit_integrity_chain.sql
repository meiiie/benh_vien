ALTER TABLE audit_events
  ADD COLUMN IF NOT EXISTS hash_algorithm text,
  ADD COLUMN IF NOT EXISTS previous_hash text,
  ADD COLUMN IF NOT EXISTS payload_hash text,
  ADD COLUMN IF NOT EXISTS integrity_hash text;

ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_hash_algorithm_check
  CHECK (hash_algorithm IS NULL OR hash_algorithm = 'sha256');

CREATE INDEX IF NOT EXISTS idx_audit_events_patient_chain
  ON audit_events (patient_id, id);

CREATE INDEX IF NOT EXISTS idx_audit_events_integrity_hash
  ON audit_events (integrity_hash)
  WHERE integrity_hash IS NOT NULL;
