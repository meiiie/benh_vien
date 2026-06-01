import { DomainError } from "../shared/domain-error.js";
import type {
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "./provider-directory.types.js";

export function validateReferences(snapshot: {
  readonly organizations: readonly ProviderOrganizationSnapshot[];
  readonly practitioners: readonly ProviderPractitionerSnapshot[];
  readonly practitionerRoles: readonly ProviderPractitionerRoleSnapshot[];
  readonly endpoints: readonly ProviderEndpointSnapshot[];
}): void {
  const organizationIds = new Set(snapshot.organizations.map((organization) => organization.id));
  const practitionerIds = new Set(snapshot.practitioners.map((practitioner) => practitioner.id));
  const endpointIds = new Set(snapshot.endpoints.map((endpoint) => endpoint.id));

  for (const organization of snapshot.organizations) {
    if (organization.partOfOrganizationId && !organizationIds.has(organization.partOfOrganizationId)) {
      throw new DomainError(`Organization ${organization.id} tham chiếu partOf không tồn tại.`);
    }
  }

  for (const endpoint of snapshot.endpoints) {
    if (!organizationIds.has(endpoint.managingOrganizationId)) {
      throw new DomainError(`Endpoint ${endpoint.id} tham chiếu Organization không tồn tại.`);
    }
  }

  for (const role of snapshot.practitionerRoles) {
    if (!organizationIds.has(role.organizationId)) {
      throw new DomainError(`PractitionerRole ${role.id} tham chiếu Organization không tồn tại.`);
    }

    if (role.practitionerId && !practitionerIds.has(role.practitionerId)) {
      throw new DomainError(`PractitionerRole ${role.id} tham chiếu Practitioner không tồn tại.`);
    }

    for (const endpointId of role.endpointIds ?? []) {
      if (!endpointIds.has(endpointId)) {
        throw new DomainError(`PractitionerRole ${role.id} tham chiếu Endpoint không tồn tại.`);
      }
    }
  }
}

export function validateUniqueIds(resourceType: string, ids: readonly string[]): void {
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      throw new DomainError(`${resourceType} bị trùng mã ${id}.`);
    }

    seen.add(id);
  }
}
