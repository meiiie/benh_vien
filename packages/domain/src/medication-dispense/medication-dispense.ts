import {
  assertMedicationDispenseLifecycle,
  normalizeCategory,
  normalizeCoding,
  normalizeDosageInstruction,
  normalizeOptional,
  normalizeQuantity,
  normalizeRequired,
  normalizeRequiredCoding,
  normalizeStatus,
  parseDate,
  validatePersistenceTimeline
} from "./medication-dispense.validation.js";
import type {
  MedicationDispenseSnapshot,
  RecordMedicationDispenseInput
} from "./medication-dispense.types.js";

export type {
  MedicationDispenseCategory,
  MedicationDispenseSnapshot,
  MedicationDispenseStatus,
  RecordMedicationDispenseInput
} from "./medication-dispense.types.js";

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
    const status = normalizeStatus(input.status);
    const quantity = input.quantity
      ? normalizeQuantity(input.quantity, "Số lượng cấp phát")
      : undefined;
    const daysSupply = input.daysSupply
      ? normalizeQuantity(input.daysSupply, "Số ngày cấp thuốc")
      : undefined;
    assertMedicationDispenseLifecycle({ status, quantity, whenPrepared, whenHandedOver });

    return new MedicationDispense({
      id: normalizeRequired(input.id, "Mã cấp phát thuốc không được để trống."),
      patientId: normalizeRequired(input.patientId, "Cấp phát thuốc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      medicationRequestId: normalizeOptional(input.medicationRequestId),
      status,
      statusReason: normalizeCoding(input.statusReason),
      category: normalizeCategory(input.category),
      medicationCode: normalizeRequiredCoding(input.medicationCode),
      quantity,
      daysSupply,
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
    const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo cấp phát thuốc không hợp lệ.");
    const updatedAt = parseDate(snapshot.updatedAt, "Thời điểm cập nhật cấp phát thuốc không hợp lệ.");
    const status = normalizeStatus(snapshot.status);
    const quantity = snapshot.quantity
      ? normalizeQuantity(snapshot.quantity, "Số lượng cấp phát")
      : undefined;
    const daysSupply = snapshot.daysSupply
      ? normalizeQuantity(snapshot.daysSupply, "Số ngày cấp thuốc")
      : undefined;
    const whenPrepared = snapshot.whenPrepared
      ? parseDate(snapshot.whenPrepared, "Thời điểm chuẩn bị thuốc không hợp lệ.").toISOString()
      : undefined;
    const whenHandedOver = snapshot.whenHandedOver
      ? parseDate(snapshot.whenHandedOver, "Thời điểm bàn giao thuốc không hợp lệ.").toISOString()
      : undefined;

    assertMedicationDispenseLifecycle({ status, quantity, whenPrepared, whenHandedOver });
    validatePersistenceTimeline(createdAt, updatedAt);

    return new MedicationDispense({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã cấp phát thuốc không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Cấp phát thuốc phải gắn với bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      medicationRequestId: normalizeOptional(snapshot.medicationRequestId),
      status,
      statusReason: normalizeCoding(snapshot.statusReason),
      category: normalizeCategory(snapshot.category),
      medicationCode: normalizeRequiredCoding(snapshot.medicationCode),
      quantity,
      daysSupply,
      whenPrepared,
      whenHandedOver,
      dispenserPractitionerId: normalizeOptional(snapshot.dispenserPractitionerId),
      destinationLocationId: normalizeOptional(snapshot.destinationLocationId),
      receiverPractitionerId: normalizeOptional(snapshot.receiverPractitionerId),
      dosageInstruction: snapshot.dosageInstruction
        ? normalizeDosageInstruction(snapshot.dosageInstruction)
        : undefined,
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
