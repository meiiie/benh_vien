import { PatientIdentifierConflictError } from "@benh-vien-so/domain";
import type { PatientRepository, PatientSnapshot } from "@benh-vien-so/domain";

export async function throwPatientIdentifierConflictIfNeeded(
  error: unknown,
  repository: Pick<PatientRepository, "findByIdentifier">,
  snapshot: PatientSnapshot
): Promise<never> {
  if (isUniqueViolation(error)) {
    const conflict = await findConflictingIdentifier(repository, snapshot);

    throw new PatientIdentifierConflictError(
      conflict ?? {
        existingPatientId: "unknown",
        identifier: snapshot.identifiers[0]
      }
    );
  }

  throw error;
}

async function findConflictingIdentifier(
  repository: Pick<PatientRepository, "findByIdentifier">,
  snapshot: PatientSnapshot
) {
  for (const identifier of snapshot.identifiers) {
    const existing = await repository.findByIdentifier(identifier);

    if (existing && existing.id !== snapshot.id) {
      return {
        existingPatientId: existing.id,
        identifier
      };
    }
  }

  return undefined;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { readonly code?: string }).code === "23505"
  );
}
