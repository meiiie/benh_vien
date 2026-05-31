ALTER TABLE record_transfer_delivery_attempts
  ADD CONSTRAINT record_transfer_delivery_attempt_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(record_transfer_id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(target_endpoint_id)) > 0
    AND length(trim(target_endpoint_address)) > 0
    AND length(trim(bundle_id)) > 0
    AND length(trim(idempotency_key)) > 0
    AND (
      response_body_preview IS NULL
      OR length(trim(response_body_preview)) > 0
    )
    AND (
      error_message IS NULL
      OR length(trim(error_message)) > 0
    )
  )
  NOT VALID;

ALTER TABLE record_transfer_delivery_attempts
  VALIDATE CONSTRAINT record_transfer_delivery_attempt_required_text_not_blank;

ALTER TABLE record_transfer_delivery_attempts
  ADD CONSTRAINT record_transfer_delivery_attempt_target_endpoint_http
  CHECK (target_endpoint_address ~* '^https?://')
  NOT VALID;

ALTER TABLE record_transfer_delivery_attempts
  VALIDATE CONSTRAINT record_transfer_delivery_attempt_target_endpoint_http;

ALTER TABLE record_transfer_delivery_attempts
  ADD CONSTRAINT record_transfer_delivery_attempt_persistence_timeline
  CHECK (
    updated_at >= created_at
    AND updated_at >= queued_at
  )
  NOT VALID;

ALTER TABLE record_transfer_delivery_attempts
  VALIDATE CONSTRAINT record_transfer_delivery_attempt_persistence_timeline;
