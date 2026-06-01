import { DomainError } from "../shared/domain-error.js";
import {
  assertPersistenceTimeline,
  normalizeCoding,
  normalizeEndpointConnectionType,
  normalizeEndpointStatus,
  normalizeIdentifier,
  normalizeOptional,
  normalizeOrganizationType,
  normalizeRequired,
  normalizeRolePeriod,
  normalizeTelecom,
  normalizeTextList,
  parseDate
} from "./provider-directory.primitives.js";
import type {
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "./provider-directory.types.js";

export function normalizeOrganization(
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

export function normalizePractitioner(
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

export function normalizeEndpoint(
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

export function normalizePractitionerRole(
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

export function normalizePersistedOrganization(
  snapshot: ProviderOrganizationSnapshot
): ProviderOrganizationSnapshot {
  const createdAt = parseDate(snapshot.createdAt, "createdAt của Organization không hợp lệ.");
  const updatedAt = parseDate(snapshot.updatedAt, "updatedAt của Organization không hợp lệ.");
  assertPersistenceTimeline(createdAt, updatedAt, "Organization");

  return {
    ...normalizeOrganization(
      snapshot,
      createdAt
    ),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString()
  };
}

export function normalizePersistedPractitioner(
  snapshot: ProviderPractitionerSnapshot
): ProviderPractitionerSnapshot {
  const createdAt = parseDate(snapshot.createdAt, "createdAt của Practitioner không hợp lệ.");
  const updatedAt = parseDate(snapshot.updatedAt, "updatedAt của Practitioner không hợp lệ.");
  assertPersistenceTimeline(createdAt, updatedAt, "Practitioner");

  return {
    ...normalizePractitioner(
      snapshot,
      createdAt
    ),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString()
  };
}

export function normalizePersistedEndpoint(snapshot: ProviderEndpointSnapshot): ProviderEndpointSnapshot {
  const createdAt = parseDate(snapshot.createdAt, "createdAt của Endpoint không hợp lệ.");
  const updatedAt = parseDate(snapshot.updatedAt, "updatedAt của Endpoint không hợp lệ.");
  assertPersistenceTimeline(createdAt, updatedAt, "Endpoint");

  return {
    ...normalizeEndpoint(
      snapshot,
      createdAt
    ),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString()
  };
}

export function normalizePersistedPractitionerRole(
  snapshot: ProviderPractitionerRoleSnapshot
): ProviderPractitionerRoleSnapshot {
  const createdAt = parseDate(snapshot.createdAt, "createdAt của PractitionerRole không hợp lệ.");
  const updatedAt = parseDate(snapshot.updatedAt, "updatedAt của PractitionerRole không hợp lệ.");
  assertPersistenceTimeline(createdAt, updatedAt, "PractitionerRole");

  return {
    ...normalizePractitionerRole(
      snapshot,
      createdAt
    ),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString()
  };
}
