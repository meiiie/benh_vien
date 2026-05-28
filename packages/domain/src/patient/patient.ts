import { DomainError } from "../shared/domain-error.js";

export type AdministrativeGender = "male" | "female" | "other" | "unknown";

export type PatientIdentifierType =
  | "national-id"
  | "insurance-id"
  | "hospital-mrn"
  | "legacy-id";

export type PatientRecordStatus = "active" | "merged" | "inactive";

export type PatientIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type: PatientIdentifierType;
};

export type PatientSnapshot = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender: AdministrativeGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
  readonly status: PatientRecordStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RegisterPatientInput = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender?: AdministrativeGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
};

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
      birthDate: input.birthDate,
      gender: input.gender ?? "unknown",
      address: normalizeOptionalText(input.address),
      phone: normalizeOptionalText(input.phone),
      managingOrganizationId: input.managingOrganizationId.trim(),
      status: "active",
      createdAt: now,
      updatedAt: now
    });
  }

  static rehydrate(snapshot: PatientSnapshot): Patient {
    return new Patient({
      id: snapshot.id,
      identifiers: [...snapshot.identifiers],
      fullName: snapshot.fullName,
      birthDate: snapshot.birthDate,
      gender: snapshot.gender,
      address: snapshot.address,
      phone: snapshot.phone,
      managingOrganizationId: snapshot.managingOrganizationId,
      status: snapshot.status,
      createdAt: new Date(snapshot.createdAt),
      updatedAt: new Date(snapshot.updatedAt)
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
    if (input.fullName !== undefined) {
      const fullName = normalizeText(input.fullName);
      if (!fullName) {
        throw new DomainError("Họ tên bệnh nhân không được để trống.");
      }
      this.props.fullName = fullName;
    }

    if (input.birthDate !== undefined) {
      this.props.birthDate = input.birthDate;
    }

    if (input.gender !== undefined) {
      this.props.gender = input.gender;
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

  markMerged(): void {
    this.props.status = "merged";
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
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}

function normalizeIdentifier(identifier: PatientIdentifier): PatientIdentifier {
  const system = identifier.system.trim();
  const value = identifier.value.trim();

  if (!system || !value) {
    throw new DomainError("Định danh bệnh nhân phải có hệ thống và giá trị.");
  }

  return {
    system,
    value,
    type: identifier.type
  };
}

function assertUniqueIdentifiers(identifiers: readonly PatientIdentifier[]): void {
  const seen = new Set<string>();

  for (const identifier of identifiers) {
    const key = `${identifier.system}\u0000${identifier.value}`;

    if (seen.has(key)) {
      throw new DomainError("Äá»‹nh danh bá»‡nh nhÃ¢n bá»‹ trÃ¹ng trong cÃ¹ng má»™t há»“ sÆ¡.");
    }

    seen.add(key);
  }
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}
