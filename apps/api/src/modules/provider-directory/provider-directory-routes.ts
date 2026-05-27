import type { FastifyInstance } from "fastify";
import { ProviderDirectoryResourceParamsSchema } from "@benh-vien-so/contracts";
import {
  mapProviderDirectoryToFhirBundle,
  mapProviderEndpointToFhir,
  mapProviderOrganizationToFhir,
  mapProviderPractitionerRoleToFhir,
  mapProviderPractitionerToFhir
} from "@benh-vien-so/domain";
import type { AuditEventRepository, ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerProviderDirectoryRoutes(
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
      metadata: {
        organizationCount: snapshot.organizations.length,
        practitionerCount: snapshot.practitioners.length,
        practitionerRoleCount: snapshot.practitionerRoles.length,
        endpointCount: snapshot.endpoints.length
      }
    });

    return snapshot;
  });

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
    const snapshot = directory.toSnapshot();

    const resource =
      params.resourceType === "Organization"
        ? snapshot.organizations.find((organization) => organization.id === params.id)
        : params.resourceType === "Practitioner"
          ? snapshot.practitioners.find((practitioner) => practitioner.id === params.id)
          : params.resourceType === "PractitionerRole"
            ? snapshot.practitionerRoles.find((role) => role.id === params.id)
            : snapshot.endpoints.find((endpoint) => endpoint.id === params.id);

    if (!resource) {
      return reply.status(404).send({
        error: "PROVIDER_DIRECTORY_RESOURCE_NOT_FOUND"
      });
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

    if (params.resourceType === "Organization") {
      return mapProviderOrganizationToFhir(resource as (typeof snapshot.organizations)[number]);
    }

    if (params.resourceType === "Practitioner") {
      return mapProviderPractitionerToFhir(resource as (typeof snapshot.practitioners)[number]);
    }

    if (params.resourceType === "PractitionerRole") {
      return mapProviderPractitionerRoleToFhir(
        resource as (typeof snapshot.practitionerRoles)[number]
      );
    }

    return mapProviderEndpointToFhir(resource as (typeof snapshot.endpoints)[number]);
  });
}
