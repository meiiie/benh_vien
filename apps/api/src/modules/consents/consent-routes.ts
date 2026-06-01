import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerConsentCommandRoutes } from "./consent-command-routes.js";
import { registerConsentCreationRoutes } from "./consent-creation-routes.js";
import { registerConsentFhirRoutes } from "./consent-fhir-routes.js";
import { registerConsentQueryRoutes } from "./consent-query-routes.js";

export async function registerConsentRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerConsentQueryRoutes(
    app,
    patientRepository,
    consentRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerConsentCreationRoutes(
    app,
    patientRepository,
    consentRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerConsentCommandRoutes(
    app,
    patientRepository,
    consentRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerConsentFhirRoutes(
    app,
    patientRepository,
    consentRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
