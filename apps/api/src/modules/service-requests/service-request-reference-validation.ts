import type { ConditionRepository, EncounterRepository } from "@benh-vien-so/domain";

export type ServiceRequestReferenceInput = {
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
};

export type ServiceRequestValidationError = {
  readonly error: string;
  readonly message: string;
};

export async function validateServiceRequestReferences(
  patientId: string,
  input: ServiceRequestReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly conditionRepository: ConditionRepository;
  }
): Promise<ServiceRequestValidationError | undefined> {
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Chỉ định dịch vụ phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  if (input.reasonConditionId) {
    const condition = await repositories.conditionRepository.findById(
      input.reasonConditionId
    );

    if (!condition || condition.patientId !== patientId) {
      return {
        error: "CONDITION_MISMATCH",
        message: "Chẩn đoán liên quan phải thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
