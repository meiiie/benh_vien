import { DomainError } from "../shared/domain-error.js";
import {
  administrativeGenders,
  patientIdentifierTypes,
  patientRecordStatuses
} from "./patient.types.js";
import type {
  AdministrativeGender,
  PatientIdentifier,
  PatientIdentifierType,
  PatientRecordStatus,
  PatientSnapshot,
  RegisterPatientInput
} from "./patient.types.js";

const fhirDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export type {
  AdministrativeGender,
  PatientIdentifier,
  PatientIdentifierType,
  PatientRecordStatus,
  PatientSnapshot,
  RegisterPatientInput
} from "./patient.types.js";

type PatientProps = {
  id: string;
  identifiers: PatientIdentifier[];
  fullName: string;
  birthDate?: string;
  gender: AdministrativeGender;
  address?: string;
  phone?: string;
  managingOrganizationId: string;
  status: PatientRecordStatus;
  mergedIntoPatientId?: string;
  mergedAt?: Date;
  mergedByActorId?: string;
  mergeReason?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Patient {
  private constructor(private readonly props: PatientProps) {}

  static register(input: RegisterPatientInput): Patient {
    const now = new Date();
    const fullName = normalizeText(input.fullName);

    if (!input.id.trim()) {
      throw new DomainError("Mã hồ sơ bệnh nhân không được để trống.");
    }

    if (!fullName) {
      throw new DomainError("Họ tên bệnh nhân không được để trống.");
    }

    if (input.identifiers.length === 0) {
      throw new DomainError("Bệnh nhân cần ít nhất một định danh.");
    }

    if (!input.managingOrganizationId.trim()) {
      throw new DomainError("Cơ sở quản lý hồ sơ không được để trống.");
    }

    const identifiers = input.identifiers.map(normalizeIdentifier);
    assertUniqueIdentifiers(identifiers);

    return new Patient({
      id: input.id.trim(),
      identifiers,
      fullName,
      birthDate: input.birthDate ? normalizeBirthDate(input.birthDate) : undefined,
      gender: normalizeGender(input.gender ?? "unknown"),
      address: normalizeOptionalText(input.address),
      phone: normalizeOptionalText(input.phone),
      managingOrganizationId: input.managingOrganizationId.trim(),
      status: "active",
      createdAt: now,
      updatedAt: now
    });
  }

  static rehydrate(snapshot: PatientSnapshot): Patient {
    const id = normalizeRequiredText(snapshot.id, "Mã hồ sơ bệnh nhân không được để trống.");
    const identifiers = snapshot.identifiers.map(normalizeIdentifier);

    if (identifiers.length === 0) {
      throw new DomainError("Bệnh nhân cần ít nhất một định danh.");
    }

    assertUniqueIdentifiers(identifiers);
    const fullName = normalizeRequiredText(
      snapshot.fullName,
      "Họ tên bệnh nhân không được để trống."
    );
    const status = normalizeStatus(snapshot.status);
    const mergedAt = snapshot.mergedAt
      ? parseDate(snapshot.mergedAt, "Thời điểm merge hồ sơ không hợp lệ.")
      : undefined;
    const createdAt = parseDate(
      snapshot.createdAt,
      "Thời điểm tạo hồ sơ bệnh nhân không hợp lệ."
    );
    const updatedAt = parseDate(
      snapshot.updatedAt,
      "Thời điểm cập nhật hồ sơ bệnh nhân không hợp lệ."
    );

    assertMergeState({
      id,
      status,
      mergedIntoPatientId: snapshot.mergedIntoPatientId,
      mergedAt,
      mergedByActorId: snapshot.mergedByActorId,
      mergeReason: snapshot.mergeReason
    });
    validateTimeline({ createdAt, updatedAt, mergedAt });

    return new Patient({
      id,
      identifiers,
      fullName,
      birthDate: snapshot.birthDate ? normalizeBirthDate(snapshot.birthDate) : undefined,
      gender: normalizeGender(snapshot.gender),
      address: normalizeOptionalText(snapshot.address),
      phone: normalizeOptionalText(snapshot.phone),
      managingOrganizationId: normalizeRequiredText(
        snapshot.managingOrganizationId,
        "Cơ sở quản lý hồ sơ không được để trống."
      ),
      status,
      mergedIntoPatientId: normalizeOptionalText(snapshot.mergedIntoPatientId),
      mergedAt,
      mergedByActorId: normalizeOptionalText(snapshot.mergedByActorId),
      mergeReason: normalizeOptionalText(snapshot.mergeReason),
      createdAt,
      updatedAt
    });
  }

  get id(): string {
    return this.props.id;
  }

  updateDemographics(input: {
    readonly fullName?: string;
    readonly birthDate?: string;
    readonly gender?: AdministrativeGender;
    readonly address?: string;
    readonly phone?: string;
  }): void {
    this.ensureMutable();

    if (input.fullName !== undefined) {
      const fullName = normalizeText(input.fullName);
      if (!fullName) {
        throw new DomainError("Họ tên bệnh nhân không được để trống.");
      }
      this.props.fullName = fullName;
    }

    if (input.birthDate !== undefined) {
      this.props.birthDate = normalizeBirthDate(input.birthDate);
    }

    if (input.gender !== undefined) {
      this.props.gender = normalizeGender(input.gender);
    }

    if (input.address !== undefined) {
      this.props.address = normalizeOptionalText(input.address);
    }

    if (input.phone !== undefined) {
      this.props.phone = normalizeOptionalText(input.phone);
    }

    this.touch();
  }

  addIdentifier(identifier: PatientIdentifier): void {
    this.ensureMutable();

    const normalized = normalizeIdentifier(identifier);
    const existed = this.props.identifiers.some(
      (current) =>
        current.system === normalized.system && current.value === normalized.value
    );

    if (!existed) {
      this.props.identifiers.push(normalized);
      this.touch();
    }
  }

  markMerged(input: {
    readonly targetPatientId: string;
    readonly mergedByActorId: string;
    readonly reason: string;
    readonly mergedAt?: Date;
  }): void {
    const targetPatientId = normalizeRequiredText(
      input.targetPatientId,
      "Hồ sơ đích khi merge không được để trống."
    );
    const mergedByActorId = normalizeRequiredText(
      input.mergedByActorId,
      "Người thực hiện merge hồ sơ không được để trống."
    );
    const reason = normalizeRequiredText(
      input.reason,
      "Lý do merge hồ sơ không được để trống."
    );

    if (targetPatientId === this.props.id) {
      throw new DomainError("Hồ sơ bệnh nhân không thể merge vào chính nó.");
    }

    if (this.props.status === "merged") {
      throw new DomainError("Hồ sơ bệnh nhân đã được merge trước đó.");
    }

    const mergedAt = input.mergedAt ?? new Date();
    assertValidDate(mergedAt, "Thời điểm merge hồ sơ không hợp lệ.");

    if (mergedAt < this.props.createdAt) {
      throw new DomainError("Thời điểm merge hồ sơ không được trước thời điểm tạo hồ sơ.");
    }

    this.props.status = "merged";
    this.props.mergedIntoPatientId = targetPatientId;
    this.props.mergedAt = mergedAt;
    this.props.mergedByActorId = mergedByActorId;
    this.props.mergeReason = reason;
    this.touch();
  }

  toSnapshot(): PatientSnapshot {
    return {
      id: this.props.id,
      identifiers: this.props.identifiers.map((identifier) => ({ ...identifier })),
      fullName: this.props.fullName,
      birthDate: this.props.birthDate,
      gender: this.props.gender,
      address: this.props.address,
      phone: this.props.phone,
      managingOrganizationId: this.props.managingOrganizationId,
      status: this.props.status,
      mergedIntoPatientId: this.props.mergedIntoPatientId,
      mergedAt: this.props.mergedAt?.toISOString(),
      mergedByActorId: this.props.mergedByActorId,
      mergeReason: this.props.mergeReason,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }

  private ensureMutable(): void {
    if (this.props.status === "merged") {
      throw new DomainError("Hồ sơ bệnh nhân đã merge không được cập nhật trực tiếp.");
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}

function normalizeIdentifier(identifier: PatientIdentifier): PatientIdentifier {
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

function assertUniqueIdentifiers(identifiers: readonly PatientIdentifier[]): void {
  const seen = new Set<string>();

  for (const identifier of identifiers) {
    const key = `${identifier.system}\u0000${identifier.value}`;

    if (seen.has(key)) {
      throw new DomainError("Định danh bệnh nhân bị trùng trong cùng một hồ sơ.");
    }

    seen.add(key);
  }
}

function assertMergeState(input: {
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

function validateTimeline(input: {
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

function normalizeGender(value: AdministrativeGender): AdministrativeGender {
  if (!administrativeGenders.has(value)) {
    throw new DomainError("Giới tính hành chính của bệnh nhân không hợp lệ.");
  }

  return value;
}

function normalizeIdentifierType(value: PatientIdentifierType): PatientIdentifierType {
  if (!patientIdentifierTypes.has(value)) {
    throw new DomainError("Loại định danh bệnh nhân không hợp lệ.");
  }

  return value;
}

function normalizeStatus(value: PatientRecordStatus): PatientRecordStatus {
  if (!patientRecordStatuses.has(value)) {
    throw new DomainError("Trạng thái hồ sơ bệnh nhân không hợp lệ.");
  }

  return value;
}

function normalizeBirthDate(value: string): string {
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

function parseDate(value: string, message: string): Date {
  const date = new Date(value);
  assertValidDate(date, message);
  return date;
}

function assertValidDate(value: Date, message: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeRequiredText(value: string, message: string): string {
  const normalized = normalizeText(value);

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}
