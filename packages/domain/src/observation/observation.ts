import { DomainError } from "../shared/domain-error.js";
import { observationCategories, observationStatuses } from "./observation.types.js";
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

function normalizeQuantity(value: ObservationQuantity): ObservationQuantity {
  if (!Number.isFinite(value.value)) {
    throw new DomainError("Giá trị định lượng của observation không hợp lệ.");
  }

  return {
    value: value.value,
    unit: normalizeRequired(value.unit, "Đơn vị observation không được để trống."),
    system: normalizeOptional(value.system),
    code: normalizeOptional(value.code)
  };
}

function validateObservationValue(
  valueText: string | undefined,
  valueQuantity: ObservationQuantity | undefined
): void {
  if (!valueText && !valueQuantity) {
    throw new DomainError("Observation phải có giá trị định lượng hoặc giá trị văn bản.");
  }

  if (valueText && valueQuantity) {
    throw new DomainError("Observation chỉ được có một kiểu giá trị trong lát cắt hiện tại.");
  }
}

function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt < createdAt) {
    throw new DomainError("Thời điểm cập nhật observation không được trước thời điểm tạo observation.");
  }
}

function normalizeStatus(value: ObservationStatus): ObservationStatus {
  if (!observationStatuses.has(value)) {
    throw new DomainError("Trạng thái observation không hợp lệ.");
  }

  return value;
}

function normalizeCategory(value: ObservationCategory): ObservationCategory {
  if (!observationCategories.has(value)) {
    throw new DomainError("Nhóm observation không hợp lệ.");
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
