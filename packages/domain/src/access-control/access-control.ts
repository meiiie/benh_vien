import type { PatientSnapshot } from "../patient/patient.js";
import type { ProviderDirectorySnapshot } from "../provider-directory/provider-directory.js";

export type ActorRole = "clinician" | "nurse" | "auditor" | "admin" | "integration";

export type PurposeOfUse = "TREATMENT" | "AUDIT" | "OPERATIONS";

export type Permission =
  | "patient:list"
  | "patient:create"
  | "patient:read"
  | "patient:merge"
  | "patient:fhir-export"
  | "provider-directory:read"
  | "provider-directory:fhir-export"
  | "record-transfer:list"
  | "record-transfer:create"
  | "record-transfer:read"
  | "record-transfer:update"
  | "record-transfer:acknowledge"
  | "record-transfer:fhir-export"
  | "encounter:list"
  | "encounter:create"
  | "encounter:read"
  | "encounter:finish"
  | "encounter:fhir-export"
  | "allergy-intolerance:list"
  | "allergy-intolerance:create"
  | "allergy-intolerance:read"
  | "allergy-intolerance:fhir-export"
  | "condition:list"
  | "condition:create"
  | "condition:read"
  | "condition:fhir-export"
  | "medication-request:list"
  | "medication-request:create"
  | "medication-request:read"
  | "medication-request:fhir-export"
  | "medication-dispense:list"
  | "medication-dispense:create"
  | "medication-dispense:read"
  | "medication-dispense:fhir-export"
  | "medication-administration:list"
  | "medication-administration:create"
  | "medication-administration:read"
  | "medication-administration:fhir-export"
  | "observation:list"
  | "observation:create"
  | "observation:read"
  | "observation:fhir-export"
  | "service-request:list"
  | "service-request:create"
  | "service-request:read"
  | "service-request:fhir-export"
  | "workflow-task:list"
  | "workflow-task:create"
  | "workflow-task:read"
  | "workflow-task:fhir-export"
  | "procedure:list"
  | "procedure:create"
  | "procedure:read"
  | "procedure:fhir-export"
  | "diagnostic-report:list"
  | "diagnostic-report:create"
  | "diagnostic-report:read"
  | "diagnostic-report:fhir-export"
  | "imaging-study:list"
  | "imaging-study:create"
  | "imaging-study:read"
  | "imaging-study:fhir-export"
  | "clinical-document:list"
  | "clinical-document:create"
  | "clinical-document:sign"
  | "clinical-document:fhir-export"
  | "consent:list"
  | "consent:create"
  | "consent:revoke"
  | "consent:fhir-export"
  | "audit-event:list"
  | "audit-event:fhir-export";

export type ActorContext = {
  readonly actorId: string;
  readonly role: ActorRole;
  readonly purposeOfUse: PurposeOfUse;
};

