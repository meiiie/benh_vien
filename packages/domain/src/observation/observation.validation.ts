import { DomainError } from "../shared/domain-error.js";
import { observationCategories, observationStatuses } from "./observation.types.js";
import type {
  ObservationCategory,
  ObservationQuantity,
  ObservationStatus
} from "./observation.types.js";

export function normalizeQuantity(value: ObservationQuantity): ObservationQuantity {
  if (!Number.isFinite(value.value)) {
    throw new DomainError("Giá trị định lượng của observation không hợp lệ.");
  }

  return {
    value: value.value,
    unit: normalizeRequired(value.unit, "Đơn vị observation không được để trống."),
    system: normalizeOptional(value.system),
    code: normalizeOptional(value.code)
  };
}

export function validateObservationValue(
  valueText: string | undefined,
  valueQuantity: ObservationQuantity | undefined
): void {
  if (!valueText && !valueQuantity) {
    throw new DomainError("Observation phải có giá trị định lượng hoặc giá trị văn bản.");
  }

  if (valueText && valueQuantity) {
    throw new DomainError("Observation chỉ được có một kiểu giá trị trong lát cắt hiện tại.");
  }
}

export function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt < createdAt) {
    throw new DomainError("Thời điểm cập nhật observation không được trước thời điểm tạo observation.");
  }
}

export function normalizeStatus(value: ObservationStatus): ObservationStatus {
  if (!observationStatuses.has(value)) {
    throw new DomainError("Trạng thái observation không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: ObservationCategory): ObservationCategory {
  if (!observationCategories.has(value)) {
    throw new DomainError("Nhóm observation không hợp lệ.");
  }

  return value;
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
