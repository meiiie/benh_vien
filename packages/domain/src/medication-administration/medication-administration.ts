import {
  assertMedicationAdministrationLifecycle,
  normalizeCoding,
  normalizeDosage,
  normalizeEffectivePeriod,
  normalizeOptional,
  normalizePerformers,
  normalizeRequired,
  normalizeRequiredCoding,
  parseDate,
  validatePersistenceTimeline
} from "./medication-administration.validation.js";
import {
  normalizeCategory,
  normalizeStatus
} from "./medication-administration.code-set-guards.js";
import type {
  MedicationAdministrationSnapshot,
  RecordMedicationAdministrationInput
} from "./medication-administration.types.js";

export type {
  MedicationAdministrationCategory,
  MedicationAdministrationDosage,
  MedicationAdministrationEffectivePeriod,
  MedicationAdministrationPerformer,
  MedicationAdministrationPerformerActorType,
  MedicationAdministrationSnapshot,
  MedicationAdministrationStatus,
  RecordMedicationAdministrationInput
} from "./medication-administration.types.js";

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
    const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo lần dùng thuốc không hợp lệ.");
    const updatedAt = parseDate(snapshot.updatedAt, "Thời điểm cập nhật lần dùng thuốc không hợp lệ.");
    const status = normalizeStatus(snapshot.status);
    const effectivePeriod = normalizeEffectivePeriod(snapshot.effectivePeriod);
    const performers = normalizePerformers(snapshot.performers);
    assertMedicationAdministrationLifecycle(status, effectivePeriod, performers);
    validatePersistenceTimeline(createdAt, updatedAt);

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
