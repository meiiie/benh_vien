import { DomainError } from "../shared/domain-error.js";

export type ProviderIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type?: string;
};

export type ProviderTelecom = {
  readonly system: "phone" | "email" | "url";
  readonly value: string;
  readonly use?: "work" | "mobile" | "home";
};

export type ProviderCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ProviderOrganizationType =
  | "hospital"
  | "department"
  | "laboratory"
  | "imaging"
  | "payer"
  | "government"
  | "other";

export type ProviderEndpointStatus =
  | "active"
  | "suspended"
  | "error"
  | "off"
  | "entered-in-error"
  | "test";

export type ProviderEndpointConnectionType =
  | "hl7-fhir-rest"
  | "dicom-wado-rs"
  | "hl7v2-mllp"
  | "direct-project"
  | "ihe-xds"
  | "other";

const providerOrganizationTypes = new Set<ProviderOrganizationType>([
  "hospital",
  "department",
  "laboratory",
  "imaging",
  "payer",
  "government",
  "other"
]);

const providerEndpointStatuses = new Set<ProviderEndpointStatus>([
  "active",
  "suspended",
  "error",
  "off",
  "entered-in-error",
  "test"
]);

const providerEndpointConnectionTypes = new Set<ProviderEndpointConnectionType>([
  "hl7-fhir-rest",
  "dicom-wado-rs",
  "hl7v2-mllp",
  "direct-project",
  "ihe-xds",
  "other"
]);

const providerTelecomSystems = new Set<ProviderTelecom["system"]>(["phone", "email", "url"]);
const providerTelecomUses = new Set<NonNullable<ProviderTelecom["use"]>>([
  "work",
  "mobile",
  "home"
]);

