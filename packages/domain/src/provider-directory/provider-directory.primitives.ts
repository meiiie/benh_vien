import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate
} from "../shared/normalization.js";
import {
  providerEndpointConnectionTypes,
  providerEndpointStatuses,
  providerOrganizationTypes,
  providerTelecomSystems,
  providerTelecomUses
} from "./provider-directory.types.js";
import type {
  ProviderCoding,
  ProviderEndpointConnectionType,
  ProviderEndpointStatus,
  ProviderIdentifier,
  ProviderOrganizationType,
  ProviderPractitionerRoleSnapshot,
  ProviderTelecom
} from "./provider-directory.types.js";

export {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired
} from "../shared/normalization.js";

export function normalizeIdentifier(identifier: ProviderIdentifier): ProviderIdentifier {
  return {
    system: normalizeRequired(identifier.system, "Identifier.system không được để trống."),
    value: normalizeRequired(identifier.value, "Identifier.value không được để trống."),
    type: normalizeOptional(identifier.type)
  };
}

export function normalizeTelecom(telecom: ProviderTelecom): ProviderTelecom {
  return {
    system: normalizeTelecomSystem(telecom.system),
    value: normalizeRequired(telecom.value, "Thông tin liên hệ không được để trống."),
    use: telecom.use ? normalizeTelecomUse(telecom.use) : undefined
  };
}

export function normalizeCoding(coding: ProviderCoding): ProviderCoding {
  return {
    system: normalizeRequired(coding.system, "Coding.system không được để trống."),
    code: normalizeRequired(coding.code, "Coding.code không được để trống."),
    display: normalizeRequired(coding.display, "Coding.display không được để trống.")
  };
}

export function normalizeTextList(values: readonly string[] | undefined): string[] | undefined {
  const normalized = values?.map((value) => normalizeOptional(value)).filter(Boolean) as
    | string[]
    | undefined;

  return normalized && normalized.length > 0 ? normalized : undefined;
}

export function normalizeOrganizationType(type: ProviderOrganizationType): ProviderOrganizationType {
  if (!providerOrganizationTypes.has(type)) {
    throw new DomainError("Loại cơ sở y tế trong Provider Directory không hợp lệ.");
  }

  return type;
}

export function normalizeEndpointStatus(status: ProviderEndpointStatus): ProviderEndpointStatus {
  if (!providerEndpointStatuses.has(status)) {
    throw new DomainError("Trạng thái Endpoint trong Provider Directory không hợp lệ.");
  }

  return status;
}

export function normalizeEndpointConnectionType(
  connectionType: ProviderEndpointConnectionType
): ProviderEndpointConnectionType {
  if (!providerEndpointConnectionTypes.has(connectionType)) {
    throw new DomainError("Loại kết nối Endpoint trong Provider Directory không hợp lệ.");
  }

  return connectionType;
}

export function normalizeTimestamp(value: string, message: string): string {
  return parseDate(value, message).toISOString();
}

export function assertPersistenceTimeline(createdAt: Date, updatedAt: Date, resourceType: string): void {
  if (updatedAt < createdAt) {
    throw new DomainError(`${resourceType} có updatedAt trước createdAt.`);
  }
}

export function parseDate(value: string, message: string): Date {
  return parseRequiredDate(normalizeRequired(value, message), message);
}

export function assertValidDate(value: Date, message: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }
}

export function normalizeRolePeriod(
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

function normalizeTelecomSystem(system: ProviderTelecom["system"]): ProviderTelecom["system"] {
  if (!providerTelecomSystems.has(system)) {
    throw new DomainError("Hệ thống liên hệ trong Provider Directory không hợp lệ.");
  }

  return system;
}

function normalizeTelecomUse(use: NonNullable<ProviderTelecom["use"]>): NonNullable<ProviderTelecom["use"]> {
  if (!providerTelecomUses.has(use)) {
    throw new DomainError("Mục đích liên hệ trong Provider Directory không hợp lệ.");
  }

  return use;
}
