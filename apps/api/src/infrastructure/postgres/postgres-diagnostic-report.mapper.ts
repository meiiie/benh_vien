import { DiagnosticReport } from "@benh-vien-so/domain";
import type {
  DiagnosticReportCode,
  DiagnosticReportSnapshot
} from "@benh-vien-so/domain";
import type { DiagnosticReportRow } from "./postgres-diagnostic-report.types.js";

export function rowToDiagnosticReport(row: DiagnosticReportRow): DiagnosticReport {
  const snapshot: DiagnosticReportSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    basedOnServiceRequestId: row.based_on_service_request_id ?? undefined,
    status: row.status,
    category: row.category,
    code: parseJson<DiagnosticReportCode>(row.code),
    effectiveAt: toIsoString(row.effective_at),
    issuedAt: toIsoString(row.issued_at),
    performerOrganizationId: row.performer_organization_id ?? undefined,
    resultsInterpreterPractitionerId: row.results_interpreter_practitioner_id ?? undefined,
    resultObservationIds: parseJson<string[]>(row.result_observation_ids),
    conclusion: row.conclusion ?? undefined,
    presentedFormUrl: row.presented_form_url ?? undefined,
    presentedFormTitle: row.presented_form_title ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return DiagnosticReport.rehydrate(snapshot);
}

export function diagnosticReportToUpsertValues(
  diagnosticReport: DiagnosticReport
): unknown[] {
  const snapshot = diagnosticReport.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.basedOnServiceRequestId ?? null,
    snapshot.status,
    snapshot.category,
    JSON.stringify(snapshot.code),
    snapshot.effectiveAt,
    snapshot.issuedAt,
    snapshot.performerOrganizationId ?? null,
    snapshot.resultsInterpreterPractitionerId ?? null,
    JSON.stringify(snapshot.resultObservationIds),
    snapshot.conclusion ?? null,
    snapshot.presentedFormUrl ?? null,
    snapshot.presentedFormTitle ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
