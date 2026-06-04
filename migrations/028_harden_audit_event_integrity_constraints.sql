ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_required_text_not_blank
  CHECK (
    length(trim(actor_id)) > 0
    AND length(trim(action)) > 0
    AND length(trim(resource_type)) > 0
    AND length(trim(resource_id)) > 0
  )
  NOT VALID;

ALTER TABLE audit_events
  VALIDATE CONSTRAINT audit_events_required_text_not_blank;

ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_metadata_is_object
  CHECK (jsonb_typeof(metadata) = 'object')
  NOT VALID;

ALTER TABLE audit_events
  VALIDATE CONSTRAINT audit_events_metadata_is_object;

ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_integrity_hash_shape
  CHECK (
    (
      hash_algorithm IS NULL
      AND previous_hash IS NULL
      AND payload_hash IS NULL
      AND integrity_hash IS NULL
    )
    OR (
      hash_algorithm = 'sha256'
      AND payload_hash ~ '^[a-f0-9]{64}$'
      AND integrity_hash ~ '^[a-f0-9]{64}$'
      AND (
        previous_hash IS NULL
        OR previous_hash ~ '^[a-f0-9]{64}$'
      )
    )
  )
  NOT VALID;

ALTER TABLE audit_events
  VALIDATE CONSTRAINT audit_events_integrity_hash_shape;
