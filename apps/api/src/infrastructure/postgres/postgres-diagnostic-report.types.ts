import type {
  DiagnosticReportCategory,
  DiagnosticReportCode,
  DiagnosticReportStatus
} from "@benh-vien-so/domain";

export type DiagnosticReportRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  based_on_service_request_id: string | null;
  status: DiagnosticReportStatus;
  category: DiagnosticReportCategory;
  code: DiagnosticReportCode | string;
  effective_at: Date | string;
  issued_at: Date | string;
  performer_organization_id: string | null;
  results_interpreter_practitioner_id: string | null;
  result_observation_ids: string[] | string;
  conclusion: string | null;
  presented_form_url: string | null;
  presented_form_title: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
