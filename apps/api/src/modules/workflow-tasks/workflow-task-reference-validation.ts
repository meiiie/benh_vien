import type { FastifyReply } from "fastify";
import type { EncounterRepository, ServiceRequestRepository } from "@benh-vien-so/domain";

export type WorkflowTaskReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
};

export async function validateWorkflowTaskReferences(
  reply: FastifyReply,
  patientId: string,
  input: WorkflowTaskReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly serviceRequestRepository: ServiceRequestRepository;
  }
): Promise<boolean> {
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      reply.status(422).send({
        error: "ENCOUNTER_MISMATCH",
        message: "Công việc phải gắn với lượt khám thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  if (input.basedOnServiceRequestId) {
    const serviceRequest = await repositories.serviceRequestRepository.findById(
      input.basedOnServiceRequestId
    );

    if (!serviceRequest || serviceRequest.patientId !== patientId) {
      reply.status(422).send({
        error: "SERVICE_REQUEST_MISMATCH",
        message: "Công việc thực thi phải gắn với y lệnh thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  return true;
}
