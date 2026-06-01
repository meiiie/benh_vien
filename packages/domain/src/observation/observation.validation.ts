import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";
import { observationCategories, observationStatuses } from "./observation.types.js";
import type {
  ObservationCategory,
  ObservationQuantity,
  ObservationStatus
} from "./observation.types.js";

export {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";

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
