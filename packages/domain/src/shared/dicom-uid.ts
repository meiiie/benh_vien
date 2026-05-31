import { DomainError } from "./domain-error.js";

const dicomUidPattern = /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))*$/;
const maxDicomUidLength = 64;

export function normalizeDicomUid(value: string, message: string): string {
  const normalized = value.trim();

  if (
    !normalized ||
    normalized.length > maxDicomUidLength ||
    !dicomUidPattern.test(normalized)
  ) {
    throw new DomainError(message);
  }

  return normalized;
}
