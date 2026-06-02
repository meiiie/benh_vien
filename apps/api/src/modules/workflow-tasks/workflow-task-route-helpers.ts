import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  PatientRepository,
  ProviderDirectoryRepository,
  WorkflowTask,
  WorkflowTaskRepository,
  WorkflowTaskSnapshot
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

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
