import { RecordTransfer } from "@benh-vien-so/domain";
import type { RecordTransferSnapshot } from "@benh-vien-so/domain";
import type { RecordTransferRow } from "./postgres-record-transfer.types.js";

export function rowToRecordTransfer(row: RecordTransferRow): RecordTransfer {
  const snapshot: RecordTransferSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    priority: row.priority,
    bundleType: row.bundle_type,
    bundleId: row.bundle_id,
    sourceOrganizationId: row.source_organization_id,
    recipientOrganizationId: row.recipient_organization_id,
    consentReference: row.consent_reference,
    requestedByActorId: row.requested_by_actor_id,
    reason: row.reason,
    requestedAt: toIsoString(row.requested_at),
    sentAt: row.sent_at ? toIsoString(row.sent_at) : undefined,
    receivedAt: row.received_at ? toIsoString(row.received_at) : undefined,
    receivedByActorId: row.received_by_actor_id ?? undefined,
    acknowledgementReference: row.acknowledgement_reference ?? undefined,
    failedAt: row.failed_at ? toIsoString(row.failed_at) : undefined,
    failureReason: row.failure_reason ?? undefined,
    nextRetryAt: row.next_retry_at ? toIsoString(row.next_retry_at) : undefined,
    retryCount: row.retry_count,
    deadLetteredAt: row.dead_lettered_at ? toIsoString(row.dead_lettered_at) : undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return RecordTransfer.rehydrate(snapshot);
}

export function recordTransferToUpsertValues(
  recordTransfer: RecordTransfer
): unknown[] {
  const snapshot = recordTransfer.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.status,
    snapshot.priority,
    snapshot.bundleType,
    snapshot.bundleId,
    snapshot.sourceOrganizationId,
    snapshot.recipientOrganizationId,
    snapshot.consentReference,
    snapshot.requestedByActorId,
    snapshot.reason,
    snapshot.requestedAt,
    snapshot.sentAt ?? null,
    snapshot.receivedAt ?? null,
    snapshot.receivedByActorId ?? null,
    snapshot.acknowledgementReference ?? null,
    snapshot.failedAt ?? null,
    snapshot.failureReason ?? null,
    snapshot.nextRetryAt ?? null,
    snapshot.retryCount,
    snapshot.deadLetteredAt ?? null,
    snapshot.note ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
