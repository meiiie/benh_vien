import type { CreateClinicalDocumentRequest } from "@benh-vien-so/contracts";
import type { EncounterRepository } from "@benh-vien-so/domain";
import { validatePatientOwnedReference } from "../clinical-references/patient-owned-reference-validation.js";

export type ClinicalDocumentValidationError = {
  readonly error: string;
  readonly message: string;
};

type ValidateClinicalDocumentReferencesInput = {
  readonly patientId: string;
  readonly command: CreateClinicalDocumentRequest;
  readonly encounterRepository: EncounterRepository;
};

export async function validateClinicalDocumentReferences({
  patientId,
  command,
  encounterRepository
}: ValidateClinicalDocumentReferencesInput): Promise<
  ClinicalDocumentValidationError | undefined
> {
  return validatePatientOwnedReference(patientId, {
    id: command.encounterId,
    repository: encounterRepository,
    error: "ENCOUNTER_MISMATCH",
    message: "Tài liệu phải gắn với lượt khám thuộc cùng bệnh nhân."
  });
}
