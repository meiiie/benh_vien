import type { FastifyReply } from "fastify";
import type { ProviderDirectoryResourceType } from "@benh-vien-so/contracts";
import {
  mapProviderEndpointToFhir,
  mapProviderOrganizationToFhir,
  mapProviderPractitionerRoleToFhir,
  mapProviderPractitionerToFhir
} from "@benh-vien-so/domain";
import type {
  ProviderDirectorySnapshot,
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "@benh-vien-so/domain";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export type ProviderDirectoryResource =
  | ProviderOrganizationSnapshot
  | ProviderPractitionerSnapshot
  | ProviderPractitionerRoleSnapshot
  | ProviderEndpointSnapshot;

export function toProviderDirectorySummaryMetadata(
  snapshot: ProviderDirectorySnapshot
): {
  readonly organizationCount: number;
  readonly practitionerCount: number;
  readonly practitionerRoleCount: number;
  readonly endpointCount: number;
} {
  return {
    organizationCount: snapshot.organizations.length,
    practitionerCount: snapshot.practitioners.length,
    practitionerRoleCount: snapshot.practitionerRoles.length,
    endpointCount: snapshot.endpoints.length
  };
}

export function findProviderDirectoryResource(
  snapshot: ProviderDirectorySnapshot,
  resourceType: ProviderDirectoryResourceType,
  id: string
): ProviderDirectoryResource | undefined {
  if (resourceType === "Organization") {
    return snapshot.organizations.find((organization) => organization.id === id);
  }

  if (resourceType === "Practitioner") {
    return snapshot.practitioners.find((practitioner) => practitioner.id === id);
  }

  if (resourceType === "PractitionerRole") {
    return snapshot.practitionerRoles.find((role) => role.id === id);
  }

  return snapshot.endpoints.find((endpoint) => endpoint.id === id);
}

export function mapProviderDirectoryResourceToFhir(
  resourceType: ProviderDirectoryResourceType,
  resource: ProviderDirectoryResource
) {
  if (resourceType === "Organization") {
    return mapProviderOrganizationToFhir(resource as ProviderOrganizationSnapshot);
  }

  if (resourceType === "Practitioner") {
    return mapProviderPractitionerToFhir(resource as ProviderPractitionerSnapshot);
  }

  if (resourceType === "PractitionerRole") {
    return mapProviderPractitionerRoleToFhir(resource as ProviderPractitionerRoleSnapshot);
  }

  return mapProviderEndpointToFhir(resource as ProviderEndpointSnapshot);
}

export function sendProviderDirectoryResourceNotFound(
  reply: FastifyReply,
  resourceType: ProviderDirectoryResourceType,
  id: string
) {
  return sendFhirOperationOutcome(reply, {
    statusCode: 404,
    code: "not-found",
    diagnostics: `${resourceType}/${id} không tồn tại trong Provider Directory.`,
    expression: [`${resourceType}.id`],
    details: {
      code: "PROVIDER_DIRECTORY_RESOURCE_NOT_FOUND",
      display: "Provider directory resource not found",
      text: "Không tìm thấy tài nguyên danh bạ cơ sở y tế cần xuất FHIR."
    }
  });
}
