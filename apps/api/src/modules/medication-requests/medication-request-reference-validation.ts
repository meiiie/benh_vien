import type { CreateMedicationRequestRequest } from "@benh-vien-so/contracts";
import type { ConditionRepository, EncounterRepository } from "@benh-vien-so/domain";
import { validatePatientOwnedReferences } from "../clinical-references/patient-owned-reference-validation.js";

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
  return validatePatientOwnedReferences(patientId, [
    {
      id: command.encounterId,
      repository: encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Chỉ định thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: command.reasonConditionId,
      repository: conditionRepository,
      error: "CONDITION_MISMATCH",
      message: "Chẩn đoán liên quan phải thuộc cùng bệnh nhân."
    }
  ]);
}
