import { RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";
import type { RecordTransferDeliveryAttemptSnapshot } from "@benh-vien-so/domain";
import type { RecordTransferDeliveryAttemptRow } from "./postgres-record-transfer-delivery-attempt.types.js";

export function rowToRecordTransferDeliveryAttempt(
  row: RecordTransferDeliveryAttemptRow
): RecordTransferDeliveryAttempt {
  const snapshot: RecordTransferDeliveryAttemptSnapshot = {
    id: row.id,
    recordTransferId: row.record_transfer_id,
    patientId: row.patient_id,
    targetEndpointId: row.target_endpoint_id,
    targetEndpointAddress: row.target_endpoint_address,
    bundleId: row.bundle_id,
    bundleType: row.bundle_type,
    idempotencyKey: row.idempotency_key,
    attemptNumber: row.attempt_number,
    status: row.status,
    queuedAt: toIsoString(row.queued_at),
    completedAt: row.completed_at ? toIsoString(row.completed_at) : undefined,
    httpStatus: row.http_status ?? undefined,
    responseBodyPreview: row.response_body_preview ?? undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return RecordTransferDeliveryAttempt.rehydrate(snapshot);
}

export function recordTransferDeliveryAttemptToUpsertValues(
  attempt: RecordTransferDeliveryAttempt
): unknown[] {
  const snapshot = attempt.toSnapshot();

  return [
    snapshot.id,
    snapshot.recordTransferId,
    snapshot.patientId,
    snapshot.targetEndpointId,
    snapshot.targetEndpointAddress,
    snapshot.bundleId,
    snapshot.bundleType,
    snapshot.idempotencyKey,
    snapshot.attemptNumber,
    snapshot.status,
    snapshot.queuedAt,
    snapshot.completedAt ?? null,
    snapshot.httpStatus ?? null,
    snapshot.responseBodyPreview ?? null,
    snapshot.errorMessage ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
