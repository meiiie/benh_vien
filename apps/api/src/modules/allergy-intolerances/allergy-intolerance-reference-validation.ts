import type { EncounterRepository } from "@benh-vien-so/domain";

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
  if (!input.encounterId) {
    return undefined;
  }

  const encounter = await repositories.encounterRepository.findById(input.encounterId);

  if (!encounter || encounter.patientId !== patientId) {
    return {
      error: "ENCOUNTER_MISMATCH",
      message: "Dị ứng phải gắn với lượt khám thuộc cùng bệnh nhân."
    };
  }

  return undefined;
}
