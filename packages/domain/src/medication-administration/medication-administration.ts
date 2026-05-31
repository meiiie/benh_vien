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

const medicationAdministrationStatuses = new Set<MedicationAdministrationStatus>([
  "in-progress",
  "not-done",
  "on-hold",
  "completed",
  "entered-in-error",
  "stopped",
  "unknown"
]);
const medicationAdministrationCategories =
  new Set<MedicationAdministrationCategory>([
    "inpatient",
    "outpatient",
    "community",
    "patient-specified"
  ]);
const medicationAdministrationPerformerActorTypes =
  new Set<MedicationAdministrationPerformerActorType>([
    "Practitioner",
    "PractitionerRole",
    "Patient",
    "RelatedPerson",
    "Device"
  ]);

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
    const status = normalizeStatus(input.status);
    const effectivePeriod = normalizeEffectivePeriod(input.effectivePeriod);
    const performers = normalizePerformers(input.performers);
    assertMedicationAdministrationLifecycle(status, effectivePeriod, performers);

    return new MedicationAdministration({
      id: normalizeRequired(input.id, "Mã lần dùng thuốc không được để trống."),
      patientId: normalizeRequired(input.patientId, "Lần dùng thuốc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      medicationRequestId: normalizeOptional(input.medicationRequestId),
      reasonConditionId: normalizeOptional(input.reasonConditionId),
      status,
      statusReason: normalizeCoding(input.statusReason),
      category: normalizeCategory(input.category),
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
    const status = normalizeStatus(snapshot.status);
    const effectivePeriod = normalizeEffectivePeriod(snapshot.effectivePeriod);
    const performers = normalizePerformers(snapshot.performers);
    assertMedicationAdministrationLifecycle(status, effectivePeriod, performers);

    return new MedicationAdministration({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã lần dùng thuốc không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Lần dùng thuốc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      medicationRequestId: normalizeOptional(snapshot.medicationRequestId),
      reasonConditionId: normalizeOptional(snapshot.reasonConditionId),
      status,
      statusReason: normalizeCoding(snapshot.statusReason),
      category: normalizeCategory(snapshot.category),
      medicationCode: normalizeRequiredCoding(snapshot.medicationCode),
      effectivePeriod,
      performers,
      dosage: snapshot.dosage ? normalizeDosage(snapshot.dosage) : undefined,
      note: normalizeOptional(snapshot.note),
      createdAt: parseDate(snapshot.createdAt, "Thời điểm tạo lần dùng thuốc không hợp lệ.").toISOString(),
      updatedAt: parseDate(snapshot.updatedAt, "Thời điểm cập nhật lần dùng thuốc không hợp lệ.").toISOString()
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

  if (!start && !end) {
    throw new DomainError("Lần dùng thuốc cần có thời điểm hiệu lực để truy vết.");
  }

  return { start, end };
}

function normalizePerformers(
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

function normalizeDosage(dosage: MedicationAdministrationDosage): MedicationAdministrationDosage {
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

function assertMedicationAdministrationLifecycle(
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

function normalizeStatus(
  value: MedicationAdministrationStatus
): MedicationAdministrationStatus {
  if (!medicationAdministrationStatuses.has(value)) {
    throw new DomainError("Trạng thái dùng thuốc không hợp lệ.");
  }

  return value;
}

function normalizeCategory(
  value: MedicationAdministrationCategory
): MedicationAdministrationCategory {
  if (!medicationAdministrationCategories.has(value)) {
    throw new DomainError("Nhóm dùng thuốc không hợp lệ.");
  }

  return value;
}

function normalizePerformerActorType(
  value: MedicationAdministrationPerformerActorType
): MedicationAdministrationPerformerActorType {
  if (!medicationAdministrationPerformerActorTypes.has(value)) {
    throw new DomainError("Loại chủ thể thực hiện dùng thuốc không hợp lệ.");
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
