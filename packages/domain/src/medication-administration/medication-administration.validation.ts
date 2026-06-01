import type {
  MedicationCode,
  MedicationQuantity
} from "../medication-request/medication-request.types.js";
import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";
import {
  medicationAdministrationCategories,
  medicationAdministrationPerformerActorTypes,
  medicationAdministrationStatuses
} from "./medication-administration.types.js";
import type {
  MedicationAdministrationCategory,
  MedicationAdministrationDosage,
  MedicationAdministrationEffectivePeriod,
  MedicationAdministrationPerformer,
  MedicationAdministrationPerformerActorType,
  MedicationAdministrationStatus
} from "./medication-administration.types.js";

export {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";

export function normalizeEffectivePeriod(
  period: MedicationAdministrationEffectivePeriod
): MedicationAdministrationEffectivePeriod {
  const start = period.start
    ? parseDate(period.start, "Thời điểm bắt đầu dùng thuốc không hợp lệ.").toISOString()
    : undefined;
  const end = period.end
    ? parseDate(period.end, "Thời điểm kết thúc dùng thuốc không hợp lệ.").toISOString()
    : undefined;

  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    throw new DomainError("Thời điểm kết thúc dùng thuốc không được trước thời điểm bắt đầu.");
  }

  if (!start && !end) {
    throw new DomainError("Lần dùng thuốc cần có thời điểm hiệu lực để truy vết.");
  }

  return { start, end };
}

export function normalizePerformers(
  performers: readonly MedicationAdministrationPerformer[]
): readonly MedicationAdministrationPerformer[] {
  const normalized = new Map<string, MedicationAdministrationPerformer>();

  for (const performer of performers) {
    const actorType = normalizePerformerActorType(performer.actorType);
    const actorId = normalizeRequired(
      performer.actorId,
      "Người hoặc thiết bị thực hiện dùng thuốc không được để trống."
    );
    normalized.set(`${actorType}/${actorId}`, {
      actorType,
      actorId,
      function: normalizeCoding(performer.function)
    });
  }

  return [...normalized.values()];
}

export function normalizeDosage(
  dosage: MedicationAdministrationDosage
): MedicationAdministrationDosage {
  const doseQuantity = dosage.doseQuantity ? normalizeQuantity(dosage.doseQuantity) : undefined;

  if (!doseQuantity) {
    throw new DomainError("Chi tiết dùng thuốc cần có liều dùng định lượng.");
  }

  return {
    text: normalizeOptional(dosage.text),
    route: normalizeCoding(dosage.route),
    doseQuantity
  };
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

export function assertMedicationAdministrationLifecycle(
  status: MedicationAdministrationStatus,
  effectivePeriod: MedicationAdministrationEffectivePeriod,
  performers: readonly MedicationAdministrationPerformer[]
): void {
  if (status === "completed" && !effectivePeriod.start && !effectivePeriod.end) {
    throw new DomainError("Lần dùng thuốc đã hoàn tất cần có thời điểm dùng thuốc để truy vết.");
  }

  if (status === "completed" && performers.length === 0) {
    throw new DomainError("Lần dùng thuốc đã hoàn tất cần có tối thiểu một người hoặc thiết bị thực hiện.");
  }
}

export function normalizeStatus(
  value: MedicationAdministrationStatus
): MedicationAdministrationStatus {
  if (!medicationAdministrationStatuses.has(value)) {
    throw new DomainError("Trạng thái dùng thuốc không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(
  value: MedicationAdministrationCategory
): MedicationAdministrationCategory {
  if (!medicationAdministrationCategories.has(value)) {
    throw new DomainError("Nhóm dùng thuốc không hợp lệ.");
  }

  return value;
}

export function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt.getTime() < createdAt.getTime()) {
    throw new DomainError("Thời điểm cập nhật lần dùng thuốc không được trước thời điểm tạo lần dùng.");
  }
}

function normalizeQuantity(quantity: MedicationQuantity): MedicationQuantity {
  if (!Number.isFinite(quantity.value) || quantity.value <= 0) {
    throw new DomainError("Liều dùng thuốc phải là số lớn hơn 0.");
  }

  return {
    value: quantity.value,
    unit: normalizeRequired(quantity.unit, "Đơn vị liều dùng không được để trống."),
    system: normalizeOptional(quantity.system),
    code: normalizeOptional(quantity.code)
  };
}

function normalizePerformerActorType(
  value: MedicationAdministrationPerformerActorType
): MedicationAdministrationPerformerActorType {
  if (!medicationAdministrationPerformerActorTypes.has(value)) {
    throw new DomainError("Loại chủ thể thực hiện dùng thuốc không hợp lệ.");
  }

  return value;
}
