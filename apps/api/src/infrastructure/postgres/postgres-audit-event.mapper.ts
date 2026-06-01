import { AuditEvent } from "@benh-vien-so/domain";
import type { AuditEventSnapshot } from "@benh-vien-so/domain";
import type { AuditEventRow } from "./postgres-audit-event.types.js";

export function rowToAuditEvent(row: AuditEventRow): AuditEvent {
  const metadata =
    typeof row.metadata === "string"
      ? (JSON.parse(row.metadata) as Record<string, unknown>)
      : row.metadata;

  const snapshot: AuditEventSnapshot = {
    id: String(row.id),
    occurredAt: toIsoString(row.occurred_at),
    actorId: row.actor_id,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    patientId: row.patient_id ?? undefined,
    purposeOfUse: row.purpose_of_use ?? undefined,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    metadata,
    hashAlgorithm: row.hash_algorithm ?? undefined,
    previousHash: row.previous_hash ?? undefined,
    payloadHash: row.payload_hash ?? undefined,
    integrityHash: row.integrity_hash ?? undefined
  };

  return AuditEvent.rehydrate(snapshot);
}

export function auditEventToInsertValues(snapshot: AuditEventSnapshot): unknown[] {
  return [
    snapshot.occurredAt,
    snapshot.actorId,
    snapshot.action,
    snapshot.resourceType,
    snapshot.resourceId,
    snapshot.patientId ?? null,
    snapshot.purposeOfUse ?? null,
    snapshot.ipAddress ?? null,
    snapshot.userAgent ?? null,
    JSON.stringify(snapshot.metadata)
  ];
}

export function auditEventIntegrityValues(snapshot: AuditEventSnapshot): unknown[] {
  return [
    snapshot.id,
    snapshot.hashAlgorithm,
    snapshot.previousHash ?? null,
    snapshot.payloadHash,
    snapshot.integrityHash
  ];
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
