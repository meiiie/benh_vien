import { DomainError } from "../shared/domain-error.js";
import { consentCategories, consentStatuses } from "./consent.types.js";
import type { ConsentCategory, ConsentStatus } from "./consent.types.js";

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

  return normalizeDate(date, message);
}

export function normalizeDate(value: Date, message: string): Date {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }

  return value;
}

export function assertValidPeriod(validFrom: Date, validUntil: Date | undefined): void {
  if (validUntil && validUntil <= validFrom) {
    throw new DomainError("Thời điểm hết hiệu lực consent phải sau thời điểm bắt đầu.");
  }
}

export function assertPersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt < createdAt) {
    throw new DomainError("Thời điểm cập nhật consent không được trước thời điểm tạo consent.");
  }
}

export function assertRevocationWithinPeriod(
  validFrom: Date,
  validUntil: Date | undefined,
  revokedAt: Date
): void {
  if (revokedAt < validFrom) {
    throw new DomainError("Thời điểm thu hồi consent không được trước thời điểm bắt đầu hiệu lực.");
  }

  if (validUntil && revokedAt > validUntil) {
    throw new DomainError("Thời điểm thu hồi consent không được sau thời điểm hết hiệu lực.");
  }
}

export function assertValidStatus(status: ConsentStatus): void {
  if (!consentStatuses.has(status)) {
    throw new DomainError("Trạng thái consent không hợp lệ.");
  }
}

export function assertValidCategory(category: ConsentCategory): void {
  if (!consentCategories.has(category)) {
    throw new DomainError("Loại consent không hợp lệ.");
  }
}
