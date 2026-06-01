import {
  normalizeAttemptNumber,
  normalizeBundleType,
  normalizeEndpointAddress,
  normalizeHttpStatus,
  normalizeOptional,
  normalizeRequired,
  normalizeResponseBodyPreview,
  normalizeStatus,
  parseDate,
  validatePersistenceTimeline,
  validateTerminalState
} from "./record-transfer-delivery-attempt.validation.js";
import type {
  QueueRecordTransferDeliveryAttemptInput,
  RecordTransferDeliveryAttemptSnapshot
} from "./record-transfer-delivery-attempt.types.js";

export function buildQueuedDeliveryAttemptSnapshot(
  input: QueueRecordTransferDeliveryAttemptInput,
  now = new Date()
): RecordTransferDeliveryAttemptSnapshot {
  const queuedAt = input.queuedAt
    ? parseDate(input.queuedAt, "Thời điểm xếp hàng gửi hồ sơ không hợp lệ.")
    : now;

  return {
    id: normalizeRequired(input.id, "Mã lần gửi hồ sơ không được để trống."),
    recordTransferId: normalizeRequired(
      input.recordTransferId,
      "Lần gửi phải gắn với một yêu cầu chuyển hồ sơ."
    ),
    patientId: normalizeRequired(input.patientId, "Lần gửi phải gắn với một bệnh nhân."),
    targetEndpointId: normalizeRequired(
      input.targetEndpointId,
      "Lần gửi phải có endpoint đích."
    ),
    targetEndpointAddress: normalizeEndpointAddress(input.targetEndpointAddress),
    bundleId: normalizeRequired(input.bundleId, "Lần gửi phải có mã FHIR Bundle."),
    bundleType: normalizeBundleType(input.bundleType),
    idempotencyKey: normalizeRequired(
      input.idempotencyKey,
      "Lần gửi phải có idempotency key."
    ),
    attemptNumber: normalizeAttemptNumber(input.attemptNumber),
    status: "queued",
    queuedAt: queuedAt.toISOString(),
    createdAt: queuedAt.toISOString(),
    updatedAt: queuedAt.toISOString()
  };
}

export function buildRehydratedDeliveryAttemptSnapshot(
  snapshot: RecordTransferDeliveryAttemptSnapshot
): RecordTransferDeliveryAttemptSnapshot {
  const status = normalizeStatus(snapshot.status);
  const queuedAt = parseDate(
    snapshot.queuedAt,
    "Thời điểm xếp hàng gửi hồ sơ không hợp lệ."
  );
  const completedAt = snapshot.completedAt
    ? parseDate(snapshot.completedAt, "Thời điểm hoàn tất gửi hồ sơ không hợp lệ.")
    : undefined;
  const httpStatus =
    snapshot.httpStatus === undefined ? undefined : normalizeHttpStatus(snapshot.httpStatus);
  const responseBodyPreview = normalizeResponseBodyPreview(snapshot.responseBodyPreview);
  const errorMessage = normalizeOptional(snapshot.errorMessage);
  const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo lần gửi không hợp lệ.");
  const updatedAt = parseDate(
    snapshot.updatedAt,
    "Thời điểm cập nhật lần gửi không hợp lệ."
  );

  validateTerminalState({
    status,
    queuedAt,
    completedAt,
    httpStatus,
    responseBodyPreview,
    errorMessage
  });
  validatePersistenceTimeline({ queuedAt, createdAt, updatedAt });

  return {
    ...snapshot,
    id: normalizeRequired(snapshot.id, "Mã lần gửi hồ sơ không được để trống."),
    recordTransferId: normalizeRequired(
      snapshot.recordTransferId,
      "Lần gửi phải gắn với một yêu cầu chuyển hồ sơ."
    ),
    patientId: normalizeRequired(snapshot.patientId, "Lần gửi phải gắn với một bệnh nhân."),
    targetEndpointId: normalizeRequired(
      snapshot.targetEndpointId,
      "Lần gửi phải có endpoint đích."
    ),
    targetEndpointAddress: normalizeEndpointAddress(snapshot.targetEndpointAddress),
    bundleId: normalizeRequired(snapshot.bundleId, "Lần gửi phải có mã FHIR Bundle."),
    bundleType: normalizeBundleType(snapshot.bundleType),
    idempotencyKey: normalizeRequired(
      snapshot.idempotencyKey,
      "Lần gửi phải có idempotency key."
    ),
    attemptNumber: normalizeAttemptNumber(snapshot.attemptNumber),
    status,
    queuedAt: queuedAt.toISOString(),
    completedAt: completedAt?.toISOString(),
    httpStatus,
    responseBodyPreview,
    errorMessage,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString()
  };
}
