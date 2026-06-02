import type { CreateMedicationDispenseRequest } from "@benh-vien-so/contracts";
import type {
  EncounterRepository,
  MedicationRequestRepository
} from "@benh-vien-so/domain";

export type MedicationDispenseValidationError = {
  readonly error: string;
  readonly message: string;
};

type ValidateMedicationDispenseReferencesInput = {
  readonly patientId: string;
  readonly command: CreateMedicationDispenseRequest;
  readonly encounterRepository: EncounterRepository;
  readonly medicationRequestRepository: MedicationRequestRepository;
};

export async function validateMedicationDispenseReferences({
  patientId,
  command,
  encounterRepository,
  medicationRequestRepository
}: ValidateMedicationDispenseReferencesInput): Promise<
  MedicationDispenseValidationError | undefined
> {
  if (command.encounterId) {
    const encounter = await encounterRepository.findById(command.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Cấp phát thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
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
          "Cấp phát thuốc phải tham chiếu MedicationRequest thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
