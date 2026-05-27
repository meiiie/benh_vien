export type ActorRole = "clinician" | "nurse" | "auditor" | "admin";

export type PurposeOfUse = "TREATMENT" | "AUDIT" | "OPERATIONS";

export type Permission =
  | "patient:list"
  | "patient:create"
  | "patient:read"
  | "patient:fhir-export"
  | "encounter:list"
  | "encounter:create"
  | "encounter:read"
  | "encounter:finish"
  | "encounter:fhir-export"
  | "clinical-document:list"
  | "clinical-document:create"
  | "clinical-document:sign"
  | "clinical-document:fhir-export"
  | "consent:list"
  | "consent:create"
  | "audit-event:list";

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
    "encounter:list",
    "encounter:create",
    "encounter:read",
    "encounter:finish",
    "encounter:fhir-export",
    "clinical-document:list",
    "clinical-document:create",
    "clinical-document:sign",
    "clinical-document:fhir-export",
    "consent:list",
    "consent:create"
  ],
  nurse: [
    "patient:list",
    "patient:read",
    "encounter:list",
    "encounter:read",
    "clinical-document:list",
    "clinical-document:create",
    "consent:list"
  ],
  auditor: ["patient:read", "audit-event:list"],
  admin: [
    "patient:list",
    "patient:create",
    "patient:read",
    "patient:fhir-export",
    "encounter:list",
    "encounter:create",
    "encounter:read",
    "encounter:finish",
    "encounter:fhir-export",
    "clinical-document:list",
    "clinical-document:create",
    "clinical-document:sign",
    "clinical-document:fhir-export",
    "consent:list",
    "consent:create",
    "audit-event:list"
  ]
};

export function canAccess(actor: ActorContext, permission: Permission): boolean {
  if (!rolePermissions[actor.role].includes(permission)) {
    return false;
  }

  if (permission === "audit-event:list") {
    return actor.purposeOfUse === "AUDIT" || actor.role === "admin";
  }

  if (permission.includes("fhir-export")) {
    return actor.purposeOfUse === "TREATMENT" || actor.role === "admin";
  }

  return true;
}

export function isActorRole(value: string): value is ActorRole {
  return value === "clinician" || value === "nurse" || value === "auditor" || value === "admin";
}

export function isPurposeOfUse(value: string): value is PurposeOfUse {
  return value === "TREATMENT" || value === "AUDIT" || value === "OPERATIONS";
}
