import { DomainError } from "../shared/domain-error.js";
import {
  recordTransferBundleTypes,
  recordTransferPriorities,
  recordTransferStatuses
} from "./record-transfer.types.js";
import type {
  RecordTransferBundleType,
  RecordTransferPriority,
  RecordTransferSnapshot,
  RecordTransferStatus
} from "./record-transfer.types.js";

export function validateRecordTransferSnapshot(snapshot: RecordTransferSnapshot): void {
  const requestedAt = parseDate(
    snapshot.requestedAt,
    "Thời điểm yêu cầu chuyển hồ sơ không hợp lệ."
  );
  const sentAt = snapshot.sentAt
    ? parseDate(snapshot.sentAt, "Thời điểm gửi hồ sơ không hợp lệ.")
    : undefined;
  const receivedAt = snapshot.receivedAt
    ? parseDate(snapshot.receivedAt, "Thời điểm tiếp nhận hồ sơ không hợp lệ.")
    : undefined;
  const failedAt = snapshot.failedAt
    ? parseDate(snapshot.failedAt, "Thời điểm lỗi chuyển hồ sơ không hợp lệ.")
    : undefined;
  const nextRetryAt = snapshot.nextRetryAt
    ? parseDate(snapshot.nextRetryAt, "Thời điểm thử gửi lại hồ sơ không hợp lệ.")
    : undefined;
  const deadLetteredAt = snapshot.deadLetteredAt
    ? parseDate(snapshot.deadLetteredAt, "Thời điểm đưa hồ sơ vào hàng lỗi cuối không hợp lệ.")
    : undefined;
  parseDate(
    snapshot.createdAt,
    "Thời điểm tạo yêu cầu chuyển hồ sơ không hợp lệ."
  );
  const updatedAt = parseDate(
    snapshot.updatedAt,
    "Thời điểm cập nhật yêu cầu chuyển hồ sơ không hợp lệ."
  );
  const receivedByActorId = normalizeOptional(snapshot.receivedByActorId);
  const acknowledgementReference = normalizeOptional(snapshot.acknowledgementReference);
  const failureReason = normalizeOptional(snapshot.failureReason);
  const sourceOrganizationId = normalizeRequired(
    snapshot.sourceOrganizationId,
    "Cần có cơ sở y tế gửi hồ sơ."
  );
  const recipientOrganizationId = normalizeRequired(
    snapshot.recipientOrganizationId,
    "Cần có cơ sở y tế nhận hồ sơ."
  );
  const status = normalizeStatus(snapshot.status);

  normalizePriority(snapshot.priority);
  normalizeBundleType(snapshot.bundleType);

  if (updatedAt < requestedAt) {
    throw new DomainError("Thời điểm cập nhật yêu cầu chuyển hồ sơ không được trước thời điểm yêu cầu.");
  }

  if (sourceOrganizationId === recipientOrganizationId) {
    throw new DomainError("Cơ sở gửi và cơ sở nhận hồ sơ phải khác nhau.");
  }

  if (sentAt && sentAt < requestedAt) {
    throw new DomainError("Thời điểm gửi hồ sơ không được trước thời điểm yêu cầu.");
  }

  if (receivedAt && !sentAt) {
    throw new DomainError("Hồ sơ chỉ được ghi nhận tiếp nhận sau khi đã có thời điểm gửi.");
  }

  if (sentAt && receivedAt && receivedAt < sentAt) {
    throw new DomainError("Thời điểm tiếp nhận hồ sơ không được trước thời điểm gửi.");
  }

  if ((receivedByActorId || acknowledgementReference) && !receivedAt) {
    throw new DomainError(
      "Thông tin xác nhận nhận hồ sơ chỉ hợp lệ sau khi có thời điểm tiếp nhận."
    );
  }

  if (failedAt && failedAt < requestedAt) {
    throw new DomainError("Thời điểm lỗi chuyển hồ sơ không được trước thời điểm yêu cầu.");
  }

  if (sentAt && failedAt && failedAt < sentAt) {
    throw new DomainError("Thời điểm lỗi chuyển hồ sơ không được trước thời điểm gửi.");
  }

  if (nextRetryAt && !failedAt) {
    throw new DomainError("Chỉ được hẹn thử gửi lại sau khi đã ghi nhận lỗi chuyển hồ sơ.");
  }

  if (failedAt && nextRetryAt && nextRetryAt < failedAt) {
    throw new DomainError("Thời điểm thử gửi lại không được trước thời điểm lỗi chuyển hồ sơ.");
  }

  if (deadLetteredAt && !failedAt) {
    throw new DomainError("Chỉ được đưa hồ sơ vào hàng lỗi cuối sau khi đã ghi nhận lỗi chuyển hồ sơ.");
  }

  if (failedAt && deadLetteredAt && deadLetteredAt < failedAt) {
    throw new DomainError("Thời điểm đưa hồ sơ vào hàng lỗi cuối không được trước thời điểm lỗi chuyển hồ sơ.");
  }

  if ((status === "draft" || status === "requested" || status === "ready") && sentAt) {
    throw new DomainError("Hồ sơ chưa xử lý không được có thời điểm gửi.");
  }

  if (status === "in-progress" && !sentAt) {
    throw new DomainError("Hồ sơ đang xử lý phải có thời điểm gửi.");
  }

  if (status === "completed" && (!sentAt || !receivedAt)) {
    throw new DomainError("Hồ sơ hoàn tất phải có thời điểm gửi và thời điểm tiếp nhận.");
  }

  if (status !== "completed" && (receivedAt || receivedByActorId || acknowledgementReference)) {
    throw new DomainError("Thông tin tiếp nhận chỉ hợp lệ khi hồ sơ đã hoàn tất.");
  }

  if (status !== "failed" && status !== "dead-lettered" && (failedAt || failureReason || nextRetryAt)) {
    throw new DomainError("Thông tin lỗi hoặc lịch thử lại chỉ hợp lệ với hồ sơ đang lỗi.");
  }

  if (status === "failed" && (!failedAt || !failureReason)) {
    throw new DomainError("Hồ sơ lỗi cần có thời điểm lỗi và lý do lỗi.");
  }

  if (status === "dead-lettered" && (!failedAt || !failureReason || !deadLetteredAt)) {
    throw new DomainError("Hồ sơ đưa vào hàng lỗi cuối cần có thời điểm lỗi, lý do lỗi và thời điểm kết thúc retry.");
  }

  if (status === "dead-lettered" && nextRetryAt) {
    throw new DomainError("Hồ sơ đã vào hàng lỗi cuối không được giữ lịch thử gửi lại.");
  }

  if (deadLetteredAt && status !== "dead-lettered") {
    throw new DomainError("Thời điểm đưa vào hàng lỗi cuối chỉ hợp lệ với hồ sơ ở trạng thái dead-lettered.");
  }
}

export function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

export function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

export function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

export function normalizeStatus(value: RecordTransferStatus): RecordTransferStatus {
  if (!recordTransferStatuses.has(value)) {
    throw new DomainError("Trạng thái chuyển hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizePriority(value: RecordTransferPriority): RecordTransferPriority {
  if (!recordTransferPriorities.has(value)) {
    throw new DomainError("Mức ưu tiên chuyển hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizeBundleType(value: RecordTransferBundleType): RecordTransferBundleType {
  if (!recordTransferBundleTypes.has(value)) {
    throw new DomainError("Loại FHIR Bundle dùng để chuyển hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizeRetryCount(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError("Số lần thử gửi lại hồ sơ không hợp lệ.");
  }

  return value;
}
