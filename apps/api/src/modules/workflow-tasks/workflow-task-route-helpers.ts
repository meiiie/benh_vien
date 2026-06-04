import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  PatientRepository,
  ProviderDirectoryRepository,
  WorkflowTask,
  WorkflowTaskRepository,
  WorkflowTaskSnapshot
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";

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
    sendNotFoundErrorResponse(reply, "WORKFLOW_TASK_NOT_FOUND");

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
  return sendDomainErrorResponse(reply, error, "WORKFLOW_TASK_DOMAIN_ERROR");
}
