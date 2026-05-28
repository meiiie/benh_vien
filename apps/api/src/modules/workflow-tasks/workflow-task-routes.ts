import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateWorkflowTaskRequestSchema,
  PatientWorkflowTasksParamsSchema,
  WorkflowTaskIdParamsSchema
} from "@benh-vien-so/contracts";
import { DomainError, mapWorkflowTaskToFhir, WorkflowTask } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository,
  WorkflowTaskSnapshot
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerWorkflowTaskRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  taskRepository: WorkflowTaskRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/workflow-tasks", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:list");

    if (!actor) {
      return;
    }

    const params = PatientWorkflowTasksParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
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

  app.post("/patients/:patientId/workflow-tasks", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:create");

    if (!actor) {
      return;
    }

    const params = PatientWorkflowTasksParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateWorkflowTaskRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Công việc phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    if (parsed.data.basedOnServiceRequestId) {
      const serviceRequest = await serviceRequestRepository.findById(
        parsed.data.basedOnServiceRequestId
      );

      if (!serviceRequest || serviceRequest.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "SERVICE_REQUEST_MISMATCH",
          message: "Công việc thực thi phải gắn với y lệnh thuộc cùng bệnh nhân."
        });
      }
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
      await recordAuditEvent(auditRepository, request, {
        action: "workflow-task.create",
        resourceType: "Task",
        resourceId: task.id,
        patientId: task.patientId,
        metadata: {
          status: task.toSnapshot().status,
          basedOnServiceRequestId: task.toSnapshot().basedOnServiceRequestId
        }
      });

      return reply.status(201).send(toWorkflowTaskResponse(task));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "WORKFLOW_TASK_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/workflow-tasks/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:read");

    if (!actor) {
      return;
    }

    const params = WorkflowTaskIdParamsSchema.parse(request.params);
    const task = await taskRepository.findById(params.id);

    if (!task) {
      return reply.status(404).send({
        error: "WORKFLOW_TASK_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "workflow-task.read",
      resourceType: "Task",
      resourceId: task.id,
      patientId: task.patientId
    });

    return toWorkflowTaskResponse(task);
  });

  app.get("/workflow-tasks/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "workflow-task:fhir-export");

    if (!actor) {
      return;
    }

    const params = WorkflowTaskIdParamsSchema.parse(request.params);
    const task = await taskRepository.findById(params.id);

    if (!task) {
      return reply.status(404).send({
        error: "WORKFLOW_TASK_NOT_FOUND"
      });
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

function toWorkflowTaskResponse(task: WorkflowTask): WorkflowTaskSnapshot {
  return task.toSnapshot();
}
