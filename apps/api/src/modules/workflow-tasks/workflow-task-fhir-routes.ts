import type { FastifyInstance } from "fastify";
import { WorkflowTaskIdParamsSchema } from "@benh-vien-so/contracts";
import { mapWorkflowTaskToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadWorkflowTaskForPatientAccess } from "./workflow-task-route-helpers.js";

export async function registerWorkflowTaskFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  taskRepository: WorkflowTaskRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/workflow-tasks/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:fhir-export");

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
      action: "workflow-task.fhir-export",
      resourceType: "Task",
      resourceId: task.id,
      patientId: task.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Task"
      }
    });

    return mapWorkflowTaskToFhir(task);
  });
}
