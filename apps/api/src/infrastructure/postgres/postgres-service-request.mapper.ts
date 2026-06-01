import { ServiceRequest } from "@benh-vien-so/domain";
import type {
  ServiceRequestCode,
  ServiceRequestSnapshot
} from "@benh-vien-so/domain";
import type { ServiceRequestRow } from "./postgres-service-request.types.js";

export function rowToServiceRequest(row: ServiceRequestRow): ServiceRequest {
  const snapshot: ServiceRequestSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    reasonConditionId: row.reason_condition_id ?? undefined,
    status: row.status,
    intent: row.intent,
    category: row.category,
    priority: row.priority,
    code: parseJson<ServiceRequestCode>(row.code),
    occurrenceAt: row.occurrence_at ? toIsoString(row.occurrence_at) : undefined,
    authoredOn: toIsoString(row.authored_on),
    requesterPractitionerId: row.requester_practitioner_id,
    performerOrganizationId: row.performer_organization_id ?? undefined,
    patientInstruction: row.patient_instruction ?? undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return ServiceRequest.rehydrate(snapshot);
}

export function serviceRequestToUpsertValues(
  serviceRequest: ServiceRequest
): unknown[] {
  const snapshot = serviceRequest.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.reasonConditionId ?? null,
    snapshot.status,
    snapshot.intent,
    snapshot.category,
    snapshot.priority,
    JSON.stringify(snapshot.code),
    snapshot.occurrenceAt ?? null,
    snapshot.authoredOn,
    snapshot.requesterPractitionerId,
    snapshot.performerOrganizationId ?? null,
    snapshot.patientInstruction ?? null,
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
