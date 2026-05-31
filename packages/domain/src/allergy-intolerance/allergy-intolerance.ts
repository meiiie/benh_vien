import { DomainError } from "../shared/domain-error.js";

export type AllergyClinicalStatus = "active" | "inactive" | "resolved";
export type AllergyVerificationStatus =
  | "unconfirmed"
  | "confirmed"
  | "refuted"
  | "entered-in-error";
export type AllergyType = "allergy" | "intolerance";
export type AllergyCategory = "food" | "medication" | "environment" | "biologic";
export type AllergyCriticality = "low" | "high" | "unable-to-assess";
export type AllergyReactionSeverity = "mild" | "moderate" | "severe";

const allergyClinicalStatuses = new Set<AllergyClinicalStatus>([
  "active",
  "inactive",
  "resolved"
]);
const allergyVerificationStatuses = new Set<AllergyVerificationStatus>([
  "unconfirmed",
  "confirmed",
  "refuted",
  "entered-in-error"
]);
const allergyTypes = new Set<AllergyType>(["allergy", "intolerance"]);
const allergyCategories = new Set<AllergyCategory>([
  "food",
  "medication",
  "environment",
  "biologic"
]);
const allergyCriticalities = new Set<AllergyCriticality>([
  "low",
  "high",
  "unable-to-assess"
]);
const allergyReactionSeverities = new Set<AllergyReactionSeverity>([
  "mild",
  "moderate",
  "severe"
]);

export type AllergyCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type AllergyReaction = {
  readonly manifestation: AllergyCode;
  readonly severity?: AllergyReactionSeverity;
  readonly description?: string;
};

export type AllergyIntoleranceSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly clinicalStatus: AllergyClinicalStatus;
  readonly verificationStatus: AllergyVerificationStatus;
  readonly type: AllergyType;
  readonly category: AllergyCategory;
  readonly criticality?: AllergyCriticality;
  readonly code: AllergyCode;
  readonly reaction?: AllergyReaction;
  readonly recordedAt: string;
  readonly recorderPractitionerId: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateAllergyIntoleranceInput = Omit<
  AllergyIntoleranceSnapshot,
  "clinicalStatus" | "verificationStatus" | "recordedAt" | "createdAt" | "updatedAt"
> & {
  readonly clinicalStatus?: AllergyClinicalStatus;
  readonly verificationStatus?: AllergyVerificationStatus;
  readonly recordedAt?: string;
};

export class AllergyIntolerance {
  private constructor(private readonly props: AllergyIntoleranceSnapshot) {}

  static record(input: CreateAllergyIntoleranceInput): AllergyIntolerance {
    const now = new Date();
    const recordedAt = input.recordedAt
      ? parseDate(input.recordedAt, "Thời điểm ghi nhận dị ứng không hợp lệ.")
      : now;

    return new AllergyIntolerance({
      id: normalizeRequired(input.id, "Mã dị ứng không được để trống."),
      patientId: normalizeRequired(input.patientId, "Dị ứng phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      clinicalStatus: normalizeClinicalStatus(input.clinicalStatus ?? "active"),
      verificationStatus: normalizeVerificationStatus(input.verificationStatus ?? "confirmed"),
      type: normalizeType(input.type),
      category: normalizeCategory(input.category),
      criticality: input.criticality ? normalizeCriticality(input.criticality) : undefined,
      code: normalizeCode(input.code, "dị ứng"),
      reaction: input.reaction ? normalizeReaction(input.reaction) : undefined,
      recordedAt: recordedAt.toISOString(),
      recorderPractitionerId: normalizeRequired(
        input.recorderPractitionerId,
        "Nhân sự ghi nhận dị ứng không được để trống."
      ),
      note: normalizeOptional(input.note),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: AllergyIntoleranceSnapshot): AllergyIntolerance {
    return new AllergyIntolerance({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã dị ứng không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Dị ứng phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      clinicalStatus: normalizeClinicalStatus(snapshot.clinicalStatus),
      verificationStatus: normalizeVerificationStatus(snapshot.verificationStatus),
      type: normalizeType(snapshot.type),
      category: normalizeCategory(snapshot.category),
      criticality: snapshot.criticality ? normalizeCriticality(snapshot.criticality) : undefined,
      code: normalizeCode(snapshot.code, "dị ứng"),
      reaction: snapshot.reaction ? normalizeReaction(snapshot.reaction) : undefined,
      recordedAt: parseDate(snapshot.recordedAt, "Thời điểm ghi nhận dị ứng không hợp lệ.").toISOString(),
      recorderPractitionerId: normalizeRequired(
        snapshot.recorderPractitionerId,
        "Nhân sự ghi nhận dị ứng không được để trống."
      ),
      note: normalizeOptional(snapshot.note),
      createdAt: parseDate(snapshot.createdAt, "Thời điểm tạo dị ứng không hợp lệ.").toISOString(),
      updatedAt: parseDate(snapshot.updatedAt, "Thời điểm cập nhật dị ứng không hợp lệ.").toISOString()
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  toSnapshot(): AllergyIntoleranceSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code },
      reaction: this.props.reaction
        ? {
            ...this.props.reaction,
            manifestation: { ...this.props.reaction.manifestation }
          }
        : undefined
    };
  }
}

function normalizeReaction(value: AllergyReaction): AllergyReaction {
  return {
    manifestation: normalizeCode(value.manifestation, "biểu hiện phản ứng"),
    severity: value.severity ? normalizeReactionSeverity(value.severity) : undefined,
    description: normalizeOptional(value.description)
  };
}

function normalizeCode(value: AllergyCode, label: string): AllergyCode {
  return {
    system: normalizeRequired(value.system, `Hệ mã ${label} không được để trống.`),
    code: normalizeRequired(value.code, `Mã ${label} không được để trống.`),
    display: normalizeRequired(value.display, `Tên ${label} không được để trống.`)
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

function normalizeClinicalStatus(value: AllergyClinicalStatus): AllergyClinicalStatus {
  if (!allergyClinicalStatuses.has(value)) {
    throw new DomainError("Trạng thái lâm sàng của dị ứng không hợp lệ.");
  }

  return value;
}

function normalizeVerificationStatus(
  value: AllergyVerificationStatus
): AllergyVerificationStatus {
  if (!allergyVerificationStatuses.has(value)) {
    throw new DomainError("Trạng thái xác minh của dị ứng không hợp lệ.");
  }

  return value;
}

function normalizeType(value: AllergyType): AllergyType {
  if (!allergyTypes.has(value)) {
    throw new DomainError("Loại dị ứng/không dung nạp không hợp lệ.");
  }

  return value;
}

function normalizeCategory(value: AllergyCategory): AllergyCategory {
  if (!allergyCategories.has(value)) {
    throw new DomainError("Nhóm dị ứng không hợp lệ.");
  }

  return value;
}

function normalizeCriticality(value: AllergyCriticality): AllergyCriticality {
  if (!allergyCriticalities.has(value)) {
    throw new DomainError("Mức độ nguy cơ của dị ứng không hợp lệ.");
  }

  return value;
}

function normalizeReactionSeverity(
  value: AllergyReactionSeverity
): AllergyReactionSeverity {
  if (!allergyReactionSeverities.has(value)) {
    throw new DomainError("Mức độ nặng của phản ứng dị ứng không hợp lệ.");
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
