import type { AuditResourceType } from "@benh-vien-so/domain";
import type { DeniedAccessPayload } from "./denied-access-audit.types.js";

const auditResourceByPermissionPrefix: Record<string, AuditResourceType> = {
  "patient:": "Patient",
  "provider-directory:": "ProviderDirectory",
  "record-transfer:": "RecordTransfer",
  "encounter:": "Encounter",
  "allergy-intolerance:": "AllergyIntolerance",
  "condition:": "Condition",
  "medication-request:": "MedicationRequest",
  "medication-dispense:": "MedicationDispense",
  "medication-administration:": "MedicationAdministration",
  "observation:": "Observation",
  "service-request:": "ServiceRequest",
  "workflow-task:": "Task",
  "procedure:": "Procedure",
  "diagnostic-report:": "DiagnosticReport",
  "imaging-study:": "ImagingStudy",
  "clinical-document:": "ClinicalDocument",
  "consent:": "Consent",
  "audit-event:": "AuditEvent"
};

export function isAuditableDeniedAccess(
  statusCode: number,
  payload: DeniedAccessPayload
): boolean {
  if (payload.error === "INVALID_PURPOSE_OF_USE") {
    return statusCode === 400;
  }

  return statusCode === 403;
}

export function inferDeniedAuditResourceType(
  payload: DeniedAccessPayload
): AuditResourceType {
  if (payload.error === "PATIENT_ACCESS_DENIED") {
    return "Patient";
  }

  if (payload.permission) {
    for (const [prefix, resourceType] of Object.entries(auditResourceByPermissionPrefix)) {
      if (payload.permission.startsWith(prefix)) {
        return resourceType;
      }
    }
  }

  return "AuditEvent";
}

export function resolveDeniedAuditResourceId(
  payload: DeniedAccessPayload,
  fallbackRequestId: string
): string {
  if (payload.error === "PATIENT_ACCESS_DENIED" && payload.patientId) {
    return payload.patientId;
  }

  return payload.permission ?? fallbackRequestId;
}
