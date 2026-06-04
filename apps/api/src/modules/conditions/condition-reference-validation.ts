import type { EncounterRepository } from "@benh-vien-so/domain";
import { validatePatientOwnedReference } from "../clinical-references/patient-owned-reference-validation.js";

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
  return validatePatientOwnedReference(patientId, {
    id: input.encounterId,
    repository: repositories.encounterRepository,
    error: "ENCOUNTER_MISMATCH",
    message: "Chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
  });
}
