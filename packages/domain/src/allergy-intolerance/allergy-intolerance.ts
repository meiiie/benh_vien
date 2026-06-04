import {
  normalizeCategory,
  normalizeClinicalStatus,
  normalizeCode,
  normalizeCriticality,
  normalizeOptional,
  normalizeReaction,
  normalizeRequired,
  normalizeType,
  normalizeVerificationStatus,
  parseDate,
  validatePersistenceTimeline
} from "./allergy-intolerance.validation.js";
import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCode,
  AllergyCriticality,
  AllergyIntoleranceSnapshot,
  AllergyReaction,
  AllergyReactionSeverity,
  AllergyType,
  AllergyVerificationStatus,
  CreateAllergyIntoleranceInput
} from "./allergy-intolerance.types.js";

export type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCode,
  AllergyCriticality,
  AllergyIntoleranceSnapshot,
  AllergyReaction,
  AllergyReactionSeverity,
  AllergyType,
  AllergyVerificationStatus,
  CreateAllergyIntoleranceInput
} from "./allergy-intolerance.types.js";

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
    const recordedAt = parseDate(snapshot.recordedAt, "Thời điểm ghi nhận dị ứng không hợp lệ.");
    const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo dị ứng không hợp lệ.");
    const updatedAt = parseDate(snapshot.updatedAt, "Thời điểm cập nhật dị ứng không hợp lệ.");
    validatePersistenceTimeline(createdAt, updatedAt);

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
      recordedAt: recordedAt.toISOString(),
      recorderPractitionerId: normalizeRequired(
        snapshot.recorderPractitionerId,
        "Nhân sự ghi nhận dị ứng không được để trống."
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