export type ProviderOrganizationSnapshot = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly type: ProviderOrganizationType;
  readonly name: string;
  readonly alias?: readonly string[];
  readonly address?: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly partOfOrganizationId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderPractitionerSnapshot = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly fullName: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly qualification?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderEndpointSnapshot = {
  readonly id: string;
  readonly managingOrganizationId: string;
  readonly status: ProviderEndpointStatus;
  readonly connectionType: ProviderEndpointConnectionType;
  readonly name: string;
  readonly address: string;
  readonly payloadTypes: readonly ProviderCoding[];
  readonly contact?: readonly ProviderTelecom[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderPractitionerRoleSnapshot = {
  readonly id: string;
  readonly practitionerId?: string;
  readonly organizationId: string;
  readonly active: boolean;
  readonly code: ProviderCoding;
  readonly specialty?: ProviderCoding;
  readonly endpointIds?: readonly string[];
  readonly telecom?: readonly ProviderTelecom[];
  readonly periodStart?: string;
  readonly periodEnd?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderDirectorySnapshot = {
  readonly organizations: readonly ProviderOrganizationSnapshot[];
  readonly practitioners: readonly ProviderPractitionerSnapshot[];
  readonly practitionerRoles: readonly ProviderPractitionerRoleSnapshot[];
  readonly endpoints: readonly ProviderEndpointSnapshot[];
  readonly generatedAt: string;
};

export type ProviderDirectoryInput = {
  readonly organizations: readonly Omit<ProviderOrganizationSnapshot, "createdAt" | "updatedAt">[];
  readonly practitioners: readonly Omit<ProviderPractitionerSnapshot, "createdAt" | "updatedAt">[];
  readonly practitionerRoles: readonly Omit<ProviderPractitionerRoleSnapshot, "createdAt" | "updatedAt">[];
  readonly endpoints: readonly Omit<ProviderEndpointSnapshot, "createdAt" | "updatedAt">[];
  readonly generatedAt?: Date;
};

export class ProviderDirectory {
  private constructor(private readonly snapshot: ProviderDirectorySnapshot) {}

  static assemble(input: ProviderDirectoryInput): ProviderDirectory {
    const now = input.generatedAt ?? new Date();
    assertValidDate(now, "Thời điểm tạo Provider Directory không hợp lệ.");
    const organizations = input.organizations.map((organization) =>
      normalizeOrganization(organization, now)
    );
    const practitioners = input.practitioners.map((practitioner) =>
      normalizePractitioner(practitioner, now)
    );
    const endpoints = input.endpoints.map((endpoint) => normalizeEndpoint(endpoint, now));
    const practitionerRoles = input.practitionerRoles.map((role) =>
      normalizePractitionerRole(role, now)
    );

    validateUniqueIds("Organization", organizations.map((organization) => organization.id));
    validateUniqueIds("Practitioner", practitioners.map((practitioner) => practitioner.id));
    validateUniqueIds("Endpoint", endpoints.map((endpoint) => endpoint.id));
    validateUniqueIds("PractitionerRole", practitionerRoles.map((role) => role.id));
    validateReferences({ organizations, practitioners, practitionerRoles, endpoints });

    return new ProviderDirectory({
      organizations,
      practitioners,
      practitionerRoles,
      endpoints,
      generatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ProviderDirectorySnapshot): ProviderDirectory {
    const organizations = snapshot.organizations.map(normalizePersistedOrganization);
    const practitioners = snapshot.practitioners.map(normalizePersistedPractitioner);
    const endpoints = snapshot.endpoints.map(normalizePersistedEndpoint);
    const practitionerRoles = snapshot.practitionerRoles.map(normalizePersistedPractitionerRole);
    const generatedAt = normalizeTimestamp(
      snapshot.generatedAt,
      "Thời điểm sinh Provider Directory không hợp lệ."
    );

    validateUniqueIds("Organization", organizations.map((organization) => organization.id));
    validateUniqueIds("Practitioner", practitioners.map((practitioner) => practitioner.id));
    validateUniqueIds("Endpoint", endpoints.map((endpoint) => endpoint.id));
    validateUniqueIds("PractitionerRole", practitionerRoles.map((role) => role.id));
    validateReferences({ organizations, practitioners, practitionerRoles, endpoints });

    return new ProviderDirectory({
      organizations,
      practitioners,
      practitionerRoles,
      endpoints,
      generatedAt
    });
  }

  toSnapshot(): ProviderDirectorySnapshot {
    return {
      organizations: this.snapshot.organizations.map(cloneOrganization),
      practitioners: this.snapshot.practitioners.map(clonePractitioner),
      practitionerRoles: this.snapshot.practitionerRoles.map(clonePractitionerRole),
      endpoints: this.snapshot.endpoints.map(cloneEndpoint),
      generatedAt: this.snapshot.generatedAt
    };
  }
}

function normalizeOrganization(
  input: Omit<ProviderOrganizationSnapshot, "createdAt" | "updatedAt">,
  now: Date
): ProviderOrganizationSnapshot {
  const id = normalizeRequired(input.id, "Mã cơ sở y tế không được để trống.");
  const name = normalizeRequired(input.name, "Tên cơ sở y tế không được để trống.");

  return {
    id,
    identifiers: input.identifiers.map(normalizeIdentifier),
    active: input.active,
    type: normalizeOrganizationType(input.type),
    name,
    alias: normalizeTextList(input.alias),
    address: normalizeOptional(input.address),
    telecom: input.telecom?.map(normalizeTelecom),
    partOfOrganizationId: normalizeOptional(input.partOfOrganizationId),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

function normalizePractitioner(
  input: Omit<ProviderPractitionerSnapshot, "createdAt" | "updatedAt">,
  now: Date
): ProviderPractitionerSnapshot {
  const id = normalizeRequired(input.id, "Mã nhân sự y tế không được để trống.");
  const fullName = normalizeRequired(input.fullName, "Tên nhân sự y tế không được để trống.");

  return {
    id,
    identifiers: input.identifiers.map(normalizeIdentifier),
    active: input.active,
    fullName,
    telecom: input.telecom?.map(normalizeTelecom),
    qualification: normalizeOptional(input.qualification),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

function normalizeEndpoint(
  input: Omit<ProviderEndpointSnapshot, "createdAt" | "updatedAt">,
  now: Date
): ProviderEndpointSnapshot {
  const id = normalizeRequired(input.id, "Mã endpoint không được để trống.");
  const name = normalizeRequired(input.name, "Tên endpoint không được để trống.");
  const address = normalizeRequired(input.address, "Địa chỉ endpoint không được để trống.");

  if (input.payloadTypes.length === 0) {
    throw new DomainError("Endpoint cần ít nhất một payloadType để mô tả loại dữ liệu hỗ trợ.");
  }

  return {
    id,
    managingOrganizationId: normalizeRequired(
      input.managingOrganizationId,
      "Endpoint phải thuộc một cơ sở y tế quản lý."
    ),
    status: normalizeEndpointStatus(input.status),
    connectionType: normalizeEndpointConnectionType(input.connectionType),
    name,
    address,
    payloadTypes: input.payloadTypes.map(normalizeCoding),
    contact: input.contact?.map(normalizeTelecom),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

function normalizePractitionerRole(
  input: Omit<ProviderPractitionerRoleSnapshot, "createdAt" | "updatedAt">,
  now: Date
): ProviderPractitionerRoleSnapshot {
  const id = normalizeRequired(input.id, "Mã vai trò nhân sự không được để trống.");
  const period = normalizeRolePeriod(input.periodStart, input.periodEnd);

  return {
    id,
    practitionerId: normalizeOptional(input.practitionerId),
    organizationId: normalizeRequired(
      input.organizationId,
      "Vai trò nhân sự phải gắn với một cơ sở/khoa phòng."
    ),
    active: input.active,
    code: normalizeCoding(input.code),
    specialty: input.specialty ? normalizeCoding(input.specialty) : undefined,
    endpointIds: normalizeTextList(input.endpointIds),
    telecom: input.telecom?.map(normalizeTelecom),
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

function normalizePersistedOrganization(
  snapshot: ProviderOrganizationSnapshot
): ProviderOrganizationSnapshot {
  return {
    ...normalizeOrganization(
      snapshot,
      parseDate(snapshot.createdAt, "createdAt của Organization không hợp lệ.")
    ),
    createdAt: normalizeTimestamp(snapshot.createdAt, "createdAt của Organization không hợp lệ."),
    updatedAt: normalizeTimestamp(snapshot.updatedAt, "updatedAt của Organization không hợp lệ.")
  };
}

function normalizePersistedPractitioner(
  snapshot: ProviderPractitionerSnapshot
): ProviderPractitionerSnapshot {
  return {
    ...normalizePractitioner(
      snapshot,
      parseDate(snapshot.createdAt, "createdAt của Practitioner không hợp lệ.")
    ),
    createdAt: normalizeTimestamp(snapshot.createdAt, "createdAt của Practitioner không hợp lệ."),
    updatedAt: normalizeTimestamp(snapshot.updatedAt, "updatedAt của Practitioner không hợp lệ.")
  };
}

function normalizePersistedEndpoint(snapshot: ProviderEndpointSnapshot): ProviderEndpointSnapshot {
  return {
    ...normalizeEndpoint(
      snapshot,
      parseDate(snapshot.createdAt, "createdAt của Endpoint không hợp lệ.")
    ),
    createdAt: normalizeTimestamp(snapshot.createdAt, "createdAt của Endpoint không hợp lệ."),
    updatedAt: normalizeTimestamp(snapshot.updatedAt, "updatedAt của Endpoint không hợp lệ.")
  };
}

function normalizePersistedPractitionerRole(
  snapshot: ProviderPractitionerRoleSnapshot
): ProviderPractitionerRoleSnapshot {
  return {
    ...normalizePractitionerRole(
      snapshot,
      parseDate(snapshot.createdAt, "createdAt của PractitionerRole không hợp lệ.")
    ),
    createdAt: normalizeTimestamp(snapshot.createdAt, "createdAt của PractitionerRole không hợp lệ."),
    updatedAt: normalizeTimestamp(snapshot.updatedAt, "updatedAt của PractitionerRole không hợp lệ.")
  };
}

function validateReferences(snapshot: {
  readonly organizations: readonly ProviderOrganizationSnapshot[];
  readonly practitioners: readonly ProviderPractitionerSnapshot[];
  readonly practitionerRoles: readonly ProviderPractitionerRoleSnapshot[];
  readonly endpoints: readonly ProviderEndpointSnapshot[];
}): void {
  const organizationIds = new Set(snapshot.organizations.map((organization) => organization.id));
  const practitionerIds = new Set(snapshot.practitioners.map((practitioner) => practitioner.id));
  const endpointIds = new Set(snapshot.endpoints.map((endpoint) => endpoint.id));

  for (const organization of snapshot.organizations) {
    if (organization.partOfOrganizationId && !organizationIds.has(organization.partOfOrganizationId)) {
      throw new DomainError(`Organization ${organization.id} tham chiếu partOf không tồn tại.`);
    }
  }

  for (const endpoint of snapshot.endpoints) {
    if (!organizationIds.has(endpoint.managingOrganizationId)) {
      throw new DomainError(`Endpoint ${endpoint.id} tham chiếu Organization không tồn tại.`);
    }
  }

  for (const role of snapshot.practitionerRoles) {
    if (!organizationIds.has(role.organizationId)) {
      throw new DomainError(`PractitionerRole ${role.id} tham chiếu Organization không tồn tại.`);
    }

    if (role.practitionerId && !practitionerIds.has(role.practitionerId)) {
      throw new DomainError(`PractitionerRole ${role.id} tham chiếu Practitioner không tồn tại.`);
    }

    for (const endpointId of role.endpointIds ?? []) {
      if (!endpointIds.has(endpointId)) {
        throw new DomainError(`PractitionerRole ${role.id} tham chiếu Endpoint không tồn tại.`);
      }
    }
  }
}

function validateUniqueIds(resourceType: string, ids: readonly string[]): void {
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      throw new DomainError(`${resourceType} bị trùng mã ${id}.`);
    }

    seen.add(id);
  }
}

function normalizeIdentifier(identifier: ProviderIdentifier): ProviderIdentifier {
  return {
    system: normalizeRequired(identifier.system, "Identifier.system không được để trống."),
    value: normalizeRequired(identifier.value, "Identifier.value không được để trống."),
    type: normalizeOptional(identifier.type)
  };
}

function normalizeTelecom(telecom: ProviderTelecom): ProviderTelecom {
  return {
    system: normalizeTelecomSystem(telecom.system),
    value: normalizeRequired(telecom.value, "Thông tin liên hệ không được để trống."),
    use: telecom.use ? normalizeTelecomUse(telecom.use) : undefined
  };
}

function normalizeCoding(coding: ProviderCoding): ProviderCoding {
  return {
    system: normalizeRequired(coding.system, "Coding.system không được để trống."),
    code: normalizeRequired(coding.code, "Coding.code không được để trống."),
    display: normalizeRequired(coding.display, "Coding.display không được để trống.")
  };
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

function normalizeTextList(values: readonly string[] | undefined): string[] | undefined {
  const normalized = values?.map((value) => normalizeOptional(value)).filter(Boolean) as
    | string[]
    | undefined;

  return normalized && normalized.length > 0 ? normalized : undefined;
}

function normalizeOrganizationType(type: ProviderOrganizationType): ProviderOrganizationType {
  if (!providerOrganizationTypes.has(type)) {
    throw new DomainError("Loại cơ sở y tế trong Provider Directory không hợp lệ.");
  }

  return type;
}

function normalizeEndpointStatus(status: ProviderEndpointStatus): ProviderEndpointStatus {
  if (!providerEndpointStatuses.has(status)) {
    throw new DomainError("Trạng thái Endpoint trong Provider Directory không hợp lệ.");
  }

  return status;
}

function normalizeEndpointConnectionType(
  connectionType: ProviderEndpointConnectionType
): ProviderEndpointConnectionType {
  if (!providerEndpointConnectionTypes.has(connectionType)) {
    throw new DomainError("Loại kết nối Endpoint trong Provider Directory không hợp lệ.");
  }

  return connectionType;
}

function normalizeTelecomSystem(system: ProviderTelecom["system"]): ProviderTelecom["system"] {
  if (!providerTelecomSystems.has(system)) {
    throw new DomainError("Hệ thống liên hệ trong Provider Directory không hợp lệ.");
  }

  return system;
}

function normalizeTelecomUse(
  use: NonNullable<ProviderTelecom["use"]>
): NonNullable<ProviderTelecom["use"]> {
  if (!providerTelecomUses.has(use)) {
    throw new DomainError("Mục đích liên hệ trong Provider Directory không hợp lệ.");
  }

  return use;
}

function normalizeRolePeriod(
  periodStart: string | undefined,
  periodEnd: string | undefined
): Pick<ProviderPractitionerRoleSnapshot, "periodStart" | "periodEnd"> {
  const normalizedStart = normalizeOptional(periodStart);
  const normalizedEnd = normalizeOptional(periodEnd);
  const start = normalizedStart
    ? parseDate(normalizedStart, "Thời điểm bắt đầu vai trò nhân sự không hợp lệ.")
    : undefined;
  const end = normalizedEnd
    ? parseDate(normalizedEnd, "Thời điểm kết thúc vai trò nhân sự không hợp lệ.")
    : undefined;

  if (start && end && end.getTime() < start.getTime()) {
    throw new DomainError("Thời điểm kết thúc vai trò nhân sự không được trước thời điểm bắt đầu.");
  }

  return {
    periodStart: normalizedStart,
    periodEnd: normalizedEnd
  };
}

function normalizeTimestamp(value: string, message: string): string {
  return parseDate(value, message).toISOString();
}

function parseDate(value: string, message: string): Date {
  const date = new Date(normalizeRequired(value, message));
  assertValidDate(date, message);

  return date;
}

function assertValidDate(value: Date, message: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }
}

function cloneOrganization(snapshot: ProviderOrganizationSnapshot): ProviderOrganizationSnapshot {
  return {
    ...snapshot,
    identifiers: snapshot.identifiers.map((identifier) => ({ ...identifier })),
    alias: snapshot.alias ? [...snapshot.alias] : undefined,
    telecom: snapshot.telecom?.map((telecom) => ({ ...telecom }))
  };
}

function clonePractitioner(snapshot: ProviderPractitionerSnapshot): ProviderPractitionerSnapshot {
  return {
    ...snapshot,
    identifiers: snapshot.identifiers.map((identifier) => ({ ...identifier })),
    telecom: snapshot.telecom?.map((telecom) => ({ ...telecom }))
  };
}

function cloneEndpoint(snapshot: ProviderEndpointSnapshot): ProviderEndpointSnapshot {
  return {
    ...snapshot,
    payloadTypes: snapshot.payloadTypes.map((payloadType) => ({ ...payloadType })),
    contact: snapshot.contact?.map((contact) => ({ ...contact }))
  };
}

function clonePractitionerRole(
  snapshot: ProviderPractitionerRoleSnapshot
): ProviderPractitionerRoleSnapshot {
  return {
    ...snapshot,
    code: { ...snapshot.code },
    specialty: snapshot.specialty ? { ...snapshot.specialty } : undefined,
    endpointIds: snapshot.endpointIds ? [...snapshot.endpointIds] : undefined,
    telecom: snapshot.telecom?.map((telecom) => ({ ...telecom }))
  };
}
