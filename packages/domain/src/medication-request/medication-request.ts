import { DomainError } from "../shared/domain-error.js";
import {
  medicationRequestCategories,
  medicationRequestIntents,
  medicationRequestPriorities,
  medicationRequestStatuses,
  medicationTimingUnits
} from "./medication-request.types.js";
import type {
  CreateMedicationRequestInput,
  DosageInstruction,
  MedicationCode,
  MedicationQuantity,
  MedicationRequestCategory,
  MedicationRequestIntent,
  MedicationRequestPriority,
  MedicationRequestSnapshot,
  MedicationRequestStatus,
  MedicationTimingUnit
} from "./medication-request.types.js";

export type {
  CreateMedicationRequestInput,
  DosageInstruction,
  MedicationCode,
  MedicationQuantity,
  MedicationRequestCategory,
  MedicationRequestIntent,
  MedicationRequestPriority,
  MedicationRequestSnapshot,
  MedicationRequestStatus,
  MedicationTimingUnit
} from "./medication-request.types.js";

export class MedicationRequest {
  private constructor(private readonly props: MedicationRequestSnapshot) {}

  static prescribe(input: CreateMedicationRequestInput): MedicationRequest {
    const now = new Date();
    const authoredOn = input.authoredOn
      ? parseDate(input.authoredOn, "Thời điểm kê thuốc không hợp lệ.")
      : now;
    const id = normalizeRequired(input.id, "Mã chỉ định thuốc không được để trống.");

    return new MedicationRequest({
      id,
      patientId: normalizeRequired(input.patientId, "Chỉ định thuốc phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      status: normalizeStatus(input.status ?? "active"),
      intent: normalizeIntent(input.intent ?? "order"),
      category: normalizeCategory(input.category),
      priority: normalizePriority(input.priority ?? "routine"),
      medicationCode: normalizeMedicationCode(input.medicationCode),
      dosageInstruction: normalizeDosageInstruction(input.dosageInstruction),
      authoredOn: authoredOn.toISOString(),
      requesterPractitionerId: normalizeRequired(
        input.requesterPractitionerId,
        "Nhân sự kê thuốc không được để trống."
      ),
      expectedSupplyDurationDays: normalizePositiveNumber(
        input.expectedSupplyDurationDays,
        "Số ngày cấp thuốc phải lớn hơn 0."
      ),
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: MedicationRequestSnapshot): MedicationRequest {
    const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo chỉ định thuốc không hợp lệ.");
    const updatedAt = parseDate(snapshot.updatedAt, "Thời điểm cập nhật chỉ định thuốc không hợp lệ.");
    validatePersistenceTimeline(createdAt, updatedAt);

    return new MedicationRequest({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã chỉ định thuốc không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Chỉ định thuốc phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      status: normalizeStatus(snapshot.status),
      intent: normalizeIntent(snapshot.intent),
      category: normalizeCategory(snapshot.category),
      priority: normalizePriority(snapshot.priority),
      medicationCode: normalizeMedicationCode(snapshot.medicationCode),
      dosageInstruction: normalizeDosageInstruction(snapshot.dosageInstruction),
      authoredOn: parseDate(snapshot.authoredOn, "Thời điểm kê thuốc không hợp lệ.").toISOString(),
      requesterPractitionerId: normalizeRequired(
        snapshot.requesterPractitionerId,
        "Nhân sự kê thuốc không được để trống."
      ),
      expectedSupplyDurationDays: normalizePositiveNumber(
        snapshot.expectedSupplyDurationDays,
        "Số ngày cấp thuốc phải lớn hơn 0."
      ),
      note: normalizeOptional(snapshot.note),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): MedicationRequestSnapshot {
    return {
      ...this.props,
      medicationCode: { ...this.props.medicationCode },
      dosageInstruction: {
        ...this.props.dosageInstruction,
        doseQuantity: this.props.dosageInstruction.doseQuantity
          ? { ...this.props.dosageInstruction.doseQuantity }
          : undefined
      }
    };
  }
}

function normalizeDosageInstruction(value: DosageInstruction): DosageInstruction {
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

function normalizeQuantity(value: MedicationQuantity): MedicationQuantity {
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

function normalizeMedicationCode(value: MedicationCode): MedicationCode {
  return {
    system: normalizeRequired(value.system, "Hệ mã thuốc không được để trống."),
    code: normalizeRequired(value.code, "Mã thuốc không được để trống."),
    display: normalizeRequired(value.display, "Tên thuốc không được để trống.")
  };
}

function normalizeStatus(value: MedicationRequestStatus): MedicationRequestStatus {
  if (!medicationRequestStatuses.has(value)) {
    throw new DomainError("Trạng thái chỉ định thuốc không hợp lệ.");
  }

  return value;
}

function normalizeIntent(value: MedicationRequestIntent): MedicationRequestIntent {
  if (!medicationRequestIntents.has(value)) {
    throw new DomainError("Mục đích chỉ định thuốc không hợp lệ.");
  }

  return value;
}

function normalizeCategory(value: MedicationRequestCategory): MedicationRequestCategory {
  if (!medicationRequestCategories.has(value)) {
    throw new DomainError("Nhóm chỉ định thuốc không hợp lệ.");
  }

  return value;
}

function normalizePriority(value: MedicationRequestPriority): MedicationRequestPriority {
  if (!medicationRequestPriorities.has(value)) {
    throw new DomainError("Mức ưu tiên chỉ định thuốc không hợp lệ.");
  }

  return value;
}

function normalizeTimingUnit(value: MedicationTimingUnit): MedicationTimingUnit {
  if (!medicationTimingUnits.has(value)) {
    throw new DomainError("Đơn vị chu kỳ dùng thuốc không hợp lệ.");
  }

  return value;
}

function normalizePositiveNumber(value: number | undefined, message: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainError(message);
  }

  return value;
}

function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt.getTime() < createdAt.getTime()) {
    throw new DomainError("Thời điểm cập nhật chỉ định thuốc không được trước thời điểm tạo chỉ định.");
  }
}

function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
