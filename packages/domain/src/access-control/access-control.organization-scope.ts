import type { ProviderDirectorySnapshot } from "../provider-directory/provider-directory.js";
import { getActiveOrganizationScopeIds } from "./access-control.organization-tree.js";

export function getActivePractitionerOrganizationIds(
  actorId: string,
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles">,
  at: Date
): Set<string> {
  const organizationIds = new Set<string>();

  for (const role of providerDirectory.practitionerRoles) {
    if (role.practitionerId === actorId && isPractitionerRoleEffective(role, at)) {
      for (const organizationId of getActiveOrganizationScopeIds(
        role.organizationId,
        providerDirectory
      )) {
        organizationIds.add(organizationId);
      }
    }
  }

  return organizationIds;
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

function parseDate(value: string): Date | undefined {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
