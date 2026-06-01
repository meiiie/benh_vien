import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";
import {
  deliveryAttemptBundleTypes,
  deliveryAttemptStatuses
} from "./record-transfer-delivery-attempt.types.js";
import type {
  RecordTransferDeliveryAttemptBundleType,
  RecordTransferDeliveryAttemptStatus
} from "./record-transfer-delivery-attempt.types.js";

const maxResponseBodyPreviewLength = 2_000;

export {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";

export function normalizeResponseBodyPreview(value: string | undefined): string | undefined {
  const normalized = value?.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, maxResponseBodyPreviewLength);
}

export function normalizeEndpointAddress(value: string): string {
  const normalized = normalizeRequired(value, "Địa chỉ endpoint đích không được để trống.");

  try {
    const url = new URL(normalized);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new DomainError("Endpoint FHIR đích phải dùng HTTP hoặc HTTPS.");
    }

    return normalized;
  } catch (error) {
    if (error instanceof DomainError) {
      throw error;
    }

    throw new DomainError("Địa chỉ endpoint FHIR đích không hợp lệ.");
  }
}

export function normalizeAttemptNumber(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new DomainError("Số thứ tự lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizeStatus(value: RecordTransferDeliveryAttemptStatus): RecordTransferDeliveryAttemptStatus {
  if (!deliveryAttemptStatuses.has(value)) {
    throw new DomainError("Trạng thái lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizeBundleType(
  value: RecordTransferDeliveryAttemptBundleType
): RecordTransferDeliveryAttemptBundleType {
  if (!deliveryAttemptBundleTypes.has(value)) {
    throw new DomainError("Loại FHIR Bundle của lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizeHttpStatus(value: number): number {
  if (!Number.isInteger(value) || value < 100 || value > 599) {
    throw new DomainError("HTTP status của lần gửi hồ sơ không hợp lệ.");
  }

  return value;
}

export function validateTerminalState(input: {
  readonly status: RecordTransferDeliveryAttemptStatus;
  readonly queuedAt: Date;
  readonly completedAt?: Date;
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage?: string;
}): void {
  if (
    input.status === "queued" &&
    (input.completedAt || input.httpStatus || input.responseBodyPreview || input.errorMessage)
  ) {
    throw new DomainError("Lần gửi đang chờ không được có metadata hoàn tất.");
  }

  if (input.status !== "queued" && !input.completedAt) {
    throw new DomainError("Lần gửi đã kết thúc phải có thời điểm hoàn tất.");
  }

  if (input.completedAt) {
    assertCompletedAtIsNotBeforeQueuedAt(input.completedAt, input.queuedAt);
  }

  if (
    input.status === "succeeded" &&
    (input.httpStatus === undefined || input.httpStatus < 200 || input.httpStatus > 299)
  ) {
    throw new DomainError("Lần gửi thành công phải có HTTP status 2xx.");
  }

  if (input.status === "succeeded" && input.errorMessage) {
    throw new DomainError("Lần gửi thành công không được có thông điệp lỗi.");
  }

  if (input.status === "failed" && !input.errorMessage) {
    throw new DomainError("Lần gửi lỗi phải có thông điệp lỗi.");
  }

  if (input.status === "failed" && input.httpStatus !== undefined && input.httpStatus >= 200 && input.httpStatus <= 299) {
    throw new DomainError("Lần gửi lỗi không được có HTTP status 2xx.");
  }
}

export function validatePersistenceTimeline(input: {
  readonly queuedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): void {
  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật lần gửi không được trước thời điểm tạo lần gửi.");
  }

  if (input.updatedAt < input.queuedAt) {
    throw new DomainError("Thời điểm cập nhật lần gửi không được trước thời điểm xếp hàng.");
  }
}

export function assertCompletedAtIsNotBeforeQueuedAt(completedAt: Date, queuedAt: string | Date): void {
  const normalizedQueuedAt =
    queuedAt instanceof Date
      ? queuedAt
      : parseDate(queuedAt, "Thời điểm xếp hàng gửi hồ sơ không hợp lệ.");

  if (completedAt < normalizedQueuedAt) {
    throw new DomainError("Thời điểm hoàn tất gửi hồ sơ không được trước thời điểm xếp hàng.");
  }
}
