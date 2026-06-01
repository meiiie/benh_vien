import type { PatientSnapshot } from "../patient/patient.js";
import type { ProviderDirectorySnapshot } from "../provider-directory/provider-directory.js";
import { actorRoles, purposesOfUse, rolePermissions } from "./access-control.policy.js";
import type {
  ActorContext,
  ActorRole,
  Permission,
  PurposeOfUse
} from "./access-control.policy.js";

export type { ActorContext, ActorRole, Permission, PurposeOfUse } from "./access-control.policy.js";

export function canAccess(actor: ActorContext, permission: Permission): boolean {
  if (!rolePermissions[actor.role].includes(permission)) {
    return false;
  }

  if (
    actor.role === "auditor" &&
    (permission === "patient:list" || permission === "patient:read")
  ) {
    return actor.purposeOfUse === "AUDIT";
  }

  if (permission === "audit-event:list") {
    return actor.purposeOfUse === "AUDIT" || actor.role === "admin";
  }

  if (permission === "audit-event:fhir-export") {
    return actor.purposeOfUse === "AUDIT" || actor.role === "admin";
  }

  if (permission.includes("fhir-export")) {
    return actor.purposeOfUse === "TREATMENT" || actor.role === "admin";
  }

  return true;
}

export function canAccessPatientRecord(
  actor: ActorContext,
  patient: Pick<PatientSnapshot, "managingOrganizationId">,
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles">,
  at = new Date()
): boolean {
  if (actor.role === "admin") {
    return true;
  }

  if (actor.role === "auditor") {
    return actor.purposeOfUse === "AUDIT";
  }

  if (actor.purposeOfUse !== "TREATMENT") {
    return false;
  }

  return getActivePractitionerOrganizationIds(actor.actorId, providerDirectory, at).has(
    patient.managingOrganizationId
  );
}

export function filterAccessiblePatientRecords<
  Patient extends Pick<PatientSnapshot, "managingOrganizationId">
>(
  actor: ActorContext,
  patients: readonly Patient[],
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles">,
  at = new Date()
): Patient[] {
  return patients.filter((patient) => canAccessPatientRecord(actor, patient, providerDirectory, at));
}

export function isActorRole(value: string): value is ActorRole {
  return actorRoles.has(value as ActorRole);
}

export function isPurposeOfUse(value: string): value is PurposeOfUse {
  return purposesOfUse.has(value as PurposeOfUse);
}

function getActivePractitionerOrganizationIds(
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
