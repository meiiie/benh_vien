import type {
  WorkflowTaskBusinessStatus,
  WorkflowTaskCode,
  WorkflowTaskExecutionPeriod,
  WorkflowTaskIntent,
  WorkflowTaskPriority,
  WorkflowTaskReference,
  WorkflowTaskStatus
} from "@benh-vien-so/domain";

export type WorkflowTaskRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  based_on_service_request_id: string | null;
  status: WorkflowTaskStatus;
  intent: WorkflowTaskIntent;
  priority: WorkflowTaskPriority;
  code: WorkflowTaskCode | string;
  description: string | null;
  business_status: WorkflowTaskBusinessStatus | string | null;
  requester_practitioner_id: string | null;
  owner_organization_id: string | null;
  owner_practitioner_id: string | null;
  authored_on: Date | string;
  last_modified: Date | string;
  execution_period: WorkflowTaskExecutionPeriod | string | null;
  input_references: WorkflowTaskReference[] | string;
  output_references: WorkflowTaskReference[] | string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
