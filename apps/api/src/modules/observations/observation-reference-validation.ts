import type { EncounterRepository } from "@benh-vien-so/domain";
import { validatePatientOwnedReference } from "../clinical-references/patient-owned-reference-validation.js";

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
  return validatePatientOwnedReference(patientId, {
    id: input.encounterId,
    repository: repositories.encounterRepository,
    error: "ENCOUNTER_MISMATCH",
    message: "Kết quả quan sát phải gắn với lượt khám thuộc cùng bệnh nhân."
  });
}
