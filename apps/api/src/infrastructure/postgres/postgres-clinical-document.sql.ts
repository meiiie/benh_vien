export const selectClinicalDocumentSql = `SELECT
  id,
  patient_id,
  encounter_id,
  document_type,
  title,
  status,
  storage_uri,
  attachment_content_type,
  attachment_size_bytes,
  attachment_hash_sha1_base64,
  attachment_created_at,
  author_practitioner_id,
  signed_at,
  created_at,
  updated_at
  FROM clinical_documents`;

export const upsertClinicalDocumentSql = `INSERT INTO clinical_documents (
  id,
  patient_id,
  encounter_id,
  document_type,
  title,
  status,
  storage_uri,
  attachment_content_type,
  attachment_size_bytes,
  attachment_hash_sha1_base64,
  attachment_created_at,
  author_practitioner_id,
  signed_at,
  created_at,
  updated_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
ON CONFLICT (id) DO UPDATE SET
  patient_id = EXCLUDED.patient_id,
  encounter_id = EXCLUDED.encounter_id,
  document_type = EXCLUDED.document_type,
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  storage_uri = EXCLUDED.storage_uri,
  attachment_content_type = EXCLUDED.attachment_content_type,
  attachment_size_bytes = EXCLUDED.attachment_size_bytes,
  attachment_hash_sha1_base64 = EXCLUDED.attachment_hash_sha1_base64,
  attachment_created_at = EXCLUDED.attachment_created_at,
  author_practitioner_id = EXCLUDED.author_practitioner_id,
  signed_at = EXCLUDED.signed_at,
  updated_at = EXCLUDED.updated_at`;
