import { DomainError } from "../shared/domain-error.js";
import {
  medicationRequestCategories,
  medicationRequestIntents,
  medicationRequestPriorities,
  medicationRequestStatuses,
  medicationTimingUnits
} from "./medication-request.types.js";
import type {
  DosageInstruction,
  MedicationCode,
  MedicationQuantity,
  MedicationRequestCategory,
  MedicationRequestIntent,
  MedicationRequestPriority,
  MedicationRequestStatus,
  MedicationTimingUnit
} from "./medication-request.types.js";

export function normalizeDosageInstruction(value: DosageInstruction): DosageInstruction {
  const frequency = normalizePositiveNumber(
    value.frequency,
    "Tần suất dùng thuốc phải lớn hơn 0."
  );
  const period = normalizePositiveNumber(value.period, "Chu kỳ dùng thuốc phải lớn hơn 0.");
  const periodUnit = value.periodUnit ? normalizeTimingUnit(value.periodUnit) : undefined;

  if ((frequency || period) && !(frequency && period && periodUnit)) {
    throw new DomainError("Thông tin nhịp dùng thuốc phải có đủ tần suất, chu kỳ và đơn vị chu kỳ.");
  }

  return {
    text: normalizeRequired(value.text, "Hướng dẫn dùng thuốc không được để trống."),
    route: normalizeOptional(value.route),
    doseQuantity: value.doseQuantity ? normalizeQuantity(value.doseQuantity) : undefined,
    frequency,
    period,
    periodUnit
  };
}

export function normalizeQuantity(value: MedicationQuantity): MedicationQuantity {
  if (!Number.isFinite(value.value) || value.value <= 0) {
    throw new DomainError("Liều lượng thuốc phải là số lớn hơn 0.");
  }

  return {
    value: value.value,
    unit: normalizeRequired(value.unit, "Đơn vị liều thuốc không được để trống."),
    system: normalizeOptional(value.system),
    code: normalizeOptional(value.code)
  };
}

export function normalizeMedicationCode(value: MedicationCode): MedicationCode {
  return {
    system: normalizeRequired(value.system, "Hệ mã thuốc không được để trống."),
    code: normalizeRequired(value.code, "Mã thuốc không được để trống."),
    display: normalizeRequired(value.display, "Tên thuốc không được để trống.")
  };
}

export function normalizeStatus(value: MedicationRequestStatus): MedicationRequestStatus {
  if (!medicationRequestStatuses.has(value)) {
    throw new DomainError("Trạng thái chỉ định thuốc không hợp lệ.");
  }

  return value;
}

export function normalizeIntent(value: MedicationRequestIntent): MedicationRequestIntent {
  if (!medicationRequestIntents.has(value)) {
    throw new DomainError("Mục đích chỉ định thuốc không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: MedicationRequestCategory): MedicationRequestCategory {
  if (!medicationRequestCategories.has(value)) {
    throw new DomainError("Nhóm chỉ định thuốc không hợp lệ.");
  }

  return value;
}

export function normalizePriority(value: MedicationRequestPriority): MedicationRequestPriority {
  if (!medicationRequestPriorities.has(value)) {
    throw new DomainError("Mức ưu tiên chỉ định thuốc không hợp lệ.");
  }

  return value;
}

export function normalizePositiveNumber(
  value: number | undefined,
  message: string
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainError(message);
  }

  return value;
}

export function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt.getTime() < createdAt.getTime()) {
    throw new DomainError("Thời điểm cập nhật chỉ định thuốc không được trước thời điểm tạo chỉ định.");
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

function normalizeTimingUnit(value: MedicationTimingUnit): MedicationTimingUnit {
  if (!medicationTimingUnits.has(value)) {
    throw new DomainError("Đơn vị chu kỳ dùng thuốc không hợp lệ.");
  }

  return value;
}
