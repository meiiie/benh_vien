import {
  normalizeCategory,
  normalizeDosageInstruction,
  normalizeIntent,
  normalizeMedicationCode,
  normalizeOptional,
  normalizePositiveNumber,
  normalizePriority,
  normalizeRequired,
  normalizeStatus,
  parseDate,
  validatePersistenceTimeline
} from "./medication-request.validation.js";
import type {
  CreateMedicationRequestInput,
  MedicationRequestSnapshot
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
