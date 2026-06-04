import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository,
} from "@benh-vien-so/domain";
import { registerWorkflowTaskCreationRoutes } from "./workflow-task-creation-routes.js";
import { registerWorkflowTaskFhirRoutes } from "./workflow-task-fhir-routes.js";
import { registerWorkflowTaskQueryRoutes } from "./workflow-task-query-routes.js";

export async function registerWorkflowTaskRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  taskRepository: WorkflowTaskRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerWorkflowTaskQueryRoutes(
    app,
    patientRepository,
    taskRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerWorkflowTaskCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    serviceRequestRepository,
    taskRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerWorkflowTaskFhirRoutes(
    app,
    patientRepository,
    taskRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
