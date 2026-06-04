import { DomainError } from "../shared/domain-error.js";
import {
  normalizeOptionalText,
  normalizeRequiredText,
  parseRequiredDate
} from "../shared/normalization.js";
import {
  recordTransferBundleTypes,
  recordTransferPriorities,
  recordTransferStatuses
} from "./record-transfer.types.js";
import type {
  RecordTransferBundleType,
  RecordTransferPriority,
  RecordTransferStatus
} from "./record-transfer.types.js";

export function normalizeRequired(value: string, message: string): string {
  return normalizeRequiredText(value, message);
}

export function normalizeOptional(value: string | undefined): string | undefined {
  return normalizeOptionalText(value);
}

export function parseDate(value: string, message: string): Date {
  return parseRequiredDate(value, message);
}

export function normalizeStatus(value: RecordTransferStatus): RecordTransferStatus {
  if (!recordTransferStatuses.has(value)) {
    throw new DomainError("Trạng thái chuyển hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizePriority(value: RecordTransferPriority): RecordTransferPriority {
  if (!recordTransferPriorities.has(value)) {
    throw new DomainError("Mức ưu tiên chuyển hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizeBundleType(value: RecordTransferBundleType): RecordTransferBundleType {
  if (!recordTransferBundleTypes.has(value)) {
    throw new DomainError("Loại FHIR Bundle dùng để chuyển hồ sơ không hợp lệ.");
  }

  return value;
}

export function normalizeRetryCount(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError("Số lần thử gửi lại hồ sơ không hợp lệ.");
  }

  return value;
}
