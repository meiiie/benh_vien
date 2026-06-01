import type { PatientSnapshot } from "../patient/patient.js";
import type { ProviderDirectorySnapshot } from "../provider-directory/provider-directory.js";
import { getActivePractitionerOrganizationIds } from "./access-control.organization-scope.js";
import { rolePermissions } from "./access-control.permissions.js";
import { actorRoles, purposesOfUse } from "./access-control.policy.js";
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
