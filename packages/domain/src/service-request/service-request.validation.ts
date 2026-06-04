import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";
import {
  serviceRequestCategories,
  serviceRequestIntents,
  serviceRequestPriorities,
  serviceRequestStatuses
} from "./service-request.types.js";
import type {
  ServiceRequestCategory,
  ServiceRequestCode,
  ServiceRequestIntent,
  ServiceRequestPriority,
  ServiceRequestStatus
} from "./service-request.types.js";

export {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";

export function normalizeCode(value: ServiceRequestCode): ServiceRequestCode {
  return {
    system: normalizeRequired(value.system, "Hệ mã dịch vụ không được để trống."),
    code: normalizeRequired(value.code, "Mã dịch vụ không được để trống."),
    display: normalizeRequired(value.display, "Tên dịch vụ không được để trống.")
  };
}

export function normalizeStatus(value: ServiceRequestStatus): ServiceRequestStatus {
  if (!serviceRequestStatuses.has(value)) {
    throw new DomainError("Trạng thái chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

export function normalizeIntent(value: ServiceRequestIntent): ServiceRequestIntent {
  if (!serviceRequestIntents.has(value)) {
    throw new DomainError("Mục đích chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: ServiceRequestCategory): ServiceRequestCategory {
  if (!serviceRequestCategories.has(value)) {
    throw new DomainError("Nhóm chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

export function normalizePriority(value: ServiceRequestPriority): ServiceRequestPriority {
  if (!serviceRequestPriorities.has(value)) {
    throw new DomainError("Mức ưu tiên chỉ định dịch vụ không hợp lệ.");
  }

  return value;
}

export function validateTimeline(input: {
  readonly authoredOn: Date;
  readonly occurrenceAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}): void {
  if (input.occurrenceAt && input.occurrenceAt < input.authoredOn) {
    throw new DomainError("Thời điểm dự kiến thực hiện không được trước thời điểm chỉ định dịch vụ.");
  }

  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật chỉ định dịch vụ không được trước thời điểm tạo chỉ định.");
  }
}
