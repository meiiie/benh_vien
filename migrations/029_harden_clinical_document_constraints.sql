ALTER TABLE clinical_documents
  ADD CONSTRAINT clinical_documents_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(document_type)) > 0
    AND length(trim(title)) > 0
    AND length(trim(storage_uri)) > 0
    AND length(trim(author_practitioner_id)) > 0
  )
  NOT VALID;

ALTER TABLE clinical_documents
  VALIDATE CONSTRAINT clinical_documents_required_text_not_blank;

ALTER TABLE clinical_documents
  ADD CONSTRAINT clinical_documents_type_check
  CHECK (
    document_type IN (
      'admission-note',
      'discharge-summary',
      'lab-report',
      'imaging-report',
      'referral-letter',
      'consent-form',
      'advance-directive',
      'ccda',
      'ccr',
      'medical-record',
      'patient-information'
    )
  )
  NOT VALID;

ALTER TABLE clinical_documents
  VALIDATE CONSTRAINT clinical_documents_type_check;

ALTER TABLE clinical_documents
  ADD CONSTRAINT clinical_documents_signed_timestamp_required
  CHECK (
    status <> 'signed'
    OR signed_at IS NOT NULL
  )
  NOT VALID;

ALTER TABLE clinical_documents
  VALIDATE CONSTRAINT clinical_documents_signed_timestamp_required;

ALTER TABLE clinical_documents
  ADD CONSTRAINT clinical_documents_timeline_order
  CHECK (
    updated_at >= created_at
    AND (
      signed_at IS NULL
      OR signed_at >= created_at
    )
  )
  NOT VALID;

ALTER TABLE clinical_documents
  VALIDATE CONSTRAINT clinical_documents_timeline_order;

ALTER TABLE clinical_documents
  ADD CONSTRAINT clinical_documents_attachment_metadata_shape
  CHECK (
    (
      attachment_content_type IS NULL
      OR length(trim(attachment_content_type)) > 0
    )
    AND (
      attachment_hash_sha1_base64 IS NULL
      OR attachment_hash_sha1_base64 ~ '^[A-Za-z0-9+/]{27}=$'
    )
  )
  NOT VALID;

ALTER TABLE clinical_documents
  VALIDATE CONSTRAINT clinical_documents_attachment_metadata_shape;
