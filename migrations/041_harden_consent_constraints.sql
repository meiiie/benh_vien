ALTER TABLE consents
  ADD CONSTRAINT consents_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(grantee_organization_id)) > 0
    AND length(trim(grantor_actor_id)) > 0
    AND (
      evidence_document_id IS NULL
      OR length(trim(evidence_document_id)) > 0
    )
    AND (
      revoked_by_actor_id IS NULL
      OR length(trim(revoked_by_actor_id)) > 0
    )
    AND (
      revocation_reason IS NULL
      OR length(trim(revocation_reason)) > 0
    )
  )
  NOT VALID;

ALTER TABLE consents
  VALIDATE CONSTRAINT consents_required_text_not_blank;

ALTER TABLE consents
  ADD CONSTRAINT consents_timeline_order
  CHECK (
    updated_at >= created_at
    AND (
      revoked_at IS NULL
      OR revoked_at >= valid_from
    )
    AND (
      revoked_at IS NULL
      OR valid_until IS NULL
      OR revoked_at <= valid_until
    )
  )
  NOT VALID;

ALTER TABLE consents
  VALIDATE CONSTRAINT consents_timeline_order;
