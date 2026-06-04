import { ProviderDirectory } from "@benh-vien-so/domain";
import type {
  ProviderDirectorySnapshot,
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "@benh-vien-so/domain";
import type {
  ProviderDirectoryResourceRow,
  ProviderDirectoryResourceWrite
} from "./postgres-provider-directory.types.js";

export function rowToProviderDirectory(
  rows: readonly ProviderDirectoryResourceRow[]
): ProviderDirectory {
  const snapshot: ProviderDirectorySnapshot = {
    organizations: filterSnapshots<ProviderOrganizationSnapshot>(rows, "Organization"),
    practitioners: filterSnapshots<ProviderPractitionerSnapshot>(rows, "Practitioner"),
    practitionerRoles: filterSnapshots<ProviderPractitionerRoleSnapshot>(
      rows,
      "PractitionerRole"
    ),
    endpoints: filterSnapshots<ProviderEndpointSnapshot>(rows, "Endpoint"),
    generatedAt: new Date().toISOString()
  };

  return ProviderDirectory.rehydrate(snapshot);
}

export function providerDirectoryToResourceWrites(
  directory: ProviderDirectory
): ProviderDirectoryResourceWrite[] {
  const snapshot = directory.toSnapshot();

  return [
    ...snapshot.organizations.map((organization) => ({
      resourceType: "Organization" as const,
      id: organization.id,
      snapshot: organization
    })),
    ...snapshot.practitioners.map((practitioner) => ({
      resourceType: "Practitioner" as const,
      id: practitioner.id,
      snapshot: practitioner
    })),
    ...snapshot.practitionerRoles.map((role) => ({
      resourceType: "PractitionerRole" as const,
      id: role.id,
      snapshot: role
    })),
    ...snapshot.endpoints.map((endpoint) => ({
      resourceType: "Endpoint" as const,
      id: endpoint.id,
      snapshot: endpoint
    }))
  ];
}

function filterSnapshots<T>(
  rows: readonly ProviderDirectoryResourceRow[],
  resourceType: ProviderDirectoryResourceRow["resource_type"]
): T[] {
  return rows
    .filter((row) => row.resource_type === resourceType)
    .map((row) => row.snapshot as T);
}
