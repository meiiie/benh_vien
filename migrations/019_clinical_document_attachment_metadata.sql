ALTER TABLE clinical_documents
  ADD COLUMN IF NOT EXISTS attachment_content_type text,
  ADD COLUMN IF NOT EXISTS attachment_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS attachment_hash_sha1_base64 text,
  ADD COLUMN IF NOT EXISTS attachment_created_at timestamptz;

DO $$
BEGIN
  ALTER TABLE clinical_documents
    ADD CONSTRAINT clinical_documents_attachment_size_non_negative
    CHECK (
      attachment_size_bytes IS NULL OR
      (attachment_size_bytes >= 0 AND attachment_size_bytes <= 4294967295)
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
