import { DomainError } from "../shared/domain-error.js";
import { encounterClasses, encounterStatuses } from "./encounter.types.js";
import type { EncounterClass, EncounterStatus } from "./encounter.types.js";

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

export function normalizeStatus(value: EncounterStatus): EncounterStatus {
  if (!encounterStatuses.has(value)) {
    throw new DomainError("Trạng thái lượt khám không hợp lệ.");
  }

  return value;
}

export function normalizeClass(value: EncounterClass): EncounterClass {
  if (!encounterClasses.has(value)) {
    throw new DomainError("Phân loại lượt khám không hợp lệ.");
  }

  return value;
}

export function validateLifecycle(
  status: EncounterStatus,
  startedAt: Date,
  endedAt: Date | undefined
): void {
  if (endedAt && endedAt < startedAt) {
    throw new DomainError("Thời điểm kết thúc không được trước thời điểm bắt đầu.");
  }

  if (status === "finished" && !endedAt) {
    throw new DomainError("Lượt khám đã hoàn tất phải có thời điểm kết thúc.");
  }

  if ((status === "planned" || status === "in-progress") && endedAt) {
    throw new DomainError("Lượt khám chưa hoàn tất không được có thời điểm kết thúc.");
  }
}

export function validatePersistenceTimeline(createdAt: Date, updatedAt: Date): void {
  if (updatedAt < createdAt) {
    throw new DomainError("Thời điểm cập nhật lượt khám không được trước thời điểm tạo lượt khám.");
  }
}
