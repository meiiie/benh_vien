import type { Permission } from "./access-control.policy.js";

export const clinicianPatientPermissions = [
  "patient:list",
  "patient:create",
  "patient:read",
  "patient:fhir-export"
] as const satisfies readonly Permission[];

export const adminPatientPermissions = [
  "patient:list",
  "patient:create",
  "patient:read",
  "patient:merge",
  "patient:fhir-export"
] as const satisfies readonly Permission[];

export const providerDirectoryExportPermissions = [
  "provider-directory:read",
  "provider-directory:fhir-export"
] as const satisfies readonly Permission[];

export const recordTransferManagementPermissions = [
  "record-transfer:list",
  "record-transfer:create",
  "record-transfer:read",
  "record-transfer:update",
  "record-transfer:fhir-export"
] as const satisfies readonly Permission[];

export const adminRecordTransferPermissions = [
  "record-transfer:list",
  "record-transfer:create",
  "record-transfer:read",
  "record-transfer:update",
  "record-transfer:acknowledge",
  "record-transfer:fhir-export"
] as const satisfies readonly Permission[];

export const clinicalFhirExportPermissions = [
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
  "imaging-study:fhir-export"
] as const satisfies readonly Permission[];

export const clinicalDocumentExportPermissions = [
  "clinical-document:list",
  "clinical-document:create",
  "clinical-document:sign",
  "clinical-document:fhir-export"
] as const satisfies readonly Permission[];

export const consentManagementPermissions = [
  "consent:list",
  "consent:create",
  "consent:revoke",
  "consent:fhir-export"
] as const satisfies readonly Permission[];

export const nurseClinicalWorkflowPermissions = [
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
  "imaging-study:read"
] as const satisfies readonly Permission[];

export const auditorReadPermissions = [
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
] as const satisfies readonly Permission[];
