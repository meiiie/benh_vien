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
      clinicalStatus: input.clinicalStatus ?? "active",
      verificationStatus: input.verificationStatus ?? "confirmed",
      category: input.category,
      code: {
        system: normalizeRequired(input.code.system, "Hệ mã chẩn đoán không được để trống."),
        code: normalizeRequired(input.code.code, "Mã chẩn đoán không được để trống."),
        display: normalizeRequired(input.code.display, "Tên chẩn đoán không được để trống.")
      },
      severity: input.severity,
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
      encounterId: normalizeOptional(snapshot.encounterId),
      onsetAt: snapshot.onsetAt ? parseDate(snapshot.onsetAt, "Thời điểm khởi phát chẩn đoán không hợp lệ.").toISOString() : undefined,
      note: normalizeOptional(snapshot.note)
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

function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}
