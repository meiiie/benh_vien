import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerClinicalDocumentCommandRoutes } from "./clinical-document-command-routes.js";
import { registerClinicalDocumentCreationRoutes } from "./clinical-document-creation-routes.js";
import { registerClinicalDocumentFhirRoutes } from "./clinical-document-fhir-routes.js";
import { registerClinicalDocumentQueryRoutes } from "./clinical-document-query-routes.js";

export async function registerClinicalDocumentRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  documentRepository: ClinicalDocumentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerClinicalDocumentQueryRoutes(
    app,
    patientRepository,
    documentRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerClinicalDocumentCreationRoutes(
    app,
    patientRepository,
    encounterRepository,
    documentRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerClinicalDocumentCommandRoutes(
    app,
    patientRepository,
    documentRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerClinicalDocumentFhirRoutes(
    app,
    patientRepository,
    documentRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
