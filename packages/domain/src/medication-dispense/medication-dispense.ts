import type {
  DosageInstruction,
  MedicationCode,
  MedicationQuantity
} from "../medication-request/medication-request.js";
import { DomainError } from "../shared/domain-error.js";

export type MedicationDispenseStatus =
  | "preparation"
  | "in-progress"
  | "cancelled"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "declined"
  | "unknown";

export type MedicationDispenseCategory =
  | "inpatient"
  | "outpatient"
  | "community"
  | "discharge";

export type MedicationDispenseSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly medicationRequestId?: string;
  readonly status: MedicationDispenseStatus;
  readonly statusReason?: MedicationCode;
  readonly category: MedicationDispenseCategory;
  readonly medicationCode: MedicationCode;
  readonly quantity?: MedicationQuantity;
  readonly daysSupply?: MedicationQuantity;
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
  readonly dispenserPractitionerId?: string;
  readonly destinationLocationId?: string;
  readonly receiverPractitionerId?: string;
  readonly dosageInstruction?: DosageInstruction;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RecordMedicationDispenseInput = Omit<
  MedicationDispenseSnapshot,
  "createdAt" | "updatedAt"
>;

export class MedicationDispense {
  private constructor(private readonly props: MedicationDispenseSnapshot) {}

  static record(input: RecordMedicationDispenseInput): MedicationDispense {
    const now = new Date();
    const whenPrepared = input.whenPrepared
      ? parseDate(input.whenPrepared, "Thời điểm chuẩn bị thuốc không hợp lệ.").toISOString()
      : undefined;
    const whenHandedOver = input.whenHandedOver
      ? parseDate(input.whenHandedOver, "Thời điểm bàn giao thuốc không hợp lệ.").toISOString()
      : undefined;

    if (whenPrepared && whenHandedOver && new Date(whenHandedOver).getTime() < new Date(whenPrepared).getTime()) {
      throw new DomainError("Thời điểm bàn giao thuốc không được trước thời điểm chuẩn bị thuốc.");
    }

    if (input.status === "completed" && !whenHandedOver) {
      throw new DomainError("Cấp phát thuốc đã hoàn tất cần có thời điểm bàn giao thuốc.");
    }

    if (input.status === "completed" && !input.quantity) {
      throw new DomainError("Cấp phát thuốc đã hoàn tất cần có số lượng cấp phát.");
    }

    return new MedicationDispense({
      id: normalizeRequired(input.id, "Mã cấp phát thuốc không được để trống."),
      patientId: normalizeRequired(input.patientId, "Cấp phát thuốc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      medicationRequestId: normalizeOptional(input.medicationRequestId),
      status: input.status,
      statusReason: normalizeCoding(input.statusReason),
      category: input.category,
      medicationCode: normalizeRequiredCoding(input.medicationCode),
      quantity: input.quantity ? normalizeQuantity(input.quantity, "Số lượng cấp phát") : undefined,
      daysSupply: input.daysSupply ? normalizeQuantity(input.daysSupply, "Số ngày cấp thuốc") : undefined,
      whenPrepared,
      whenHandedOver,
      dispenserPractitionerId: normalizeOptional(input.dispenserPractitionerId),
      destinationLocationId: normalizeOptional(input.destinationLocationId),
      receiverPractitionerId: normalizeOptional(input.receiverPractitionerId),
      dosageInstruction: input.dosageInstruction
        ? normalizeDosageInstruction(input.dosageInstruction)
        : undefined,
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: MedicationDispenseSnapshot): MedicationDispense {
    return new MedicationDispense({
      ...snapshot,
      encounterId: normalizeOptional(snapshot.encounterId),
      medicationRequestId: normalizeOptional(snapshot.medicationRequestId),
      statusReason: normalizeCoding(snapshot.statusReason),
      medicationCode: normalizeRequiredCoding(snapshot.medicationCode),
      quantity: snapshot.quantity
        ? normalizeQuantity(snapshot.quantity, "Số lượng cấp phát")
        : undefined,
      daysSupply: snapshot.daysSupply
        ? normalizeQuantity(snapshot.daysSupply, "Số ngày cấp thuốc")
        : undefined,
      whenPrepared: snapshot.whenPrepared
        ? parseDate(snapshot.whenPrepared, "Thời điểm chuẩn bị thuốc không hợp lệ.").toISOString()
        : undefined,
      whenHandedOver: snapshot.whenHandedOver
        ? parseDate(snapshot.whenHandedOver, "Thời điểm bàn giao thuốc không hợp lệ.").toISOString()
        : undefined,
      dispenserPractitionerId: normalizeOptional(snapshot.dispenserPractitionerId),
      destinationLocationId: normalizeOptional(snapshot.destinationLocationId),
      receiverPractitionerId: normalizeOptional(snapshot.receiverPractitionerId),
      dosageInstruction: snapshot.dosageInstruction
        ? normalizeDosageInstruction(snapshot.dosageInstruction)
        : undefined,
      note: normalizeOptional(snapshot.note)
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): MedicationDispenseSnapshot {
    return {
      ...this.props,
      statusReason: this.props.statusReason ? { ...this.props.statusReason } : undefined,
      medicationCode: { ...this.props.medicationCode },
      quantity: this.props.quantity ? { ...this.props.quantity } : undefined,
      daysSupply: this.props.daysSupply ? { ...this.props.daysSupply } : undefined,
      dosageInstruction: this.props.dosageInstruction
        ? {
            ...this.props.dosageInstruction,
            doseQuantity: this.props.dosageInstruction.doseQuantity
              ? { ...this.props.dosageInstruction.doseQuantity }
              : undefined
          }
        : undefined
    };
  }
}

function normalizeRequiredCoding(code: MedicationCode): MedicationCode {
  return {
    system: normalizeRequired(code.system, "Hệ mã thuốc không được để trống."),
    code: normalizeRequired(code.code, "Mã thuốc không được để trống."),
    display: normalizeRequired(code.display, "Tên thuốc không được để trống.")
  };
}

function normalizeCoding(code: MedicationCode | undefined): MedicationCode | undefined {
  return code ? normalizeRequiredCoding(code) : undefined;
}

function normalizeQuantity(quantity: MedicationQuantity, label: string): MedicationQuantity {
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

function normalizeDosageInstruction(
  dosageInstruction: DosageInstruction
): DosageInstruction {
  return {
    text: normalizeRequired(dosageInstruction.text, "Hướng dẫn dùng thuốc không được để trống."),
    route: normalizeOptional(dosageInstruction.route),
    doseQuantity: dosageInstruction.doseQuantity
      ? normalizeQuantity(dosageInstruction.doseQuantity, "Liều dùng")
      : undefined,
    frequency: dosageInstruction.frequency,
    period: dosageInstruction.period,
    periodUnit: dosageInstruction.periodUnit
  };
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
