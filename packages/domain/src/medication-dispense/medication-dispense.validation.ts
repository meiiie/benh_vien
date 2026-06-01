import type {
  DosageInstruction,
  MedicationCode,
  MedicationQuantity
} from "../medication-request/medication-request.types.js";
import { medicationTimingUnits } from "../medication-request/medication-request.types.js";
import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText as normalizeOptional,
  normalizePositiveNumber,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";
import {
  medicationDispenseCategories,
  medicationDispenseStatuses
} from "./medication-dispense.types.js";
import type { MedicationDispenseCategory, MedicationDispenseStatus } from "./medication-dispense.types.js";

type MedicationDispenseLifecycleInput = {
  readonly status: MedicationDispenseStatus;
  readonly quantity?: MedicationQuantity;
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
};

export {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";

export function assertMedicationDispenseLifecycle(
  input: MedicationDispenseLifecycleInput
): void {
  if (
    input.whenPrepared &&
    input.whenHandedOver &&
    new Date(input.whenHandedOver).getTime() < new Date(input.whenPrepared).getTime()
  ) {
    throw new DomainError("Thời điểm bàn giao thuốc không được trước thời điểm chuẩn bị thuốc.");
  }

  if (input.status === "completed" && !input.whenHandedOver) {
    throw new DomainError("Cấp phát thuốc đã hoàn tất cần có thời điểm bàn giao thuốc.");
  }

  if (input.status === "completed" && !input.quantity) {
    throw new DomainError("Cấp phát thuốc đã hoàn tất cần có số lượng cấp phát.");
  }
}

export function normalizeRequiredCoding(code: MedicationCode): MedicationCode {
  return {
    system: normalizeRequired(code.system, "Hệ mã thuốc không được để trống."),
    code: normalizeRequired(code.code, "Mã thuốc không được để trống."),
    display: normalizeRequired(code.display, "Tên thuốc không được để trống.")
  };
}

export function normalizeCoding(code: MedicationCode | undefined): MedicationCode | undefined {
  return code ? normalizeRequiredCoding(code) : undefined;
}

export function normalizeQuantity(
  quantity: MedicationQuantity,
  label: string
): MedicationQuantity {
  if (!Number.isFinite(quantity.value) || quantity.value <= 0) {
    throw new DomainError(`${label} phải là số lớn hơn 0.`);
  }

  return {
    value: quantity.value,
    unit: normalizeRequired(quantity.unit, `${label} phải có đơn vị.`),
    system: normalizeOptional(quantity.system),
    code: normalizeOptional(quantity.code)
  };
}

export function normalizeDosageInstruction(
  dosageInstruction: DosageInstruction
): DosageInstruction {
  const frequency = normalizePositiveNumber(
    dosageInstruction.frequency,
    "Tần suất dùng thuốc phải lớn hơn 0."
  );
  const period = normalizePositiveNumber(
    dosageInstruction.period,
    "Chu kỳ dùng thuốc phải lớn hơn 0."
  );
  const periodUnit = dosageInstruction.periodUnit
    ? normalizeTimingUnit(dosageInstruction.periodUnit)
    : undefined;

  if ((frequency || period) && !(frequency && period && periodUnit)) {
    throw new DomainError("Thông tin nhịp dùng thuốc phải có đủ tần suất, chu kỳ và đơn vị chu kỳ.");
  }

  return {
    text: normalizeRequired(dosageInstruction.text, "Hướng dẫn dùng thuốc không được để trống."),
    route: normalizeOptional(dosageInstruction.route),
    doseQuantity: dosageInstruction.doseQuantity
      ? normalizeQuantity(dosageInstruction.doseQuantity, "Liều dùng")
      : undefined,
    frequency,
    period,
    periodUnit
  };
}

export function normalizeStatus(value: MedicationDispenseStatus): MedicationDispenseStatus {
  if (!medicationDispenseStatuses.has(value)) {
    throw new DomainError("Trạng thái cấp phát thuốc không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: MedicationDispenseCategory): MedicationDispenseCategory {
  if (!medicationDispenseCategories.has(value)) {
    throw new DomainError("Nhóm cấp phát thuốc không hợp lệ.");
  }

  return value;
}

export function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt.getTime() < createdAt.getTime()) {
    throw new DomainError("Thời điểm cập nhật cấp phát thuốc không được trước thời điểm tạo cấp phát.");
  }
}

function normalizeTimingUnit(
  value: NonNullable<DosageInstruction["periodUnit"]>
): NonNullable<DosageInstruction["periodUnit"]> {
  if (!medicationTimingUnits.has(value)) {
    throw new DomainError("Đơn vị chu kỳ dùng thuốc không hợp lệ.");
  }

  return value;
}
