ALTER TABLE record_transfers
  ADD CONSTRAINT record_transfers_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(bundle_id)) > 0
    AND length(trim(source_organization_id)) > 0
    AND length(trim(recipient_organization_id)) > 0
    AND length(trim(consent_reference)) > 0
    AND length(trim(requested_by_actor_id)) > 0
    AND length(trim(reason)) > 0
    AND (
      received_by_actor_id IS NULL
      OR length(trim(received_by_actor_id)) > 0
    )
    AND (
      acknowledgement_reference IS NULL
      OR length(trim(acknowledgement_reference)) > 0
    )
    AND (
      failure_reason IS NULL
      OR length(trim(failure_reason)) > 0
    )
    AND (
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE record_transfers
  VALIDATE CONSTRAINT record_transfers_required_text_not_blank;

ALTER TABLE record_transfers
  ADD CONSTRAINT record_transfers_lifecycle_consistency
  CHECK (
    updated_at >= requested_at
    AND (
      failed_at IS NULL
      OR sent_at IS NULL
      OR failed_at >= sent_at
    )
    AND (
      status NOT IN ('draft', 'requested', 'ready')
      OR sent_at IS NULL
    )
    AND (
      status <> 'in-progress'
      OR sent_at IS NOT NULL
    )
    AND (
      status <> 'completed'
      OR (
        sent_at IS NOT NULL
        AND received_at IS NOT NULL
      )
    )
    AND (
      status = 'completed'
      OR (
        received_at IS NULL
        AND received_by_actor_id IS NULL
        AND acknowledgement_reference IS NULL
      )
    )
    AND (
      status IN ('failed', 'dead-lettered')
      OR (
        failed_at IS NULL
        AND failure_reason IS NULL
        AND next_retry_at IS NULL
      )
    )
    AND (
      status <> 'failed'
      OR (
        failed_at IS NOT NULL
        AND failure_reason IS NOT NULL
      )
    )
    AND (
      status <> 'dead-lettered'
      OR (
        failed_at IS NOT NULL
        AND failure_reason IS NOT NULL
        AND dead_lettered_at IS NOT NULL
        AND next_retry_at IS NULL
      )
    )
  )
  NOT VALID;

ALTER TABLE record_transfers
  VALIDATE CONSTRAINT record_transfers_lifecycle_consistency;
