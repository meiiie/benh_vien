import {
  normalizeBundleType,
  normalizeOptional,
  normalizePriority,
  normalizeRequired,
  normalizeRetryCount,
  normalizeStatus,
  parseDate
} from "./record-transfer.validation.js";
import { validateRecordTransferSnapshot } from "./record-transfer.snapshot-validation.js";
import type {
  CreateRecordTransferInput,
  RecordTransferSnapshot
} from "./record-transfer.types.js";

export function buildRecordTransferSnapshot(
  input: CreateRecordTransferInput,
  now = new Date()
): RecordTransferSnapshot {
  const requestedAt = input.requestedAt
    ? parseDate(input.requestedAt, "Thời điểm yêu cầu chuyển hồ sơ không hợp lệ.")
    : now;
  const sentAt = input.sentAt
    ? parseDate(input.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.")
    : undefined;
  const receivedAt = input.receivedAt
    ? parseDate(input.receivedAt, "Thời điểm tiếp nhận hồ sơ không hợp lệ.")
    : undefined;
  const failedAt = input.failedAt
    ? parseDate(input.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.")
    : undefined;
  const nextRetryAt = input.nextRetryAt
    ? parseDate(input.nextRetryAt, "Thời điểm thử gửi lại hồ sơ không hợp lệ.")
    : undefined;
  const deadLetteredAt = input.deadLetteredAt
    ? parseDate(
        input.deadLetteredAt,
        "Thời điểm đưa hồ sơ vào hàng lỗi cuối không hợp lệ."
      )
    : undefined;
  const retryCount = normalizeRetryCount(input.retryCount ?? 0);
  const receivedByActorId = normalizeOptional(input.receivedByActorId);
  const acknowledgementReference = normalizeOptional(input.acknowledgementReference);
  const failureReason = normalizeOptional(input.failureReason);
  const status = normalizeStatus(input.status ?? "requested");
  const priority = normalizePriority(input.priority ?? "routine");
  const bundleType = normalizeBundleType(input.bundleType);

  const sourceOrganizationId = normalizeRequired(
    input.sourceOrganizationId,
    "Cần có cơ sở y tế gửi hồ sơ."
  );
  const recipientOrganizationId = normalizeRequired(
    input.recipientOrganizationId,
    "Cần có cơ sở y tế nhận hồ sơ."
  );

  const snapshot: RecordTransferSnapshot = {
    id: normalizeRequired(input.id, "Mã chuyển hồ sơ không được để trống."),
    patientId: normalizeRequired(input.patientId, "Chuyển hồ sơ phải gắn với một bệnh nhân."),
    status,
    priority,
    bundleType,
    bundleId: normalizeRequired(input.bundleId, "Cần có mã FHIR Bundle dùng để chuyển hồ sơ."),
    sourceOrganizationId,
    recipientOrganizationId,
    consentReference: normalizeRequired(
      input.consentReference,
      "Chuyển hồ sơ liên viện phải gắn với consent hợp lệ."
    ),
    requestedByActorId: normalizeRequired(
      input.requestedByActorId,
      "Cần có người hoặc cơ chế tạo yêu cầu chuyển hồ sơ."
    ),
    reason: normalizeRequired(input.reason, "Cần có lý do chuyển hồ sơ."),
    requestedAt: requestedAt.toISOString(),
    sentAt: sentAt?.toISOString(),
    receivedAt: receivedAt?.toISOString(),
    receivedByActorId,
    acknowledgementReference,
    failedAt: failedAt?.toISOString(),
    failureReason,
    nextRetryAt: nextRetryAt?.toISOString(),
    retryCount,
    deadLetteredAt: deadLetteredAt?.toISOString(),
    note: normalizeOptional(input.note),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  validateRecordTransferSnapshot(snapshot);

  return snapshot;
}

export function normalizePersistedRecordTransferSnapshot(
  snapshot: RecordTransferSnapshot
): RecordTransferSnapshot {
  const normalizedSnapshot: RecordTransferSnapshot = {
    ...snapshot,
    id: normalizeRequired(snapshot.id, "Mã chuyển hồ sơ không được để trống."),
    patientId: normalizeRequired(snapshot.patientId, "Chuyển hồ sơ phải gắn với một bệnh nhân."),
    status: normalizeStatus(snapshot.status),
    priority: normalizePriority(snapshot.priority),
    bundleType: normalizeBundleType(snapshot.bundleType),
    bundleId: normalizeRequired(snapshot.bundleId, "Cần có mã FHIR Bundle dùng để chuyển hồ sơ."),
    sourceOrganizationId: normalizeRequired(
      snapshot.sourceOrganizationId,
      "Cần có cơ sở y tế gửi hồ sơ."
    ),
    recipientOrganizationId: normalizeRequired(
      snapshot.recipientOrganizationId,
      "Cần có cơ sở y tế nhận hồ sơ."
    ),
    consentReference: normalizeRequired(
      snapshot.consentReference,
      "Chuyển hồ sơ liên viện phải gắn với consent hợp lệ."
    ),
    requestedByActorId: normalizeRequired(
      snapshot.requestedByActorId,
      "Cần có người hoặc cơ chế tạo yêu cầu chuyển hồ sơ."
    ),
    reason: normalizeRequired(snapshot.reason, "Cần có lý do chuyển hồ sơ."),
    requestedAt: parseDate(
      snapshot.requestedAt,
      "Thời điểm yêu cầu chuyển hồ sơ không hợp lệ."
    ).toISOString(),
    sentAt: snapshot.sentAt
      ? parseDate(snapshot.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.").toISOString()
      : undefined,
    receivedAt: snapshot.receivedAt
      ? parseDate(snapshot.receivedAt, "Thời điểm tiếp nhận hồ sơ không hợp lệ.").toISOString()
      : undefined,
    receivedByActorId: normalizeOptional(snapshot.receivedByActorId),
    acknowledgementReference: normalizeOptional(snapshot.acknowledgementReference),
    failedAt: snapshot.failedAt
      ? parseDate(snapshot.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.").toISOString()
      : undefined,
    failureReason: normalizeOptional(snapshot.failureReason),
    nextRetryAt: snapshot.nextRetryAt
      ? parseDate(snapshot.nextRetryAt, "Thời điểm thử gửi lại hồ sơ không hợp lệ.").toISOString()
      : undefined,
    retryCount: normalizeRetryCount(snapshot.retryCount),
    deadLetteredAt: snapshot.deadLetteredAt
      ? parseDate(
          snapshot.deadLetteredAt,
          "Thời điểm đưa hồ sơ vào hàng lỗi cuối không hợp lệ."
        ).toISOString()
      : undefined,
    note: normalizeOptional(snapshot.note),
    createdAt: parseDate(
      snapshot.createdAt,
      "Thời điểm tạo yêu cầu chuyển hồ sơ không hợp lệ."
    ).toISOString(),
    updatedAt: parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật yêu cầu chuyển hồ sơ không hợp lệ."
    ).toISOString()
  };

  validateRecordTransferSnapshot(normalizedSnapshot);

  return normalizedSnapshot;
}
