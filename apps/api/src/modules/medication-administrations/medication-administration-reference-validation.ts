import type { CreateMedicationAdministrationRequest } from "@benh-vien-so/contracts";
import type {
  ConditionRepository,
  EncounterRepository,
  MedicationRequestRepository
} from "@benh-vien-so/domain";

export type MedicationAdministrationValidationError = {
  readonly error: string;
  readonly message: string;
};

type ValidateMedicationAdministrationReferencesInput = {
  readonly patientId: string;
  readonly command: CreateMedicationAdministrationRequest;
  readonly encounterRepository: EncounterRepository;
  readonly medicationRequestRepository: MedicationRequestRepository;
  readonly conditionRepository: ConditionRepository;
};

export async function validateMedicationAdministrationReferences({
  patientId,
  command,
  encounterRepository,
  medicationRequestRepository,
  conditionRepository
}: ValidateMedicationAdministrationReferencesInput): Promise<
  MedicationAdministrationValidationError | undefined
> {
  if (command.encounterId) {
    const encounter = await encounterRepository.findById(command.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Lần dùng thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  if (command.medicationRequestId) {
    const medicationRequest = await medicationRequestRepository.findById(
      command.medicationRequestId
    );

    if (!medicationRequest || medicationRequest.patientId !== patientId) {
      return {
        error: "MEDICATION_REQUEST_MISMATCH",
        message:
          "Lần dùng thuốc phải tham chiếu MedicationRequest thuộc cùng bệnh nhân."
      };
    }
  }

  if (command.reasonConditionId) {
    const condition = await conditionRepository.findById(command.reasonConditionId);

    if (!condition || condition.patientId !== patientId) {
      return {
        error: "CONDITION_MISMATCH",
        message: "Chẩn đoán/lý do dùng thuốc phải thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
