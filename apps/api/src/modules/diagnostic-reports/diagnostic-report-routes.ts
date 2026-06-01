import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ObservationRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { registerDiagnosticReportCreationRoutes } from "./diagnostic-report-creation-routes.js";
import { registerDiagnosticReportFhirRoutes } from "./diagnostic-report-fhir-routes.js";
import { registerDiagnosticReportQueryRoutes } from "./diagnostic-report-query-routes.js";

export async function registerDiagnosticReportRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  observationRepository: ObservationRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerDiagnosticReportQueryRoutes(
    app,
    patientRepository,
    diagnosticReportRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerDiagnosticReportCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    serviceRequestRepository,
    observationRepository,
    diagnosticReportRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerDiagnosticReportFhirRoutes(
    app,
    patientRepository,
    diagnosticReportRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
