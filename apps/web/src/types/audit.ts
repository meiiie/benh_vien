export type AuditAction =
  | "auth.login.success"
  | "auth.login.failure"
  | "access.denied"
  | "patient.list"
  | "patient.create"
  | "patient.identifier-conflict"
  | "patient.merge"
  | "patient.read"
  | "patient.fhir-export"
  | "patient.fhir-bundle-export"
  | "patient.fhir-document-bundle-export"
  | "provider-directory.read"
  | "provider-directory.fhir-export"
  | "record-transfer.list"
  | "record-transfer.create"
  | "record-transfer.read"
  | "record-transfer.send"
  | "record-transfer.fail"
  | "record-transfer.retry"
  | "record-transfer.dead-letter"
  | "record-transfer.receive"
  | "record-transfer.acknowledgement-callback"
  | "record-transfer.fhir-export"
  | "encounter.list"
  | "encounter.create"
  | "encounter.read"
  | "encounter.finish"
  | "encounter.fhir-export"
  | "allergy-intolerance.list"
  | "allergy-intolerance.create"
  | "allergy-intolerance.read"
  | "allergy-intolerance.fhir-export"
  | "condition.list"
  | "condition.create"
  | "condition.read"
  | "condition.fhir-export"
  | "medication-request.list"
  | "medication-request.create"
  | "medication-request.read"
  | "medication-request.fhir-export"
  | "medication-dispense.list"
  | "medication-dispense.create"
  | "medication-dispense.read"
  | "medication-dispense.fhir-export"
  | "medication-administration.list"
  | "medication-administration.create"
  | "medication-administration.read"
  | "medication-administration.fhir-export"
  | "observation.list"
  | "observation.create"
  | "observation.read"
  | "observation.fhir-export"
  | "service-request.list"
  | "service-request.create"
  | "service-request.read"
  | "service-request.fhir-export"
  | "workflow-task.list"
  | "workflow-task.create"
  | "workflow-task.read"
  | "workflow-task.fhir-export"
  | "procedure.list"
  | "procedure.create"
  | "procedure.read"
  | "procedure.fhir-export"
  | "diagnostic-report.list"
  | "diagnostic-report.create"
  | "diagnostic-report.read"
  | "diagnostic-report.fhir-export"
  | "imaging-study.list"
  | "imaging-study.create"
  | "imaging-study.read"
  | "imaging-study.fhir-export"
  | "clinical-document.list"
  | "clinical-document.create"
  | "clinical-document.sign"
  | "clinical-document.fhir-export"
  | "clinical-document.provenance-export"
  | "consent.list"
  | "consent.create"
  | "consent.revoke"
  | "consent.fhir-export"
  | "audit-event.list"
  | "audit-event.fhir-export"
  | "audit-event.integrity-verify";

export type AuditResourceType =
  | "Patient"
  | "ProviderDirectory"
  | "RecordTransfer"
  | "Encounter"
  | "AllergyIntolerance"
  | "Condition"
  | "MedicationRequest"
  | "MedicationDispense"
  | "MedicationAdministration"
  | "Observation"
  | "ServiceRequest"
  | "Task"
  | "Procedure"
  | "DiagnosticReport"
  | "ImagingStudy"
  | "ClinicalDocument"
  | "Consent"
  | "AuditEvent";

export type AuditEvent = {
  readonly id?: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId: string;
  readonly patientId?: string;
  readonly purposeOfUse?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata: Record<string, unknown>;
  readonly hashAlgorithm?: "sha256";
  readonly previousHash?: string;
  readonly payloadHash?: string;
  readonly integrityHash?: string;
};

export type AuditIntegrityStatus = "verified" | "unsealed" | "broken";

export type AuditIntegrityReport = {
  readonly patientId: string;
  readonly checkedAt: string;
  readonly status: AuditIntegrityStatus;
  readonly verified: boolean;
  readonly totalEvents: number;
  readonly sealedEvents: number;
  readonly latestHash?: string;
  readonly brokenAtEventId?: string;
  readonly brokenReason?: string;
};

export type AuditEventsResponse = {
  readonly items: readonly AuditEvent[];
};

export type AuditIntegrityReportResponse = AuditIntegrityReport;
