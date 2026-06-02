import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateWorkflowTaskRequestSchema,
  PatientWorkflowTasksParamsSchema
} from "@benh-vien-so/contracts";
import { WorkflowTask } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  sendWorkflowTaskDomainError,
  toWorkflowTaskResponse
} from "./workflow-task-route-helpers.js";
import { validateWorkflowTaskReferences } from "./workflow-task-reference-validation.js";

export async function registerWorkflowTaskCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  taskRepository: WorkflowTaskRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/workflow-tasks", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:create");

    if (!actor) {
      return;
    }

    const params = PatientWorkflowTasksParamsSchema.parse(request.params);
    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        params.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    const parsed = CreateWorkflowTaskRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateWorkflowTaskReferences(
      params.patientId,
      parsed.data,
      {
        encounterRepository,
        serviceRequestRepository
      }
    );

    if (validationError) {
      return reply.status(422).send(validationError);
    }

    try {
      const task = WorkflowTask.create({
        id: `workflow-task-${nanoid(10)}`,
        patientId: params.patientId,
        inputReferences: [],
        outputReferences: [],
        ...parsed.data
      });

      await taskRepository.save(task);
      const snapshot = task.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "workflow-task.create",
        resourceType: "Task",
        resourceId: task.id,
        patientId: task.patientId,
        metadata: {
          status: snapshot.status,
          basedOnServiceRequestId: snapshot.basedOnServiceRequestId
        }
      });

      return reply.status(201).send(toWorkflowTaskResponse(task));
    } catch (error) {
      if (sendWorkflowTaskDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
