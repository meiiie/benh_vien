import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTask,
  WorkflowTaskRepository,
  WorkflowTaskSnapshot
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

export type WorkflowTaskReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
};

export function toWorkflowTaskResponse(task: WorkflowTask): WorkflowTaskSnapshot {
  return task.toSnapshot();
}

export async function loadWorkflowTaskForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  taskId: string,
  taskRepository: WorkflowTaskRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<WorkflowTask | undefined> {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    reply.status(404).send({
      error: "WORKFLOW_TASK_NOT_FOUND"
    });

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      task.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return task;
}

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

export function sendWorkflowTaskDomainError(reply: FastifyReply, error: unknown): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: "WORKFLOW_TASK_DOMAIN_ERROR",
    message: error.message
  });

  return true;
}
