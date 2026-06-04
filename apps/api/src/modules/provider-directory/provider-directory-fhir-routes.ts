import type { FastifyInstance } from "fastify";
import { ProviderDirectoryResourceParamsSchema } from "@benh-vien-so/contracts";
import { mapProviderDirectoryToFhirBundle } from "@benh-vien-so/domain";
import type { AuditEventRepository, ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  findProviderDirectoryResource,
  mapProviderDirectoryResourceToFhir,
  sendProviderDirectoryResourceNotFound
} from "./provider-directory-route-helpers.js";

export async function registerProviderDirectoryFhirRoutes(
  app: FastifyInstance,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/provider-directory/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "provider-directory:fhir-export");

    if (!actor) {
      return;
    }

    const directory = await providerDirectoryRepository.findDirectory();
    const bundle = mapProviderDirectoryToFhirBundle(directory);

    await recordAuditEvent(auditRepository, request, {
      action: "provider-directory.fhir-export",
      resourceType: "ProviderDirectory",
      resourceId: "default",
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Bundle",
        entryCount: bundle.entry.length
      }
    });

    return bundle;
  });

  app.get("/provider-directory/:resourceType/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "provider-directory:fhir-export");

    if (!actor) {
      return;
    }

    const params = ProviderDirectoryResourceParamsSchema.parse(request.params);
    const directory = await providerDirectoryRepository.findDirectory();
    const resource = findProviderDirectoryResource(
      directory.toSnapshot(),
      params.resourceType,
      params.id
    );

    if (!resource) {
      return sendProviderDirectoryResourceNotFound(
        reply,
        params.resourceType,
        params.id
      );
    }

    await recordAuditEvent(auditRepository, request, {
      action: "provider-directory.fhir-export",
      resourceType: "ProviderDirectory",
      resourceId: params.id,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: params.resourceType
      }
    });

    return mapProviderDirectoryResourceToFhir(params.resourceType, resource);
  });
}
