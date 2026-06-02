import type { FastifyReply } from "fastify";
import type { EncounterRepository } from "@benh-vien-so/domain";

export type AllergyIntoleranceReferenceInput = {
  readonly encounterId?: string;
};

export async function validateAllergyIntoleranceReferences(
  reply: FastifyReply,
  patientId: string,
  input: AllergyIntoleranceReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
  }
): Promise<boolean> {
  if (!input.encounterId) {
    return true;
  }

  const encounter = await repositories.encounterRepository.findById(input.encounterId);

  if (!encounter || encounter.patientId !== patientId) {
    reply.status(422).send({
      error: "ENCOUNTER_MISMATCH",
      message: "Dị ứng phải gắn với lượt khám thuộc cùng bệnh nhân."
    });

    return false;
  }

  return true;
}
