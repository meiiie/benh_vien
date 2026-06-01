import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText,
  normalizeRequiredText,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";
import {
  administrativeGenders,
  patientIdentifierTypes,
  patientRecordStatuses
} from "./patient.types.js";
import type {
  AdministrativeGender,
  PatientIdentifier,
  PatientIdentifierType,
  PatientRecordStatus
} from "./patient.types.js";

const fhirDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export {
  normalizeOptionalText,
  normalizeRequiredText,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";

export function normalizeIdentifier(identifier: PatientIdentifier): PatientIdentifier {
  const system = identifier.system.trim();
  const value = identifier.value.trim();
  const type = normalizeIdentifierType(identifier.type);

  if (!system || !value) {
    throw new DomainError("Định danh bệnh nhân phải có hệ thống và giá trị.");
  }

  return {
    system,
    value,
    type
  };
}

export function assertUniqueIdentifiers(identifiers: readonly PatientIdentifier[]): void {
  const seen = new Set<string>();

  for (const identifier of identifiers) {
    const key = `${identifier.system}\u0000${identifier.value}`;

    if (seen.has(key)) {
      throw new DomainError("Định danh bệnh nhân bị trùng trong cùng một hồ sơ.");
    }

    seen.add(key);
  }
}

export function assertMergeState(input: {
  readonly id: string;
  readonly status: PatientRecordStatus;
  readonly mergedIntoPatientId?: string;
  readonly mergedAt?: Date;
  readonly mergedByActorId?: string;
  readonly mergeReason?: string;
}): void {
  const mergedIntoPatientId = normalizeOptionalText(input.mergedIntoPatientId);
  const mergedByActorId = normalizeOptionalText(input.mergedByActorId);
  const mergeReason = normalizeOptionalText(input.mergeReason);
  const hasMergeMetadata = Boolean(
    mergedIntoPatientId || input.mergedAt || mergedByActorId || mergeReason
  );

  if (input.status === "merged") {
    if (!mergedIntoPatientId || !input.mergedAt || !mergedByActorId || !mergeReason) {
      throw new DomainError("Hồ sơ đã merge cần đủ hồ sơ đích, thời điểm, người thực hiện và lý do.");
    }

    if (mergedIntoPatientId === input.id) {
      throw new DomainError("Hồ sơ bệnh nhân không thể merge vào chính nó.");
    }

    return;
  }

  if (hasMergeMetadata) {
    throw new DomainError("Chỉ hồ sơ ở trạng thái merged mới được có thông tin merge.");
  }
}

export function validateTimeline(input: {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly mergedAt?: Date;
}): void {
  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật hồ sơ không được trước thời điểm tạo hồ sơ.");
  }

  if (input.mergedAt && input.mergedAt < input.createdAt) {
    throw new DomainError("Thời điểm merge hồ sơ không được trước thời điểm tạo hồ sơ.");
  }
}

export function normalizeGender(value: AdministrativeGender): AdministrativeGender {
  if (!administrativeGenders.has(value)) {
    throw new DomainError("Giới tính hành chính của bệnh nhân không hợp lệ.");
  }

  return value;
}

export function normalizeIdentifierType(value: PatientIdentifierType): PatientIdentifierType {
  if (!patientIdentifierTypes.has(value)) {
    throw new DomainError("Loại định danh bệnh nhân không hợp lệ.");
  }

  return value;
}

export function normalizeStatus(value: PatientRecordStatus): PatientRecordStatus {
  if (!patientRecordStatuses.has(value)) {
    throw new DomainError("Trạng thái hồ sơ bệnh nhân không hợp lệ.");
  }

  return value;
}

export function normalizeBirthDate(value: string): string {
  const normalized = normalizeText(value);

  if (!fhirDatePattern.test(normalized)) {
    throw new DomainError("Ngày sinh bệnh nhân phải theo định dạng YYYY-MM-DD.");
  }

  const date = new Date(`${normalized}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError("Ngày sinh bệnh nhân không hợp lệ.");
  }

  const dateValue = date.toISOString().slice(0, 10);

  if (dateValue !== normalized) {
    throw new DomainError("Ngày sinh bệnh nhân không hợp lệ.");
  }

  return normalized;
}

export function assertValidDate(value: Date, message: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }
}

export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
