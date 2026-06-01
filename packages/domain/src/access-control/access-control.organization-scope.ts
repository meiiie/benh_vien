import type { ProviderDirectorySnapshot } from "../provider-directory/provider-directory.js";

export function getActivePractitionerOrganizationIds(
  actorId: string,
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles">,
  at: Date
): Set<string> {
  const organizationIds = new Set<string>();

  for (const role of providerDirectory.practitionerRoles) {
    if (role.practitionerId === actorId && isPractitionerRoleEffective(role, at)) {
      addOrganizationScope(organizationIds, role.organizationId, providerDirectory);
    }
  }

  return organizationIds;
}

function addOrganizationScope(
  organizationIds: Set<string>,
  organizationId: string,
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations">
): void {
  if (!isActiveOrganization(organizationId, providerDirectory)) {
    return;
  }

  organizationIds.add(organizationId);

  for (const ancestorId of findAncestorOrganizationIds(organizationId, providerDirectory)) {
    organizationIds.add(ancestorId);
  }

  for (const descendantId of findDescendantOrganizationIds(organizationId, providerDirectory)) {
    organizationIds.add(descendantId);
  }
}

function findAncestorOrganizationIds(
  organizationId: string,
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations">
): string[] {
  const organizationsById = new Map(
    providerDirectory.organizations.map((organization) => [organization.id, organization])
  );
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
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations">
): string[] {
  const descendantIds: string[] = [];
  const pendingIds = [organizationId];
  const seenOrganizationIds = new Set<string>([organizationId]);

  while (pendingIds.length > 0) {
    const currentId = pendingIds.pop();

    if (!currentId) {
      continue;
    }

    const children = providerDirectory.organizations.filter(
      (organization) => organization.partOfOrganizationId === currentId
    );

    for (const child of children) {
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

function isPractitionerRoleEffective(
  role: ProviderDirectorySnapshot["practitionerRoles"][number],
  at: Date
): boolean {
  if (!role.active || Number.isNaN(at.getTime())) {
    return false;
  }

  const periodStart = role.periodStart ? parseDate(role.periodStart) : undefined;
  const periodEnd = role.periodEnd ? parseDate(role.periodEnd) : undefined;

  if (role.periodStart && !periodStart) {
    return false;
  }

  if (role.periodEnd && !periodEnd) {
    return false;
  }

  if (periodStart && at < periodStart) {
    return false;
  }

  return !(periodEnd && at > periodEnd);
}

function isActiveOrganization(
  organizationId: string,
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations">
): boolean {
  return providerDirectory.organizations.some(
    (organization) => organization.id === organizationId && organization.active
  );
}

function parseDate(value: string): Date | undefined {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
