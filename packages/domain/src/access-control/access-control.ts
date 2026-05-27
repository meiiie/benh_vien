export type ActorRole = "clinician" | "nurse" | "auditor" | "admin";

export type PurposeOfUse = "TREATMENT" | "AUDIT" | "OPERATIONS";

export type Permission =
  | "patient:list"
  | "patient:create"
  | "patient:read"
  | "patient:fhir-export"
  | "provider-directory:read"
  | "provider-directory:fhir-export"
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
  | "observation:list"
  | "observation:create"
  | "observation:read"
  | "observation:fhir-export"
  | "service-request:list"
  | "service-request:create"
  | "service-request:read"
  | "service-request:fhir-export"
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
    "provider-directory:read",
    "provider-directory:fhir-export",
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
    "observation:list",
    "observation:create",
    "observation:read",
    "observation:fhir-export",
    "service-request:list",
    "service-request:create",
    "service-request:read",
    "service-request:fhir-export",
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
    "consent:create"
  ],
  nurse: [
    "patient:list",
    "patient:read",
    "provider-directory:read",
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
    "observation:list",
    "observation:create",
    "observation:read",
    "service-request:list",
    "service-request:create",
    "service-request:read",
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
  auditor: ["patient:read", "provider-directory:read", "audit-event:list"],
  admin: [
    "patient:list",
    "patient:create",
    "patient:read",
    "patient:fhir-export",
    "provider-directory:read",
    "provider-directory:fhir-export",
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
    "observation:list",
    "observation:create",
    "observation:read",
    "observation:fhir-export",
    "service-request:list",
    "service-request:create",
    "service-request:read",
    "service-request:fhir-export",
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
