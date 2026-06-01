import type { FastifyInstance } from "fastify";
import { registerProcedureRoutes } from "../procedures/procedure-routes.js";
import { registerServiceRequestRoutes } from "../service-requests/service-request-routes.js";
import { registerWorkflowTaskRoutes } from "../workflow-tasks/workflow-task-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiCareWorkflowRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerServiceRequestRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.conditionRepository,
    dependencies.serviceRequestRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerWorkflowTaskRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.serviceRequestRepository,
    dependencies.workflowTaskRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerProcedureRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.conditionRepository,
    dependencies.serviceRequestRepository,
    dependencies.diagnosticReportRepository,
    dependencies.clinicalDocumentRepository,
    dependencies.procedureRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
