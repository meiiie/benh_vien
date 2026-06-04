import type {
  ProcedureCategory,
  ProcedureCoding,
  ProcedurePerformedPeriod,
  ProcedurePerformer,
  ProcedureReportReference,
  ProcedureStatus
} from "@benh-vien-so/domain";

export type ProcedureRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  based_on_service_request_id: string | null;
  part_of_procedure_id: string | null;
  status: ProcedureStatus;
  status_reason: ProcedureCoding | string | null;
  category: ProcedureCategory;
  code: ProcedureCoding | string;
  performed_period: ProcedurePerformedPeriod | string | null;
  recorder_practitioner_id: string | null;
  asserter_practitioner_id: string | null;
  performers: ProcedurePerformer[] | string;
  reason_condition_id: string | null;
  body_site: ProcedureCoding | string | null;
  outcome: ProcedureCoding | string | null;
  report_references: ProcedureReportReference[] | string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
