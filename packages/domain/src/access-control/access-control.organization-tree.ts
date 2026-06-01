import type { ProviderDirectorySnapshot } from "../provider-directory/provider-directory.js";

type Organization = ProviderDirectorySnapshot["organizations"][number];
type OrganizationDirectory = Pick<ProviderDirectorySnapshot, "organizations">;
type ChildrenByParentOrganizationId = Map<string, Organization[]>;

export function getActiveOrganizationScopeIds(
  organizationId: string,
  providerDirectory: OrganizationDirectory
): Set<string> {
  if (!isActiveOrganization(organizationId, providerDirectory)) {
    return new Set();
  }

  return new Set([
    organizationId,
    ...findAncestorOrganizationIds(organizationId, providerDirectory),
    ...findDescendantOrganizationIds(organizationId, providerDirectory)
  ]);
}

function findAncestorOrganizationIds(
  organizationId: string,
  providerDirectory: OrganizationDirectory
): string[] {
  const organizationsById = buildOrganizationsById(providerDirectory);
  const ancestorIds: string[] = [];
  const seenOrganizationIds = new Set<string>([organizationId]);
  let currentOrganization = organizationsById.get(organizationId);

  while (
    currentOrganization?.partOfOrganizationId &&
    !seenOrganizationIds.has(currentOrganization.partOfOrganizationId)
  ) {
    const parentOrganizationId = currentOrganization.partOfOrganizationId;
    seenOrganizationIds.add(parentOrganizationId);
    currentOrganization = organizationsById.get(parentOrganizationId);

    if (!currentOrganization?.active) {
      break;
    }

    ancestorIds.push(parentOrganizationId);
  }

  return ancestorIds;
}

function findDescendantOrganizationIds(
  organizationId: string,
  providerDirectory: OrganizationDirectory
): string[] {
  const childrenByParentOrganizationId = buildChildrenByParentOrganizationId(providerDirectory);
  const descendantIds: string[] = [];
  const pendingIds = [organizationId];
  const seenOrganizationIds = new Set<string>([organizationId]);

  while (pendingIds.length > 0) {
    const currentId = pendingIds.pop();

    if (!currentId) {
      continue;
    }

    for (const child of childrenByParentOrganizationId.get(currentId) ?? []) {
      if (seenOrganizationIds.has(child.id) || !child.active) {
        continue;
      }

      descendantIds.push(child.id);
      seenOrganizationIds.add(child.id);
      pendingIds.push(child.id);
    }
  }

  return descendantIds;
}

function isActiveOrganization(
  organizationId: string,
  providerDirectory: OrganizationDirectory
): boolean {
  return providerDirectory.organizations.some(
    (organization) => organization.id === organizationId && organization.active
  );
}

function buildOrganizationsById(
  providerDirectory: OrganizationDirectory
): Map<string, Organization> {
  return new Map(
    providerDirectory.organizations.map((organization) => [organization.id, organization])
  );
}

function buildChildrenByParentOrganizationId(
  providerDirectory: OrganizationDirectory
): ChildrenByParentOrganizationId {
  const childrenByParentOrganizationId: ChildrenByParentOrganizationId = new Map();

  for (const organization of providerDirectory.organizations) {
    if (!organization.partOfOrganizationId) {
      continue;
    }

    const siblings = childrenByParentOrganizationId.get(organization.partOfOrganizationId) ?? [];
    siblings.push(organization);
    childrenByParentOrganizationId.set(organization.partOfOrganizationId, siblings);
  }

  return childrenByParentOrganizationId;
}
