import { WorkflowTask } from "@benh-vien-so/domain";
import type {
  WorkflowTaskBusinessStatus,
  WorkflowTaskCode,
  WorkflowTaskExecutionPeriod,
  WorkflowTaskReference,
  WorkflowTaskSnapshot
} from "@benh-vien-so/domain";
import type { WorkflowTaskRow } from "./postgres-workflow-task.types.js";

export function rowToWorkflowTask(row: WorkflowTaskRow): WorkflowTask {
  const snapshot: WorkflowTaskSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    basedOnServiceRequestId: row.based_on_service_request_id ?? undefined,
    status: row.status,
    intent: row.intent,
    priority: row.priority,
    code: parseJson<WorkflowTaskCode>(row.code),
    description: row.description ?? undefined,
    businessStatus: row.business_status
      ? parseJson<WorkflowTaskBusinessStatus>(row.business_status)
      : undefined,
    requesterPractitionerId: row.requester_practitioner_id ?? undefined,
    ownerOrganizationId: row.owner_organization_id ?? undefined,
    ownerPractitionerId: row.owner_practitioner_id ?? undefined,
    authoredOn: toIsoString(row.authored_on),
    lastModified: toIsoString(row.last_modified),
    executionPeriod: row.execution_period
      ? parseJson<WorkflowTaskExecutionPeriod>(row.execution_period)
      : undefined,
    inputReferences: parseJson<WorkflowTaskReference[]>(row.input_references),
    outputReferences: parseJson<WorkflowTaskReference[]>(row.output_references),
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return WorkflowTask.rehydrate(snapshot);
}

export function workflowTaskToUpsertValues(task: WorkflowTask): unknown[] {
  const snapshot = task.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.basedOnServiceRequestId ?? null,
    snapshot.status,
    snapshot.intent,
    snapshot.priority,
    JSON.stringify(snapshot.code),
    snapshot.description ?? null,
    snapshot.businessStatus ? JSON.stringify(snapshot.businessStatus) : null,
    snapshot.requesterPractitionerId ?? null,
    snapshot.ownerOrganizationId ?? null,
    snapshot.ownerPractitionerId ?? null,
    snapshot.authoredOn,
    snapshot.lastModified,
    snapshot.executionPeriod ? JSON.stringify(snapshot.executionPeriod) : null,
    JSON.stringify(snapshot.inputReferences),
    JSON.stringify(snapshot.outputReferences),
    snapshot.note ?? null,
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
