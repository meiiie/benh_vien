import { Procedure } from "@benh-vien-so/domain";
import type {
  ProcedureCoding,
  ProcedurePerformedPeriod,
  ProcedurePerformer,
  ProcedureReportReference,
  ProcedureSnapshot
} from "@benh-vien-so/domain";
import type { ProcedureRow } from "./postgres-procedure.types.js";

export function rowToProcedure(row: ProcedureRow): Procedure {
  const snapshot: ProcedureSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    basedOnServiceRequestId: row.based_on_service_request_id ?? undefined,
    partOfProcedureId: row.part_of_procedure_id ?? undefined,
    status: row.status,
    statusReason: row.status_reason ? parseJson<ProcedureCoding>(row.status_reason) : undefined,
    category: row.category,
    code: parseJson<ProcedureCoding>(row.code),
    performedPeriod: row.performed_period
      ? normalizePerformedPeriod(parseJson<ProcedurePerformedPeriod>(row.performed_period))
      : undefined,
    recorderPractitionerId: row.recorder_practitioner_id ?? undefined,
    asserterPractitionerId: row.asserter_practitioner_id ?? undefined,
    performers: parseJson<ProcedurePerformer[]>(row.performers),
    reasonConditionId: row.reason_condition_id ?? undefined,
    bodySite: row.body_site ? parseJson<ProcedureCoding>(row.body_site) : undefined,
    outcome: row.outcome ? parseJson<ProcedureCoding>(row.outcome) : undefined,
    reportReferences: parseJson<ProcedureReportReference[]>(row.report_references),
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Procedure.rehydrate(snapshot);
}

export function procedureToUpsertValues(procedure: Procedure): unknown[] {
  const snapshot = procedure.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.basedOnServiceRequestId ?? null,
    snapshot.partOfProcedureId ?? null,
    snapshot.status,
    snapshot.statusReason ? JSON.stringify(snapshot.statusReason) : null,
    snapshot.category,
    JSON.stringify(snapshot.code),
    snapshot.performedPeriod ? JSON.stringify(snapshot.performedPeriod) : null,
    snapshot.recorderPractitionerId ?? null,
    snapshot.asserterPractitionerId ?? null,
    JSON.stringify(snapshot.performers),
    snapshot.reasonConditionId ?? null,
    snapshot.bodySite ? JSON.stringify(snapshot.bodySite) : null,
    snapshot.outcome ? JSON.stringify(snapshot.outcome) : null,
    JSON.stringify(snapshot.reportReferences),
    snapshot.note ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function normalizePerformedPeriod(
  value: ProcedurePerformedPeriod
): ProcedurePerformedPeriod {
  return {
    start: value.start ? toIsoString(value.start) : undefined,
    end: value.end ? toIsoString(value.end) : undefined
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
