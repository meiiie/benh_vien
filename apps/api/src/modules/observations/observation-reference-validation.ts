import type { EncounterRepository } from "@benh-vien-so/domain";

export type ObservationReferenceInput = {
  readonly encounterId?: string;
};

export type ObservationValidationError = {
  readonly error: string;
  readonly message: string;
};

export async function validateObservationReferences(
  patientId: string,
  input: ObservationReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
  }
): Promise<ObservationValidationError | undefined> {
  if (!input.encounterId) {
    return undefined;
  }

  const encounter = await repositories.encounterRepository.findById(input.encounterId);

  if (!encounter || encounter.patientId !== patientId) {
    return {
      error: "ENCOUNTER_MISMATCH",
      message: "Kết quả quan sát phải gắn với lượt khám thuộc cùng bệnh nhân."
    };
  }

  return undefined;
}
