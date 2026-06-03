import type { CreateMedicationDispenseRequest } from "@benh-vien-so/contracts";
import type {
  EncounterRepository,
  MedicationRequestRepository
} from "@benh-vien-so/domain";
import { validatePatientOwnedReferences } from "../clinical-references/patient-owned-reference-validation.js";

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
  return validatePatientOwnedReferences(patientId, [
    {
      id: command.encounterId,
      repository: encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Cấp phát thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: command.medicationRequestId,
      repository: medicationRequestRepository,
      error: "MEDICATION_REQUEST_MISMATCH",
      message:
        "Cấp phát thuốc phải tham chiếu MedicationRequest thuộc cùng bệnh nhân."
    }
  ]);
}
