import type { CreateMedicationAdministrationRequest } from "@benh-vien-so/contracts";
import type {
  ConditionRepository,
  EncounterRepository,
  MedicationRequestRepository
} from "@benh-vien-so/domain";
import { validatePatientOwnedReferences } from "../clinical-references/patient-owned-reference-validation.js";

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
  return validatePatientOwnedReferences(patientId, [
    {
      id: command.encounterId,
      repository: encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Lần dùng thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: command.medicationRequestId,
      repository: medicationRequestRepository,
      error: "MEDICATION_REQUEST_MISMATCH",
      message:
        "Lần dùng thuốc phải tham chiếu MedicationRequest thuộc cùng bệnh nhân."
    },
    {
      id: command.reasonConditionId,
      repository: conditionRepository,
      error: "CONDITION_MISMATCH",
      message: "Chẩn đoán/lý do dùng thuốc phải thuộc cùng bệnh nhân."
    }
  ]);
}
