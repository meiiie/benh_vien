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
    validateUniqueIds("Organization", snapshot.organizations.map((organization) => organization.id));
    validateUniqueIds("Practitioner", snapshot.practitioners.map((practitioner) => practitioner.id));
    validateUniqueIds("Endpoint", snapshot.endpoints.map((endpoint) => endpoint.id));
    validateUniqueIds("PractitionerRole", snapshot.practitionerRoles.map((role) => role.id));
    validateReferences(snapshot);

    return new ProviderDirectory({
      organizations: snapshot.organizations.map(cloneOrganization),
      practitioners: snapshot.practitioners.map(clonePractitioner),
      practitionerRoles: snapshot.practitionerRoles.map(clonePractitionerRole),
      endpoints: snapshot.endpoints.map(cloneEndpoint),
      generatedAt: snapshot.generatedAt
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
    type: input.type,
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
    status: input.status,
    connectionType: input.connectionType,
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
    periodStart: normalizeOptional(input.periodStart),
    periodEnd: normalizeOptional(input.periodEnd),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
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
    system: telecom.system,
    value: normalizeRequired(telecom.value, "Thông tin liên hệ không được để trống."),
    use: telecom.use
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
