import type { CreateClinicalDocumentRequest } from "@benh-vien-so/contracts";
import type { EncounterRepository } from "@benh-vien-so/domain";

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
  if (command.encounterId) {
    const encounter = await encounterRepository.findById(command.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Tài liệu phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
