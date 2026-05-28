ALTER TABLE record_transfers
  ADD COLUMN failed_at timestamptz,
  ADD COLUMN failure_reason text,
  ADD COLUMN next_retry_at timestamptz,
  ADD COLUMN retry_count integer NOT NULL DEFAULT 0;

ALTER TABLE record_transfers
  ADD CONSTRAINT record_transfers_retry_count_non_negative CHECK (retry_count >= 0),
  ADD CONSTRAINT record_transfers_failed_after_requested CHECK (
    failed_at IS NULL
    OR failed_at >= requested_at
  ),
  ADD CONSTRAINT record_transfers_next_retry_after_failed CHECK (
    next_retry_at IS NULL
    OR (
      failed_at IS NOT NULL
      AND next_retry_at >= failed_at
    )
  );

CREATE INDEX IF NOT EXISTS idx_record_transfers_retry_schedule
  ON record_transfers (status, next_retry_at)
  WHERE status = 'failed';
