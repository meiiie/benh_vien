import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerClinicalDocumentFhirResourceRoutes } from "./clinical-document-fhir-resource-routes.js";
import { registerClinicalDocumentProvenanceRoutes } from "./clinical-document-provenance-routes.js";

export async function registerClinicalDocumentFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  documentRepository: ClinicalDocumentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerClinicalDocumentFhirResourceRoutes(
    app,
    patientRepository,
    documentRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerClinicalDocumentProvenanceRoutes(
    app,
    patientRepository,
    documentRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
