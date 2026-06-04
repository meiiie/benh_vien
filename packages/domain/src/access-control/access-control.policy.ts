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

export const actorRoles = new Set<ActorRole>([
  "clinician",
  "nurse",
  "auditor",
  "admin",
  "integration"
]);

export const purposesOfUse = new Set<PurposeOfUse>(["TREATMENT", "AUDIT", "OPERATIONS"]);
