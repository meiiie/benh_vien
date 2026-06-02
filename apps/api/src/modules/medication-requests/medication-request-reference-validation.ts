import type { CreateMedicationRequestRequest } from "@benh-vien-so/contracts";
import type { ConditionRepository, EncounterRepository } from "@benh-vien-so/domain";

export type MedicationRequestValidationError = {
  readonly error: string;
  readonly message: string;
};

type ValidateMedicationRequestReferencesInput = {
  readonly patientId: string;
  readonly command: CreateMedicationRequestRequest;
  readonly encounterRepository: EncounterRepository;
  readonly conditionRepository: ConditionRepository;
};

export async function validateMedicationRequestReferences({
  patientId,
  command,
  encounterRepository,
  conditionRepository
}: ValidateMedicationRequestReferencesInput): Promise<
  MedicationRequestValidationError | undefined
> {
  if (command.encounterId) {
    const encounter = await encounterRepository.findById(command.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Chỉ định thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  if (command.reasonConditionId) {
    const condition = await conditionRepository.findById(command.reasonConditionId);

    if (!condition || condition.patientId !== patientId) {
      return {
        error: "CONDITION_MISMATCH",
        message: "Chẩn đoán liên quan phải thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
