import type { ConsentCategory, ConsentStatus } from "@benh-vien-so/domain";

export type ConsentRow = {
  id: string;
  patient_id: string;
  status: ConsentStatus;
  category: ConsentCategory;
  grantee_organization_id: string;
  grantor_actor_id: string;
  evidence_document_id: string | null;
  revoked_by_actor_id: string | null;
  revoked_at: Date | string | null;
  revocation_reason: string | null;
  valid_from: Date | string;
  valid_until: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
