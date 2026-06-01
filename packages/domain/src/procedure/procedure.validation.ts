import { DomainError } from "../shared/domain-error.js";
import {
  procedureCategories,
  procedurePerformerActorTypes,
  procedureReportReferenceResourceTypes,
  procedureStatuses
} from "./procedure.types.js";
import type { ProcedureCategory, ProcedureCoding, ProcedurePerformedPeriod, ProcedurePerformer, ProcedurePerformerActorType, ProcedureReportReference, ProcedureStatus } from "./procedure.types.js";

export function normalizeRequiredCoding(code: ProcedureCoding): ProcedureCoding {
  return {
    system: normalizeRequired(code.system, "Hệ mã thủ thuật không được để trống."),
    code: normalizeRequired(code.code, "Mã thủ thuật không được để trống."),
    display: normalizeRequired(code.display, "Tên thủ thuật không được để trống.")
  };
}

export function normalizeCoding(code: ProcedureCoding | undefined): ProcedureCoding | undefined {
  return code ? normalizeRequiredCoding(code) : undefined;
}

export function normalizePerformedPeriod(
  period: ProcedurePerformedPeriod | undefined
): ProcedurePerformedPeriod | undefined {
  if (!period?.start && !period?.end) {
    return undefined;
  }

  const start = period.start
    ? parseDate(period.start, "Thời điểm bắt đầu thủ thuật không hợp lệ.").toISOString()
    : undefined;
  const end = period.end
    ? parseDate(period.end, "Thời điểm kết thúc thủ thuật không hợp lệ.").toISOString()
    : undefined;

  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    throw new DomainError("Thời điểm kết thúc thủ thuật không được trước thời điểm bắt đầu.");
  }

  return { start, end };
}

export function normalizePerformers(
  performers: readonly ProcedurePerformer[] | undefined
): readonly ProcedurePerformer[] {
  const normalized = new Map<string, ProcedurePerformer>();

  for (const performer of performers ?? []) {
    const actorType = normalizePerformerActorType(performer.actorType);
    const actorId = normalizeRequired(performer.actorId, "Người hoặc đơn vị thực hiện thủ thuật không được để trống.");
    normalized.set(`${actorType}/${actorId}`, {
      actorType,
      actorId,
      function: normalizeCoding(performer.function),
      onBehalfOfOrganizationId: normalizeOptional(performer.onBehalfOfOrganizationId)
    });
  }

  return [...normalized.values()];
}

export function normalizeReportReferences(
  references: readonly ProcedureReportReference[] | undefined
): readonly ProcedureReportReference[] {
  const normalized = new Map<string, ProcedureReportReference>();

  for (const reference of references ?? []) {
    const resourceType = normalizeReportReferenceResourceType(reference.resourceType);
    const id = normalizeRequired(reference.id, "Báo cáo liên quan thủ thuật không được để trống.");
    normalized.set(`${resourceType}/${id}`, {
      resourceType,
      id
    });
  }

  return [...normalized.values()];
}

export function assertProcedureLifecycle(
  status: ProcedureStatus,
  performedPeriod: ProcedurePerformedPeriod | undefined,
  performers: readonly ProcedurePerformer[]
): void {
  if (status === "completed" && !performedPeriod?.start && !performedPeriod?.end) {
    throw new DomainError("Thủ thuật đã hoàn tất cần có thời điểm thực hiện để truy vết.");
  }

  if (status === "completed" && performers.length === 0) {
    throw new DomainError("Thủ thuật đã hoàn tất cần có tối thiểu một người hoặc đơn vị thực hiện.");
  }
}

export function validateSelfReference(id: string, partOfProcedureId: string | undefined): void {
  const normalizedPartOfProcedureId = normalizeOptional(partOfProcedureId);

  if (normalizedPartOfProcedureId && normalizedPartOfProcedureId === id) {
    throw new DomainError("Thủ thuật không được là một phần của chính nó.");
  }
}

export function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt < createdAt) {
    throw new DomainError("Thời điểm cập nhật thủ thuật không được trước thời điểm tạo thủ thuật.");
  }
}

export function normalizeStatus(value: ProcedureStatus): ProcedureStatus {
  if (!procedureStatuses.has(value)) {
    throw new DomainError("Trạng thái thủ thuật không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: ProcedureCategory): ProcedureCategory {
  if (!procedureCategories.has(value)) {
    throw new DomainError("Nhóm thủ thuật không hợp lệ.");
  }

  return value;
}

export function normalizeRequired(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

export function normalizeOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

export function parseDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

function normalizePerformerActorType(value: ProcedurePerformerActorType): ProcedurePerformerActorType {
  if (!procedurePerformerActorTypes.has(value)) {
    throw new DomainError("Loại chủ thể thực hiện thủ thuật không hợp lệ.");
  }

  return value;
}

function normalizeReportReferenceResourceType(value: ProcedureReportReference["resourceType"]): ProcedureReportReference["resourceType"] {
  if (!procedureReportReferenceResourceTypes.has(value)) {
    throw new DomainError("Loại báo cáo liên quan thủ thuật không hợp lệ.");
  }

  return value;
}
