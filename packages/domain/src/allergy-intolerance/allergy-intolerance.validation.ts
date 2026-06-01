import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";
import {
  allergyCategories,
  allergyClinicalStatuses,
  allergyCriticalities,
  allergyReactionSeverities,
  allergyTypes,
  allergyVerificationStatuses
} from "./allergy-intolerance.types.js";
import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCode,
  AllergyCriticality,
  AllergyReaction,
  AllergyReactionSeverity,
  AllergyType,
  AllergyVerificationStatus
} from "./allergy-intolerance.types.js";

export {
  normalizeOptionalText as normalizeOptional,
  normalizeRequiredText as normalizeRequired,
  parseRequiredDate as parseDate
} from "../shared/normalization.js";

export function normalizeReaction(value: AllergyReaction): AllergyReaction {
  return {
    manifestation: normalizeCode(value.manifestation, "biểu hiện phản ứng"),
    severity: value.severity ? normalizeReactionSeverity(value.severity) : undefined,
    description: normalizeOptional(value.description)
  };
}

export function normalizeCode(value: AllergyCode, label: string): AllergyCode {
  return {
    system: normalizeRequired(value.system, `Hệ mã ${label} không được để trống.`),
    code: normalizeRequired(value.code, `Mã ${label} không được để trống.`),
    display: normalizeRequired(value.display, `Tên ${label} không được để trống.`)
  };
}

export function normalizeClinicalStatus(value: AllergyClinicalStatus): AllergyClinicalStatus {
  if (!allergyClinicalStatuses.has(value)) {
    throw new DomainError("Trạng thái lâm sàng của dị ứng không hợp lệ.");
  }

  return value;
}

export function normalizeVerificationStatus(
  value: AllergyVerificationStatus
): AllergyVerificationStatus {
  if (!allergyVerificationStatuses.has(value)) {
    throw new DomainError("Trạng thái xác minh của dị ứng không hợp lệ.");
  }

  return value;
}

export function normalizeType(value: AllergyType): AllergyType {
  if (!allergyTypes.has(value)) {
    throw new DomainError("Loại dị ứng/không dung nạp không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(value: AllergyCategory): AllergyCategory {
  if (!allergyCategories.has(value)) {
    throw new DomainError("Nhóm dị ứng không hợp lệ.");
  }

  return value;
}

export function normalizeCriticality(value: AllergyCriticality): AllergyCriticality {
  if (!allergyCriticalities.has(value)) {
    throw new DomainError("Mức độ nguy cơ của dị ứng không hợp lệ.");
  }

  return value;
}

export function normalizeReactionSeverity(
  value: AllergyReactionSeverity
): AllergyReactionSeverity {
  if (!allergyReactionSeverities.has(value)) {
    throw new DomainError("Mức độ nặng của phản ứng dị ứng không hợp lệ.");
  }

  return value;
}

export function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt.getTime() < createdAt.getTime()) {
    throw new DomainError("Thời điểm cập nhật dị ứng không được trước thời điểm tạo dị ứng.");
  }
}
