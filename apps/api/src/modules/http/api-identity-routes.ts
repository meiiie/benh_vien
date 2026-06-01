import type { FastifyInstance } from "fastify";
import { registerAuthRoutes } from "../auth/auth-routes.js";
import { registerPatientRoutes } from "../patients/patient-routes.js";
import { registerProviderDirectoryRoutes } from "../provider-directory/provider-directory-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiIdentityRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerAuthRoutes(api, {
    auditRepository: dependencies.auditEventRepository,
    loginRateLimiter: dependencies.loginRateLimiter
  });
  await registerPatientRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.allergyIntoleranceRepository,
    dependencies.clinicalDocumentRepository,
    dependencies.conditionRepository,
    dependencies.observationRepository,
    dependencies.medicationRequestRepository,
    dependencies.medicationDispenseRepository,
    dependencies.medicationAdministrationRepository,
    dependencies.serviceRequestRepository,
    dependencies.diagnosticReportRepository,
    dependencies.imagingStudyRepository,
    dependencies.providerDirectoryRepository,
    dependencies.workflowTaskRepository,
    dependencies.procedureRepository,
    dependencies.consentRepository,
    dependencies.auditEventRepository
  );
  await registerProviderDirectoryRoutes(
    api,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
