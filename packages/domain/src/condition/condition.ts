import {
  normalizeCategory,
  normalizeClinicalStatus,
  normalizeCode,
  normalizeOptional,
  normalizeRequired,
  normalizeSeverity,
  normalizeVerificationStatus,
  parseDate,
  validateTimeline
} from "./condition.validation.js";
import type {
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionCode,
  ConditionSeverity,
  ConditionSnapshot,
  ConditionVerificationStatus,
  CreateConditionInput
} from "./condition.types.js";

export type {
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionCode,
  ConditionSeverity,
  ConditionSnapshot,
  ConditionVerificationStatus,
  CreateConditionInput
} from "./condition.types.js";

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
    validateTimeline({
      onsetAt,
      recordedAt,
      createdAt: now,
      updatedAt: now
    });

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
    const onsetAt = snapshot.onsetAt
      ? parseDate(snapshot.onsetAt, "Thời điểm khởi phát chẩn đoán không hợp lệ.")
      : undefined;
    const recordedAt = parseDate(
      snapshot.recordedAt,
      "Thời điểm ghi nhận chẩn đoán không hợp lệ."
    );
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo chẩn đoán không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật chẩn đoán không hợp lệ."
    );

    validateTimeline({ onsetAt, recordedAt, createdAt, updatedAt });

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
      onsetAt: onsetAt?.toISOString(),
      recordedAt: recordedAt.toISOString(),
      recorderPractitionerId: normalizeRequired(
        snapshot.recorderPractitionerId,
        "Nhân sự ghi nhận chẩn đoán không được để trống."
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

  toSnapshot(): ConditionSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code }
    };
  }
}
