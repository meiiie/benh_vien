import { DomainError } from "../shared/domain-error.js";
import {
  procedureCategories,
  procedurePerformerActorTypes,
  procedureReportReferenceResourceTypes,
  procedureStatuses
} from "./procedure.types.js";
import type {
  ProcedureCategory,
  ProcedurePerformerActorType,
  ProcedureReportReference,
  ProcedureStatus
} from "./procedure.types.js";

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

export function normalizePerformerActorType(
  value: ProcedurePerformerActorType
): ProcedurePerformerActorType {
  if (!procedurePerformerActorTypes.has(value)) {
    throw new DomainError("Loại chủ thể thực hiện thủ thuật không hợp lệ.");
  }

  return value;
}

export function normalizeReportReferenceResourceType(
  value: ProcedureReportReference["resourceType"]
): ProcedureReportReference["resourceType"] {
  if (!procedureReportReferenceResourceTypes.has(value)) {
    throw new DomainError("Loại báo cáo liên quan thủ thuật không hợp lệ.");
  }

  return value;
}
