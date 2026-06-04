import type { EncounterRepository } from "@benh-vien-so/domain";
import { validatePatientOwnedReference } from "../clinical-references/patient-owned-reference-validation.js";

export type AllergyIntoleranceReferenceInput = {
  readonly encounterId?: string;
};

export type AllergyIntoleranceValidationError = {
  readonly error: string;
  readonly message: string;
};

export async function validateAllergyIntoleranceReferences(
  patientId: string,
  input: AllergyIntoleranceReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
  }
): Promise<AllergyIntoleranceValidationError | undefined> {
  return validatePatientOwnedReference(patientId, {
    id: input.encounterId,
    repository: repositories.encounterRepository,
    error: "ENCOUNTER_MISMATCH",
    message: "Dị ứng phải gắn với lượt khám thuộc cùng bệnh nhân."
  });
}
