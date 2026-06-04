import type { FastifyInstance } from "fastify";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { registerAuditEventFhirRoutes } from "./audit-event-fhir-routes.js";
import { registerAuditEventIntegrityRoutes } from "./audit-event-integrity-routes.js";
import { registerAuditEventQueryRoutes } from "./audit-event-query-routes.js";

export async function registerAuditEventRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerAuditEventQueryRoutes(
    app,
    patientRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerAuditEventIntegrityRoutes(
    app,
    patientRepository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerAuditEventFhirRoutes(
    app,
    patientRepository,
    providerDirectoryRepository,
    auditRepository
  );
}
