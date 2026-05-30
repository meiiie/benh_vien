ALTER TABLE record_transfers
  ADD COLUMN IF NOT EXISTS received_by_actor_id text,
  ADD COLUMN IF NOT EXISTS acknowledgement_reference text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'record_transfers_acknowledgement_after_received'
      AND conrelid = 'record_transfers'::regclass
  ) THEN
    ALTER TABLE record_transfers
      ADD CONSTRAINT record_transfers_acknowledgement_after_received CHECK (
        (
          received_by_actor_id IS NULL
          AND acknowledgement_reference IS NULL
        )
        OR received_at IS NOT NULL
      );
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_record_transfers_acknowledgement_reference
  ON record_transfers (acknowledgement_reference)
  WHERE acknowledgement_reference IS NOT NULL;
