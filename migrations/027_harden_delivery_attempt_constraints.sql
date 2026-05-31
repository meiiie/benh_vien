ALTER TABLE record_transfer_delivery_attempts
  ADD CONSTRAINT record_transfer_delivery_attempt_completed_after_queued
  CHECK (
    completed_at IS NULL
    OR completed_at >= queued_at
  )
  NOT VALID;

ALTER TABLE record_transfer_delivery_attempts
  VALIDATE CONSTRAINT record_transfer_delivery_attempt_completed_after_queued;

ALTER TABLE record_transfer_delivery_attempts
  ADD CONSTRAINT record_transfer_delivery_attempt_updated_after_queued
  CHECK (updated_at >= queued_at)
  NOT VALID;

ALTER TABLE record_transfer_delivery_attempts
  VALIDATE CONSTRAINT record_transfer_delivery_attempt_updated_after_queued;

ALTER TABLE record_transfer_delivery_attempts
  ADD CONSTRAINT record_transfer_delivery_attempt_terminal_metadata
  CHECK (
    (
      status = 'queued'
      AND completed_at IS NULL
      AND http_status IS NULL
      AND response_body_preview IS NULL
      AND error_message IS NULL
    )
    OR (
      status = 'succeeded'
      AND completed_at IS NOT NULL
      AND http_status BETWEEN 200 AND 299
      AND error_message IS NULL
    )
    OR (
      status = 'failed'
      AND completed_at IS NOT NULL
      AND error_message IS NOT NULL
      AND length(trim(error_message)) > 0
      AND (
        http_status IS NULL
        OR http_status < 200
        OR http_status > 299
      )
    )
  )
  NOT VALID;

ALTER TABLE record_transfer_delivery_attempts
  VALIDATE CONSTRAINT record_transfer_delivery_attempt_terminal_metadata;

ALTER TABLE record_transfer_delivery_attempts
  ADD CONSTRAINT record_transfer_delivery_attempt_preview_length
  CHECK (
    response_body_preview IS NULL
    OR length(response_body_preview) <= 2000
  )
  NOT VALID;

ALTER TABLE record_transfer_delivery_attempts
  VALIDATE CONSTRAINT record_transfer_delivery_attempt_preview_length;
