import { DomainError } from "./domain-error.js";

export const maxFhirUnsignedInt = 2_147_483_647;

export function normalizeFhirUnsignedInt(value: number, message: string): number {
  if (!Number.isInteger(value) || value < 0 || value > maxFhirUnsignedInt) {
    throw new DomainError(message);
  }

  return value;
}
