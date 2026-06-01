import type { FastifyInstance } from "fastify";
import { registerDiagnosticReportRoutes } from "../diagnostic-reports/diagnostic-report-routes.js";
import { registerImagingStudyRoutes } from "../imaging-studies/imaging-study-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiDiagnosticRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerDiagnosticReportRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.serviceRequestRepository,
    dependencies.observationRepository,
    dependencies.diagnosticReportRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
  await registerImagingStudyRoutes(
    api,
    dependencies.patientRepository,
    dependencies.encounterRepository,
    dependencies.serviceRequestRepository,
    dependencies.diagnosticReportRepository,
    dependencies.imagingStudyRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
