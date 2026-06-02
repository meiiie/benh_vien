import type { FastifyReply } from "fastify";
import type { EncounterRepository } from "@benh-vien-so/domain";

export type ConditionReferenceInput = {
  readonly encounterId?: string;
};

export async function validateConditionReferences(
  reply: FastifyReply,
  patientId: string,
  input: ConditionReferenceInput,
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
      message: "Chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
    });

    return false;
  }

  return true;
}
