import type {
  ClinicalDocumentStatus,
  ClinicalDocumentType
} from "@benh-vien-so/domain";

export type ClinicalDocumentRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  document_type: ClinicalDocumentType;
  title: string;
  status: ClinicalDocumentStatus;
  storage_uri: string;
  attachment_content_type: string | null;
  attachment_size_bytes: number | string | null;
  attachment_hash_sha1_base64: string | null;
  attachment_created_at: Date | string | null;
  author_practitioner_id: string;
  signed_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
