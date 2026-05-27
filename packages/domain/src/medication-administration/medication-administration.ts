import type { MedicationCode, MedicationQuantity } from "../medication-request/medication-request.js";
import { DomainError } from "../shared/domain-error.js";

export type MedicationAdministrationStatus =
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "unknown";

export type MedicationAdministrationCategory =
  | "inpatient"
  | "outpatient"
  | "community"
  | "patient-specified";

export type MedicationAdministrationPerformerActorType =
  | "Practitioner"
  | "PractitionerRole"
  | "Patient"
  | "RelatedPerson"
  | "Device";

export type MedicationAdministrationPerformer = {
  readonly actorType: MedicationAdministrationPerformerActorType;
  readonly actorId: string;
  readonly function?: MedicationCode;
};

export type MedicationAdministrationEffectivePeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type MedicationAdministrationDosage = {
  readonly text?: string;
  readonly route?: MedicationCode;
  readonly doseQuantity?: MedicationQuantity;
};

export type MedicationAdministrationSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly medicationRequestId?: string;
  readonly reasonConditionId?: string;
  readonly status: MedicationAdministrationStatus;
  readonly statusReason?: MedicationCode;
  readonly category: MedicationAdministrationCategory;
  readonly medicationCode: MedicationCode;
  readonly effectivePeriod: MedicationAdministrationEffectivePeriod;
  readonly performers: readonly MedicationAdministrationPerformer[];
  readonly dosage?: MedicationAdministrationDosage;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RecordMedicationAdministrationInput = Omit<
  MedicationAdministrationSnapshot,
  "createdAt" | "updatedAt"
>;

export class MedicationAdministration {
  private constructor(private readonly props: MedicationAdministrationSnapshot) {}

  static record(input: RecordMedicationAdministrationInput): MedicationAdministration {
    const now = new Date();
    const effectivePeriod = normalizeEffectivePeriod(input.effectivePeriod);
    const performers = normalizePerformers(input.performers);

    if (input.status === "completed" && !effectivePeriod.start && !effectivePeriod.end) {
      throw new DomainError("Lần dùng thuốc đã hoàn tất cần có thời điểm dùng thuốc để truy vết.");
    }

    if (input.status === "completed" && performers.length === 0) {
      throw new DomainError("Lần dùng thuốc đã hoàn tất cần có tối thiểu một người hoặc thiết bị thực hiện.");
    }

    return new MedicationAdministration({
      id: normalizeRequired(input.id, "Mã lần dùng thuốc không được để trống."),
      patientId: normalizeRequired(input.patientId, "Lần dùng thuốc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      medicationRequestId: normalizeOptional(input.medicationRequestId),
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      status: input.status,
      statusReason: normalizeCoding(input.statusReason),
      category: input.category,
      medicationCode: normalizeRequiredCoding(input.medicationCode),
      effectivePeriod,
      performers,
      dosage: input.dosage ? normalizeDosage(input.dosage) : undefined,
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: MedicationAdministrationSnapshot): MedicationAdministration {
    return new MedicationAdministration({
      ...snapshot,
      encounterId: normalizeOptional(snapshot.encounterId),
      medicationRequestId: normalizeOptional(snapshot.medicationRequestId),
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      statusReason: normalizeCoding(snapshot.statusReason),
      medicationCode: normalizeRequiredCoding(snapshot.medicationCode),
      effectivePeriod: normalizeEffectivePeriod(snapshot.effectivePeriod),
      performers: normalizePerformers(snapshot.performers),
      dosage: snapshot.dosage ? normalizeDosage(snapshot.dosage) : undefined,
      note: normalizeOptional(snapshot.note)
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): MedicationAdministrationSnapshot {
    return {
      ...this.props,
      statusReason: this.props.statusReason ? { ...this.props.statusReason } : undefined,
      medicationCode: { ...this.props.medicationCode },
      effectivePeriod: { ...this.props.effectivePeriod },
      performers: this.props.performers.map((performer) => ({
        ...performer,
        function: performer.function ? { ...performer.function } : undefined
      })),
      dosage: this.props.dosage
        ? {
            ...this.props.dosage,
            route: this.props.dosage.route ? { ...this.props.dosage.route } : undefined,
            doseQuantity: this.props.dosage.doseQuantity
              ? { ...this.props.dosage.doseQuantity }
              : undefined
          }
        : undefined
    };
  }
}

function normalizeEffectivePeriod(
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

  return { start, end };
}

function normalizePerformers(
  performers: readonly MedicationAdministrationPerformer[]
): readonly MedicationAdministrationPerformer[] {
  const normalized = new Map<string, MedicationAdministrationPerformer>();

  for (const performer of performers) {
    const actorId = normalizeRequired(
      performer.actorId,
      "Người hoặc thiết bị thực hiện dùng thuốc không được để trống."
    );
    normalized.set(`${performer.actorType}/${actorId}`, {
      actorType: performer.actorType,
      actorId,
      function: normalizeCoding(performer.function)
    });
  }

  return [...normalized.values()];
}

function normalizeDosage(dosage: MedicationAdministrationDosage): MedicationAdministrationDosage {
  return {
    text: normalizeOptional(dosage.text),
    route: normalizeCoding(dosage.route),
    doseQuantity: dosage.doseQuantity ? normalizeQuantity(dosage.doseQuantity) : undefined
  };
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