const rolePermissions: Record<ActorRole, readonly Permission[]> = {
  clinician: [
    "patient:list",
    "patient:create",
    "patient:read",
    "patient:fhir-export",
    "provider-directory:read",
    "provider-directory:fhir-export",
    "record-transfer:list",
    "record-transfer:create",
    "record-transfer:read",
    "record-transfer:update",
    "record-transfer:acknowledge",
    "record-transfer:fhir-export",
    "encounter:list",
    "encounter:create",
    "encounter:read",
    "encounter:finish",
    "encounter:fhir-export",
    "allergy-intolerance:list",
    "allergy-intolerance:create",
    "allergy-intolerance:read",
    "allergy-intolerance:fhir-export",
    "condition:list",
    "condition:create",
    "condition:read",
    "condition:fhir-export",
    "medication-request:list",
    "medication-request:create",
    "medication-request:read",
    "medication-request:fhir-export",
    "medication-dispense:list",
    "medication-dispense:create",
    "medication-dispense:read",
    "medication-dispense:fhir-export",
    "medication-administration:list",
    "medication-administration:create",
    "medication-administration:read",
    "medication-administration:fhir-export",
    "observation:list",
    "observation:create",
    "observation:read",
    "observation:fhir-export",
    "service-request:list",
    "service-request:create",
    "service-request:read",
    "service-request:fhir-export",
    "workflow-task:list",
    "workflow-task:create",
    "workflow-task:read",
    "workflow-task:fhir-export",
    "procedure:list",
    "procedure:create",
    "procedure:read",
    "procedure:fhir-export",
    "diagnostic-report:list",
    "diagnostic-report:create",
    "diagnostic-report:read",
    "diagnostic-report:fhir-export",
    "imaging-study:list",
    "imaging-study:create",
    "imaging-study:read",
    "imaging-study:fhir-export",
    "clinical-document:list",
    "clinical-document:create",
    "clinical-document:sign",
    "clinical-document:fhir-export",
    "consent:list",
    "consent:create",
    "consent:revoke",
    "consent:fhir-export"
  ],
  nurse: [
    "patient:list",
    "patient:read",
    "provider-directory:read",
    "record-transfer:list",
    "record-transfer:read",
    "record-transfer:acknowledge",
    "encounter:list",
    "encounter:read",
    "allergy-intolerance:list",
    "allergy-intolerance:create",
    "allergy-intolerance:read",
    "condition:list",
    "condition:create",
    "condition:read",
    "medication-request:list",
    "medication-request:create",
    "medication-request:read",
    "medication-dispense:list",
    "medication-dispense:create",
    "medication-dispense:read",
    "medication-administration:list",
    "medication-administration:create",
    "medication-administration:read",
    "observation:list",
    "observation:create",
    "observation:read",
    "service-request:list",
    "service-request:create",
    "service-request:read",
    "workflow-task:list",
    "workflow-task:create",
    "workflow-task:read",
    "procedure:list",
    "procedure:create",
    "procedure:read",
    "diagnostic-report:list",
    "diagnostic-report:create",
    "diagnostic-report:read",
    "imaging-study:list",
    "imaging-study:create",
    "imaging-study:read",
    "clinical-document:list",
    "clinical-document:create",
    "consent:list"
  ],
  auditor: [
    "patient:list",
    "patient:read",
    "provider-directory:read",
    "record-transfer:list",
    "record-transfer:read",
    "workflow-task:list",
    "workflow-task:read",
    "procedure:list",
    "procedure:read",
    "medication-dispense:list",
    "medication-dispense:read",
    "medication-administration:list",
    "medication-administration:read",
    "audit-event:list",
    "audit-event:fhir-export"
  ],
  admin: [
    "patient:list",
    "patient:create",
    "patient:read",
    "patient:merge",
    "patient:fhir-export",
    "provider-directory:read",
    "provider-directory:fhir-export",
    "record-transfer:list",
    "record-transfer:create",
    "record-transfer:read",
    "record-transfer:update",
    "record-transfer:acknowledge",
    "record-transfer:fhir-export",
    "encounter:list",
    "encounter:create",
    "encounter:read",
    "encounter:finish",
    "encounter:fhir-export",
    "allergy-intolerance:list",
    "allergy-intolerance:create",
    "allergy-intolerance:read",
    "allergy-intolerance:fhir-export",
    "condition:list",
    "condition:create",
    "condition:read",
    "condition:fhir-export",
    "medication-request:list",
    "medication-request:create",
    "medication-request:read",
    "medication-request:fhir-export",
    "medication-dispense:list",
    "medication-dispense:create",
    "medication-dispense:read",
    "medication-dispense:fhir-export",
    "medication-administration:list",
    "medication-administration:create",
    "medication-administration:read",
    "medication-administration:fhir-export",
    "observation:list",
    "observation:create",
    "observation:read",
    "observation:fhir-export",
    "service-request:list",
    "service-request:create",
    "service-request:read",
    "service-request:fhir-export",
    "workflow-task:list",
    "workflow-task:create",
    "workflow-task:read",
    "workflow-task:fhir-export",
    "procedure:list",
    "procedure:create",
    "procedure:read",
    "procedure:fhir-export",
    "diagnostic-report:list",
    "diagnostic-report:create",
    "diagnostic-report:read",
    "diagnostic-report:fhir-export",
    "imaging-study:list",
    "imaging-study:create",
    "imaging-study:read",
    "imaging-study:fhir-export",
    "clinical-document:list",
    "clinical-document:create",
    "clinical-document:sign",
    "clinical-document:fhir-export",
    "consent:list",
    "consent:create",
    "consent:revoke",
    "consent:fhir-export",
    "audit-event:list",
    "audit-event:fhir-export"
  ],
  integration: [
    "record-transfer:acknowledge"
  ]
};

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
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles">
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

  return getActivePractitionerOrganizationIds(actor.actorId, providerDirectory).has(
    patient.managingOrganizationId
  );
}

export function filterAccessiblePatientRecords<
  Patient extends Pick<PatientSnapshot, "managingOrganizationId">
>(
  actor: ActorContext,
  patients: readonly Patient[],
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles">
): Patient[] {
  return patients.filter((patient) => canAccessPatientRecord(actor, patient, providerDirectory));
}

export function isActorRole(value: string): value is ActorRole {
  return (
    value === "clinician" ||
    value === "nurse" ||
    value === "auditor" ||
    value === "admin" ||
    value === "integration"
  );
}

export function isPurposeOfUse(value: string): value is PurposeOfUse {
  return value === "TREATMENT" || value === "AUDIT" || value === "OPERATIONS";
}

function getActivePractitionerOrganizationIds(
  actorId: string,
  providerDirectory: Pick<ProviderDirectorySnapshot, "organizations" | "practitionerRoles">
): Set<string> {
  const organizationIds = new Set<string>();

  for (const role of providerDirectory.practitionerRoles) {
    if (role.active && role.practitionerId === actorId) {
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
    ancestorIds.push(parentOrganizationId);
    seenOrganizationIds.add(parentOrganizationId);
    currentOrganization = organizationsById.get(parentOrganizationId);
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
      if (seenOrganizationIds.has(child.id)) {
        continue;
      }

      descendantIds.push(child.id);
      seenOrganizationIds.add(child.id);
      pendingIds.push(child.id);
    }
  }

  return descendantIds;
}
