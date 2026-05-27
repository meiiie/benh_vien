import { DomainError } from "../shared/domain-error.js";

export type MedicationRequestStatus =
  | "active"
  | "on-hold"
  | "cancelled"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "draft"
  | "unknown";

export type MedicationRequestIntent =
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";

export type MedicationRequestCategory = "inpatient" | "outpatient" | "community" | "discharge";
export type MedicationRequestPriority = "routine" | "urgent" | "asap" | "stat";
export type MedicationTimingUnit = "h" | "d" | "wk";

export type MedicationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type MedicationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

export type DosageInstruction = {
  readonly text: string;
  readonly route?: string;
  readonly doseQuantity?: MedicationQuantity;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: MedicationTimingUnit;
};

export type MedicationRequestSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
  readonly status: MedicationRequestStatus;
  readonly intent: MedicationRequestIntent;
  readonly category: MedicationRequestCategory;
  readonly priority: MedicationRequestPriority;
  readonly medicationCode: MedicationCode;
  readonly dosageInstruction: DosageInstruction;
  readonly authoredOn: string;
  readonly requesterPractitionerId: string;
  readonly expectedSupplyDurationDays?: number;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateMedicationRequestInput = Omit<
  MedicationRequestSnapshot,
  "status" | "intent" | "priority" | "authoredOn" | "createdAt" | "updatedAt"
> & {
  readonly status?: MedicationRequestStatus;
  readonly intent?: MedicationRequestIntent;
  readonly priority?: MedicationRequestPriority;
  readonly authoredOn?: string;
};

export class MedicationRequest {
  private constructor(private readonly props: MedicationRequestSnapshot) {}

  static prescribe(input: CreateMedicationRequestInput): MedicationRequest {
    const now = new Date();
    const authoredOn = input.authoredOn
      ? parseDate(input.authoredOn, "Thời điểm kê thuốc không hợp lệ.")
      : now;

    return new MedicationRequest({
      id: normalizeRequired(input.id, "Mã chỉ định thuốc không được để trống."),
      patientId: normalizeRequired(input.patientId, "Chỉ định thuốc phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      status: input.status ?? "active",
      intent: input.intent ?? "order",
      category: input.category,
      priority: input.priority ?? "routine",
      medicationCode: {
        system: normalizeRequired(input.medicationCode.system, "Hệ mã thuốc không được để trống."),
        code: normalizeRequired(input.medicationCode.code, "Mã thuốc không được để trống."),
        display: normalizeRequired(input.medicationCode.display, "Tên thuốc không được để trống.")
      },
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
    return new MedicationRequest({
      ...snapshot,
      encounterId: normalizeOptional(snapshot.encounterId),
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      dosageInstruction: normalizeDosageInstruction(snapshot.dosageInstruction),
      authoredOn: parseDate(snapshot.authoredOn, "Thời điểm kê thuốc không hợp lệ.").toISOString(),
      expectedSupplyDurationDays: normalizePositiveNumber(
        snapshot.expectedSupplyDurationDays,
        "Số ngày cấp thuốc phải lớn hơn 0."
      ),
      note: normalizeOptional(snapshot.note)
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

  if ((frequency || period) && !(frequency && period && value.periodUnit)) {
    throw new DomainError("Thông tin nhịp dùng thuốc phải có đủ tần suất, chu kỳ và đơn vị chu kỳ.");
  }

  return {
    text: normalizeRequired(value.text, "Hướng dẫn dùng thuốc không được để trống."),
    route: normalizeOptional(value.route),
    doseQuantity: value.doseQuantity ? normalizeQuantity(value.doseQuantity) : undefined,
    frequency,
    period,
    periodUnit: value.periodUnit
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

function normalizePositiveNumber(value: number | undefined, message: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainError(message);
  }

  return value;
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
