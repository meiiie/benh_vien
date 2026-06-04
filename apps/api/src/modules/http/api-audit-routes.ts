import type { FastifyInstance } from "fastify";
import { registerAuditEventRoutes } from "../audit-events/audit-event-routes.js";
import type { ApiRoutesDependencies } from "./api-route-dependencies.js";

export async function registerApiAuditRoutes(
  api: FastifyInstance,
  dependencies: ApiRoutesDependencies
): Promise<void> {
  await registerAuditEventRoutes(
    api,
    dependencies.patientRepository,
    dependencies.providerDirectoryRepository,
    dependencies.auditEventRepository
  );
}
