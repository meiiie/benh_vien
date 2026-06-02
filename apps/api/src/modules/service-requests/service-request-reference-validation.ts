import type { FastifyReply } from "fastify";
import type { ConditionRepository, EncounterRepository } from "@benh-vien-so/domain";

export type ServiceRequestReferenceInput = {
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
};

export async function validateServiceRequestReferences(
  reply: FastifyReply,
  patientId: string,
  input: ServiceRequestReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly conditionRepository: ConditionRepository;
  }
): Promise<boolean> {
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      reply.status(422).send({
        error: "ENCOUNTER_MISMATCH",
        message: "Chỉ định dịch vụ phải gắn với lượt khám thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  if (input.reasonConditionId) {
    const condition = await repositories.conditionRepository.findById(
      input.reasonConditionId
    );

    if (!condition || condition.patientId !== patientId) {
      reply.status(422).send({
        error: "CONDITION_MISMATCH",
        message: "Chẩn đoán liên quan phải thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  return true;
}
