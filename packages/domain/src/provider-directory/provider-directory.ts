import {
  cloneEndpoint,
  cloneOrganization,
  clonePractitioner,
  clonePractitionerRole
} from "./provider-directory.snapshots.js";
import {
  assertValidDate,
  normalizeTimestamp
} from "./provider-directory.primitives.js";
import {
  validateReferences,
  validateUniqueIds
} from "./provider-directory.references.js";
import {
  normalizeEndpoint,
  normalizeOrganization,
  normalizePersistedEndpoint,
  normalizePersistedOrganization,
  normalizePersistedPractitioner,
  normalizePersistedPractitionerRole,
  normalizePractitioner,
  normalizePractitionerRole
} from "./provider-directory.validation.js";
import type {
  ProviderDirectoryInput,
  ProviderDirectorySnapshot
} from "./provider-directory.types.js";

export type {
  ProviderCoding,
  ProviderDirectoryInput,
  ProviderDirectorySnapshot,
  ProviderEndpointConnectionType,
  ProviderEndpointSnapshot,
  ProviderEndpointStatus,
  ProviderIdentifier,
  ProviderOrganizationSnapshot,
  ProviderOrganizationType,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot,
  ProviderTelecom
} from "./provider-directory.types.js";

export class ProviderDirectory {
  private constructor(private readonly snapshot: ProviderDirectorySnapshot) {}

  static assemble(input: ProviderDirectoryInput): ProviderDirectory {
    const now = input.generatedAt ?? new Date();
    assertValidDate(now, "Thời điểm tạo Provider Directory không hợp lệ.");
    const organizations = input.organizations.map((organization) =>
      normalizeOrganization(organization, now)
    );
    const practitioners = input.practitioners.map((practitioner) =>
      normalizePractitioner(practitioner, now)
    );
    const endpoints = input.endpoints.map((endpoint) => normalizeEndpoint(endpoint, now));
    const practitionerRoles = input.practitionerRoles.map((role) =>
      normalizePractitionerRole(role, now)
    );

    validateUniqueIds("Organization", organizations.map((organization) => organization.id));
    validateUniqueIds("Practitioner", practitioners.map((practitioner) => practitioner.id));
    validateUniqueIds("Endpoint", endpoints.map((endpoint) => endpoint.id));
    validateUniqueIds("PractitionerRole", practitionerRoles.map((role) => role.id));
    validateReferences({ organizations, practitioners, practitionerRoles, endpoints });

    return new ProviderDirectory({
      organizations,
      practitioners,
      practitionerRoles,
      endpoints,
      generatedAt: now.toISOString()
    });
  }

  static rehydrate(snapshot: ProviderDirectorySnapshot): ProviderDirectory {
    const organizations = snapshot.organizations.map(normalizePersistedOrganization);
    const practitioners = snapshot.practitioners.map(normalizePersistedPractitioner);
    const endpoints = snapshot.endpoints.map(normalizePersistedEndpoint);
    const practitionerRoles = snapshot.practitionerRoles.map(normalizePersistedPractitionerRole);
    const generatedAt = normalizeTimestamp(
      snapshot.generatedAt,
      "Thời điểm sinh Provider Directory không hợp lệ."
    );

    validateUniqueIds("Organization", organizations.map((organization) => organization.id));
    validateUniqueIds("Practitioner", practitioners.map((practitioner) => practitioner.id));
    validateUniqueIds("Endpoint", endpoints.map((endpoint) => endpoint.id));
    validateUniqueIds("PractitionerRole", practitionerRoles.map((role) => role.id));
    validateReferences({ organizations, practitioners, practitionerRoles, endpoints });

    return new ProviderDirectory({
      organizations,
      practitioners,
      practitionerRoles,
      endpoints,
      generatedAt
    });
  }

  toSnapshot(): ProviderDirectorySnapshot {
    return {
      organizations: this.snapshot.organizations.map(cloneOrganization),
      practitioners: this.snapshot.practitioners.map(clonePractitioner),
      practitionerRoles: this.snapshot.practitionerRoles.map(clonePractitionerRole),
      endpoints: this.snapshot.endpoints.map(cloneEndpoint),
      generatedAt: this.snapshot.generatedAt
    };
  }
}
