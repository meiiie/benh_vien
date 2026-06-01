import {
  normalizeCategory,
  normalizeOptional,
  normalizeQuantity,
  normalizeRequired,
  normalizeStatus,
  parseDate,
  validateObservationValue,
  validatePersistenceTimeline
} from "./observation.validation.js";
import type {
  CreateObservationInput,
  ObservationCategory,
  ObservationQuantity,
  ObservationSnapshot,
  ObservationStatus
} from "./observation.types.js";

export type {
  CreateObservationInput,
  ObservationCategory,
  ObservationCode,
  ObservationQuantity,
  ObservationSnapshot,
  ObservationStatus
} from "./observation.types.js";

export class Observation {
  private constructor(private readonly props: ObservationSnapshot) {}

  static record(input: CreateObservationInput): Observation {
    const now = new Date();
    const effectiveAt = parseDate(input.effectiveAt, "Thời điểm ghi nhận observation không hợp lệ.");
    const valueText = normalizeOptional(input.valueText);
    const valueQuantity = input.valueQuantity ? normalizeQuantity(input.valueQuantity) : undefined;

    validateObservationValue(valueText, valueQuantity);

    return new Observation({
      id: normalizeRequired(input.id, "Mã observation không được để trống."),
      patientId: normalizeRequired(input.patientId, "Observation phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(input.encounterId),
      status: normalizeStatus(input.status ?? "final"),
      category: normalizeCategory(input.category),
      code: {
        system: normalizeRequired(input.code.system, "Hệ mã observation không được để trống."),
        code: normalizeRequired(input.code.code, "Mã observation không được để trống."),
        display: normalizeRequired(input.code.display, "Tên observation không được để trống.")
      },
      effectiveAt: effectiveAt.toISOString(),
      valueQuantity,
      valueText,
      performerPractitionerId: normalizeOptional(input.performerPractitionerId),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ObservationSnapshot): Observation {
    const effectiveAt = parseDate(
      snapshot.effectiveAt,
      "Thời điểm ghi nhận observation không hợp lệ."
    );
    const valueText = normalizeOptional(snapshot.valueText);
    const valueQuantity = snapshot.valueQuantity
      ? normalizeQuantity(snapshot.valueQuantity)
      : undefined;
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo observation không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật observation không hợp lệ."
    );

    validateObservationValue(valueText, valueQuantity);
    validatePersistenceTimeline(createdAt, updatedAt);

    return new Observation({
      ...snapshot,
      id: normalizeRequired(snapshot.id, "Mã observation không được để trống."),
      patientId: normalizeRequired(snapshot.patientId, "Observation phải gắn với một bệnh nhân."),
      encounterId: normalizeOptional(snapshot.encounterId),
      status: normalizeStatus(snapshot.status),
      category: normalizeCategory(snapshot.category),
      code: {
        system: normalizeRequired(snapshot.code.system, "Hệ mã observation không được để trống."),
        code: normalizeRequired(snapshot.code.code, "Mã observation không được để trống."),
        display: normalizeRequired(snapshot.code.display, "Tên observation không được để trống.")
      },
      effectiveAt: effectiveAt.toISOString(),
      valueQuantity,
      valueText,
      performerPractitionerId: normalizeOptional(snapshot.performerPractitionerId),
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

  toSnapshot(): ObservationSnapshot {
    return {
      ...this.props,
      code: { ...this.props.code },
      valueQuantity: this.props.valueQuantity ? { ...this.props.valueQuantity } : undefined
    };
  }
}
