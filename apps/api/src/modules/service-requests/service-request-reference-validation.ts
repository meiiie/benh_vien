import type { ConditionRepository, EncounterRepository } from "@benh-vien-so/domain";
import { validatePatientOwnedReferences } from "../clinical-references/patient-owned-reference-validation.js";

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
  return validatePatientOwnedReferences(patientId, [
    {
      id: input.encounterId,
      repository: repositories.encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Chỉ định dịch vụ phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: input.reasonConditionId,
      repository: repositories.conditionRepository,
      error: "CONDITION_MISMATCH",
      message: "Chẩn đoán liên quan phải thuộc cùng bệnh nhân."
    }
  ]);
}
