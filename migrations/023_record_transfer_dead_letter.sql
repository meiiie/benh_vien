ALTER TABLE record_transfers
  ADD COLUMN IF NOT EXISTS dead_lettered_at timestamptz;

ALTER TABLE record_transfers
  DROP CONSTRAINT IF EXISTS record_transfers_status_check;

ALTER TABLE record_transfers
  ADD CONSTRAINT record_transfers_status_check CHECK (
    status IN (
      'draft',
      'requested',
      'ready',
      'in-progress',
      'completed',
      'cancelled',
      'failed',
      'dead-lettered'
    )
  ),
  ADD CONSTRAINT record_transfers_dead_letter_after_failed CHECK (
    dead_lettered_at IS NULL
    OR (
      failed_at IS NOT NULL
      AND dead_lettered_at >= failed_at
    )
  );

CREATE INDEX IF NOT EXISTS idx_record_transfers_dead_lettered
  ON record_transfers (dead_lettered_at DESC)
  WHERE status = 'dead-lettered';
