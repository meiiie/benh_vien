import { DomainError } from "./domain-error.js";

export function normalizeRequiredText(value: string, message: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new DomainError(message);
  }

  return normalized;
}

export function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

export function parseRequiredDate(value: string, message: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new DomainError(message);
  }

  return date;
}

export function normalizePositiveNumber(
  value: number | undefined,
  message: string
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainError(message);
  }

  return value;
}
