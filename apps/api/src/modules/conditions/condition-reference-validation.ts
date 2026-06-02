import type { EncounterRepository } from "@benh-vien-so/domain";

export type ConditionReferenceInput = {
  readonly encounterId?: string;
};

export type ConditionValidationError = {
  readonly error: string;
  readonly message: string;
};

export async function validateConditionReferences(
  patientId: string,
  input: ConditionReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
  }
): Promise<ConditionValidationError | undefined> {
  if (!input.encounterId) {
    return undefined;
  }

  const encounter = await repositories.encounterRepository.findById(input.encounterId);

  if (!encounter || encounter.patientId !== patientId) {
    return {
      error: "ENCOUNTER_MISMATCH",
      message: "Chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
    };
  }

  return undefined;
}
