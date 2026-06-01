import { DomainError } from "../shared/domain-error.js";
import {
  conditionCategories,
  conditionClinicalStatuses,
  conditionSeverities,
  conditionVerificationStatuses
} from "./condition.types.js";
import type {
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionCode,
  ConditionSeverity,
  ConditionVerificationStatus
} from "./condition.types.js";

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

export function normalizeCode(value: ConditionCode): ConditionCode {
  return {
    system: normalizeRequired(value.system, "Hệ mã chẩn đoán không được để trống."),
    code: normalizeRequired(value.code, "Mã chẩn đoán không được để trống."),
    display: normalizeRequired(value.display, "Tên chẩn đoán không được để trống.")
  };
}

export function normalizeClinicalStatus(value: ConditionClinicalStatus): ConditionClinicalStatus {
  if (!conditionClinicalStatuses.has(value)) {
    throw new DomainError("Trạng thái lâm sàng của chẩn đoán không hợp lệ.");
  }

  return value;
}

export function normalizeVerificationStatus(
  value: ConditionVerificationStatus
): ConditionVerificationStatus {
  if (!conditionVerificationStatuses.has(value)) {
    throw new DomainError("Trạng thái xác minh của chẩn đoán không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: ConditionCategory): ConditionCategory {
  if (!conditionCategories.has(value)) {
    throw new DomainError("Nhóm chẩn đoán không hợp lệ.");
  }

  return value;
}

export function normalizeSeverity(value: ConditionSeverity): ConditionSeverity {
  if (!conditionSeverities.has(value)) {
    throw new DomainError("Mức độ nặng của chẩn đoán không hợp lệ.");
  }

  return value;
}

export function validateTimeline(input: {
  readonly onsetAt?: Date;
  readonly recordedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): void {
  if (input.onsetAt && input.onsetAt > input.recordedAt) {
    throw new DomainError("Thời điểm khởi phát chẩn đoán không được sau thời điểm ghi nhận.");
  }

  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật chẩn đoán không được trước thời điểm tạo chẩn đoán.");
  }
}

export function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
