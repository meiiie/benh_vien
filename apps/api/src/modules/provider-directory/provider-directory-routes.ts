import type { FastifyInstance } from "fastify";
import type { AuditEventRepository, ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { registerProviderDirectoryFhirRoutes } from "./provider-directory-fhir-routes.js";
import { registerProviderDirectoryQueryRoutes } from "./provider-directory-query-routes.js";

export async function registerProviderDirectoryRoutes(
  app: FastifyInstance,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerProviderDirectoryQueryRoutes(
    app,
    providerDirectoryRepository,
    auditRepository
  );
  await registerProviderDirectoryFhirRoutes(
    app,
    providerDirectoryRepository,
    auditRepository
  );
}
