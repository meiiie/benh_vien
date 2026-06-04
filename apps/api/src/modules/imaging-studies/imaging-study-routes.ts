import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ImagingStudyRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { registerImagingStudyCreationRoutes } from "./imaging-study-creation-routes.js";
import { registerImagingStudyFhirRoutes } from "./imaging-study-fhir-routes.js";
import { registerImagingStudyQueryRoutes } from "./imaging-study-query-routes.js";

export async function registerImagingStudyRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  imagingStudyRepository: ImagingStudyRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerImagingStudyQueryRoutes(
    app,
    patientRepository,
    imagingStudyRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerImagingStudyCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    serviceRequestRepository,
    diagnosticReportRepository,
    imagingStudyRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerImagingStudyFhirRoutes(
    app,
    patientRepository,
    imagingStudyRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
