ALTER TABLE consents
  ADD COLUMN IF NOT EXISTS revoked_by_actor_id text,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS revocation_reason text;

ALTER TABLE consents
  ADD CONSTRAINT consents_revocation_state_check
  CHECK (
    (status = 'revoked' AND revoked_by_actor_id IS NOT NULL AND revoked_at IS NOT NULL)
    OR (
      status <> 'revoked'
      AND revoked_by_actor_id IS NULL
      AND revoked_at IS NULL
      AND revocation_reason IS NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_consents_revoked_at
  ON consents (revoked_at)
  WHERE status = 'revoked';
