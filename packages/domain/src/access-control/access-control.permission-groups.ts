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

export const consentManagementPermissions = [
  "consent:list",
  "consent:create",
  "consent:revoke",
  "consent:fhir-export"
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
