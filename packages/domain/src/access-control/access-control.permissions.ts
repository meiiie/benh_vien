import type { ActorRole, Permission } from "./access-control.policy.js";
import {
  adminPatientPermissions,
  adminRecordTransferPermissions,
  auditorReadPermissions,
  clinicalDocumentExportPermissions,
  clinicalFhirExportPermissions,
  clinicianPatientPermissions,
  consentManagementPermissions,
  nurseClinicalWorkflowPermissions,
  providerDirectoryExportPermissions,
  recordTransferManagementPermissions
} from "./access-control.permission-groups.js";

export const rolePermissions: Record<ActorRole, readonly Permission[]> = {
  clinician: [
    ...clinicianPatientPermissions,
    ...providerDirectoryExportPermissions,
    ...recordTransferManagementPermissions,
    ...clinicalFhirExportPermissions,
    ...clinicalDocumentExportPermissions,
    ...consentManagementPermissions
  ],
  nurse: [
    "patient:list",
    "patient:read",
    "provider-directory:read",
    "record-transfer:list",
    "record-transfer:read",
    ...nurseClinicalWorkflowPermissions,
    "clinical-document:list",
    "clinical-document:create",
    "consent:list"
  ],
  auditor: [...auditorReadPermissions],
  admin: [
    ...adminPatientPermissions,
    ...providerDirectoryExportPermissions,
    ...adminRecordTransferPermissions,
    ...clinicalFhirExportPermissions,
    ...clinicalDocumentExportPermissions,
    ...consentManagementPermissions,
    "audit-event:list",
    "audit-event:fhir-export"
  ],
  integration: ["record-transfer:acknowledge"]
};
