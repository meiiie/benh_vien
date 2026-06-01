import type { FastifyInstance } from "fastify";
import type { AuditEventRepository, ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { toProviderDirectorySummaryMetadata } from "./provider-directory-route-helpers.js";

export async function registerProviderDirectoryQueryRoutes(
  app: FastifyInstance,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/provider-directory", async (request, reply) => {
    const actor = requirePermission(request, reply, "provider-directory:read");

    if (!actor) {
      return;
    }

    const directory = await providerDirectoryRepository.findDirectory();
    const snapshot = directory.toSnapshot();

    await recordAuditEvent(auditRepository, request, {
      action: "provider-directory.read",
      resourceType: "ProviderDirectory",
      resourceId: "default",
      metadata: toProviderDirectorySummaryMetadata(snapshot)
    });

    return snapshot;
  });
}
