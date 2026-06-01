import type {
  ServiceRequestCategory,
  ServiceRequestCode,
  ServiceRequestIntent,
  ServiceRequestPriority,
  ServiceRequestStatus
} from "@benh-vien-so/domain";

export type ServiceRequestRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  reason_condition_id: string | null;
  status: ServiceRequestStatus;
  intent: ServiceRequestIntent;
  category: ServiceRequestCategory;
  priority: ServiceRequestPriority;
  code: ServiceRequestCode | string;
  occurrence_at: Date | string | null;
  authored_on: Date | string;
  requester_practitioner_id: string;
  performer_organization_id: string | null;
  patient_instruction: string | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
