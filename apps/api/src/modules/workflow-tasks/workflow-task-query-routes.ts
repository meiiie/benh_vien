import type { FastifyInstance } from "fastify";
import {
  PatientWorkflowTasksParamsSchema,
  WorkflowTaskIdParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadWorkflowTaskForPatientAccess,
  toWorkflowTaskResponse
} from "./workflow-task-route-helpers.js";

export async function registerWorkflowTaskQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  taskRepository: WorkflowTaskRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/workflow-tasks", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:list");

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

    const tasks = await taskRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "workflow-task.list",
      resourceType: "Task",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: tasks.length
      }
    });

    return {
      items: tasks.map(toWorkflowTaskResponse)
    };
  });

  app.get("/workflow-tasks/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:read");

    if (!actor) {
      return;
    }

    const params = WorkflowTaskIdParamsSchema.parse(request.params);
    const task = await loadWorkflowTaskForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      taskRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!task) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "workflow-task.read",
      resourceType: "Task",
      resourceId: task.id,
      patientId: task.patientId
    });

    return toWorkflowTaskResponse(task);
  });
}
