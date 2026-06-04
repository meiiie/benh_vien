import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  ConditionRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  PatientRepository,
  ProcedureRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { registerProcedureCreationRoutes } from "./procedure-creation-routes.js";
import { registerProcedureFhirRoutes } from "./procedure-fhir-routes.js";
import { registerProcedureQueryRoutes } from "./procedure-query-routes.js";

export async function registerProcedureRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  clinicalDocumentRepository: ClinicalDocumentRepository,
  procedureRepository: ProcedureRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerProcedureQueryRoutes(
    app,
    patientRepository,
    procedureRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerProcedureCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    conditionRepository,
    serviceRequestRepository,
    diagnosticReportRepository,
    clinicalDocumentRepository,
    procedureRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerProcedureFhirRoutes(
    app,
    patientRepository,
    procedureRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
