import { DomainError } from "../shared/domain-error.js";

export type ConditionClinicalStatus =
  | "active"
  | "recurrence"
  | "relapse"
  | "inactive"
  | "remission"
  | "resolved";

export type ConditionVerificationStatus =
  | "unconfirmed"
  | "provisional"
  | "differential"
  | "confirmed"
  | "refuted"
  | "entered-in-error";

export type ConditionCategory = "problem-list-item" | "encounter-diagnosis";
export type ConditionSeverity = "mild" | "moderate" | "severe";

const conditionClinicalStatuses = new Set<ConditionClinicalStatus>([
  "active",
  "recurrence",
  "relapse",
  "inactive",
  "remission",
  "resolved"
]);
const conditionVerificationStatuses = new Set<ConditionVerificationStatus>([
  "unconfirmed",
  "provisional",
  "differential",
  "confirmed",
  "refuted",
  "entered-in-error"
]);
const conditionCategories = new Set<ConditionCategory>([
  "problem-list-item",
  "encounter-diagnosis"
]);
const conditionSeverities = new Set<ConditionSeverity>([
  "mild",
  "moderate",
  "severe"
]);

export type ConditionCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ConditionSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly clinicalStatus: ConditionClinicalStatus;
  readonly verificationStatus: ConditionVerificationStatus;
  readonly category: ConditionCategory;
  readonly code: ConditionCode;
  readonly severity?: ConditionSeverity;
  readonly onsetAt?: string;
  readonly recordedAt: string;
  readonly recorderPractitionerId: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateConditionInput = Omit<
  ConditionSnapshot,
  "clinicalStatus" | "verificationStatus" | "recordedAt" | "createdAt" | "updatedAt"
> & {
  readonly clinicalStatus?: ConditionClinicalStatus;
  readonly verificationStatus?: ConditionVerificationStatus;
  readonly recordedAt?: string;
};

export class Condition {
  private constructor(private readonly props: ConditionSnapshot) {}

  static record(input: CreateConditionInput): Condition {
    const now = new Date();
    const onsetAt = input.onsetAt
      ? parseDate(input.onsetAt, "Thời điểm khởi phát chẩn đoán không hợp lệ.")
      : undefined;
    const recordedAt = input.recordedAt
      ? parseDate(input.recordedAt, "Thời điểm ghi nhận chẩn đoán không hợp lệ.")
      : now;

    return new Condition({
      id: normalizeRequired(input.id, "Mã chẩn đoán không được để trống."),
      patientId: normalizeRequired(input.patientId, "Chẩn đoán phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      clinicalStatus: normalizeClinicalStatus(input.clinicalStatus ?? "active"),
      verificationStatus: normalizeVerificationStatus(input.verificationStatus ?? "confirmed"),
      category: normalizeCategory(input.category),
      code: normalizeCode(input.code),
      severity: input.severity ? normalizeSeverity(input.severity) : undefined,
      onsetAt: onsetAt?.toISOString(),
      recordedAt: recordedAt.toISOString(),
      recorderPractitionerId: normalizeRequired(
        input.recorderPractitionerId,
        "Nhân sự ghi nhận chẩn đoán không được để trống."
      ),
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ConditionSnapshot): Condition {
    return new Condition({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã chẩn đoán không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Chẩn đoán phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      clinicalStatus: normalizeClinicalStatus(snapshot.clinicalStatus),
      verificationStatus: normalizeVerificationStatus(snapshot.verificationStatus),
      category: normalizeCategory(snapshot.category),
      code: normalizeCode(snapshot.code),
      severity: snapshot.severity ? normalizeSeverity(snapshot.severity) : undefined,
      onsetAt: snapshot.onsetAt
        ? parseDate(snapshot.onsetAt, "Thời điểm khởi phát chẩn đoán không hợp lệ.").toISOString()
        : undefined,
      recordedAt: parseDate(
        snapshot.recordedAt,
        "Thời điểm ghi nhận chẩn đoán không hợp lệ."
      ).toISOString(),
      recorderPractitionerId: normalizeRequired(
        snapshot.recorderPractitionerId,
        "Nhân sự ghi nhận chẩn đoán không được để trống."
      ),
      note: normalizeOptional(snapshot.note),
      createdAt: parseDate(snapshot.createdAt, "Thời điểm tạo chẩn đoán không hợp lệ.").toISOString(),
      updatedAt: parseDate(snapshot.updatedAt, "Thời điểm cập nhật chẩn đoán không hợp lệ.").toISOString()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): ConditionSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code }
    };
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

function normalizeCode(value: ConditionCode): ConditionCode {
  return {
    system: normalizeRequired(value.system, "Hệ mã chẩn đoán không được để trống."),
    code: normalizeRequired(value.code, "Mã chẩn đoán không được để trống."),
    display: normalizeRequired(value.display, "Tên chẩn đoán không được để trống.")
  };
}

function normalizeClinicalStatus(value: ConditionClinicalStatus): ConditionClinicalStatus {
  if (!conditionClinicalStatuses.has(value)) {
    throw new DomainError("Trạng thái lâm sàng của chẩn đoán không hợp lệ.");
  }

  return value;
}

function normalizeVerificationStatus(
  value: ConditionVerificationStatus
): ConditionVerificationStatus {
  if (!conditionVerificationStatuses.has(value)) {
    throw new DomainError("Trạng thái xác minh của chẩn đoán không hợp lệ.");
  }

  return value;
}

function normalizeCategory(value: ConditionCategory): ConditionCategory {
  if (!conditionCategories.has(value)) {
    throw new DomainError("Nhóm chẩn đoán không hợp lệ.");
  }

  return value;
}

function normalizeSeverity(value: ConditionSeverity): ConditionSeverity {
  if (!conditionSeverities.has(value)) {
    throw new DomainError("Mức độ nặng của chẩn đoán không hợp lệ.");
  }

  return value;
}

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
