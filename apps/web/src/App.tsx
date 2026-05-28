import { FormEvent, ReactNode, useEffect, useState } from "react";

type AppRoute =
  | "landing"
  | "login"
  | "dashboard"
  | "workspace"
  | "documents"
  | "audit"
  | "interop"
  | "settings";
type PatientIdentifierType = "national-id" | "insurance-id" | "hospital-mrn" | "legacy-id";
type PatientGender = "male" | "female" | "other" | "unknown";
type EncounterClass = "ambulatory" | "inpatient" | "emergency" | "virtual";
type EncounterStatus = "planned" | "in-progress" | "finished" | "cancelled" | "entered-in-error";
type ClinicalDocumentType =
  | "admission-note"
  | "discharge-summary"
  | "lab-report"
  | "imaging-report"
  | "referral-letter"
  | "consent-form"
  | "advance-directive"
  | "ccda"
  | "ccr"
  | "medical-record"
  | "patient-information";
type ClinicalDocumentStatus = "draft" | "signed" | "superseded" | "entered-in-error";
type ConditionClinicalStatus =
  | "active"
  | "recurrence"
  | "relapse"
  | "inactive"
  | "remission"
  | "resolved";
type ConditionVerificationStatus =
  | "unconfirmed"
  | "provisional"
  | "differential"
  | "confirmed"
  | "refuted"
  | "entered-in-error";
type ConditionCategory = "problem-list-item" | "encounter-diagnosis";
type ConditionSeverity = "mild" | "moderate" | "severe";
type AllergyClinicalStatus = "active" | "inactive" | "resolved";
type AllergyVerificationStatus = "unconfirmed" | "confirmed" | "refuted" | "entered-in-error";
type AllergyType = "allergy" | "intolerance";
type AllergyCategory = "food" | "medication" | "environment" | "biologic";
type AllergyCriticality = "low" | "high" | "unable-to-assess";
type AllergyReactionSeverity = "mild" | "moderate" | "severe";
type ObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "cancelled"
  | "entered-in-error";
type ObservationCategory = "vital-signs" | "laboratory";
type MedicationRequestStatus =
  | "active"
  | "on-hold"
  | "cancelled"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "draft"
  | "unknown";
type MedicationRequestIntent =
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
type MedicationRequestCategory = "inpatient" | "outpatient" | "community" | "discharge";
type MedicationRequestPriority = "routine" | "urgent" | "asap" | "stat";
type MedicationTimingUnit = "h" | "d" | "wk";
type MedicationDispenseStatus =
  | "preparation"
  | "in-progress"
  | "cancelled"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "declined"
  | "unknown";
type MedicationDispenseCategory = "inpatient" | "outpatient" | "community" | "discharge";
type MedicationAdministrationStatus =
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "unknown";
type MedicationAdministrationCategory =
  | "inpatient"
  | "outpatient"
  | "community"
  | "patient-specified";
type MedicationAdministrationPerformerActorType =
  | "Practitioner"
  | "PractitionerRole"
  | "Patient"
  | "RelatedPerson"
  | "Device";
type ServiceRequestStatus =
  | "draft"
  | "active"
  | "on-hold"
  | "revoked"
  | "completed"
  | "entered-in-error"
  | "unknown";
type ServiceRequestIntent =
  | "proposal"
  | "plan"
  | "directive"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
type ServiceRequestCategory = "laboratory" | "imaging" | "procedure" | "consultation" | "therapy";
type ServiceRequestPriority = "routine" | "urgent" | "asap" | "stat";
type WorkflowTaskStatus =
  | "draft"
  | "requested"
  | "received"
  | "accepted"
  | "rejected"
  | "ready"
  | "cancelled"
  | "in-progress"
  | "on-hold"
  | "failed"
  | "completed"
  | "entered-in-error";
type WorkflowTaskIntent =
  | "unknown"
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
type WorkflowTaskPriority = "routine" | "urgent" | "asap" | "stat";
type WorkflowTaskReferenceResourceType =
  | "ServiceRequest"
  | "Observation"
  | "DiagnosticReport"
  | "ImagingStudy"
  | "DocumentReference";
type ProcedureStatus =
  | "preparation"
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "stopped"
  | "completed"
  | "entered-in-error"
  | "unknown";
type ProcedureCategory =
  | "surgical"
  | "diagnostic"
  | "therapeutic"
  | "counseling"
  | "rehabilitation"
  | "other";
type ProcedurePerformerActorType = "Practitioner" | "PractitionerRole" | "Organization";
type ProcedureReportReferenceResourceType = "DiagnosticReport" | "DocumentReference" | "Composition";
type DiagnosticReportStatus =
  | "registered"
  | "partial"
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "appended"
  | "cancelled"
  | "entered-in-error"
  | "unknown";
type DiagnosticReportCategory = "laboratory" | "imaging" | "pathology" | "other";
type ImagingStudyStatus =
  | "registered"
  | "available"
  | "cancelled"
  | "entered-in-error"
  | "unknown";
type DemoRole = "clinician" | "nurse" | "auditor" | "admin" | "integration";
type PurposeOfUse = "TREATMENT" | "AUDIT" | "OPERATIONS";
type ConsentStatus = "active" | "revoked" | "expired";
type ConsentCategory = "record-sharing";
type RecordTransferStatus =
  | "draft"
  | "requested"
  | "ready"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "failed"
  | "dead-lettered";
type RecordTransferPriority = "routine" | "urgent" | "asap" | "stat";
type RecordTransferBundleType = "collection" | "document";
type RecordTransferDeliveryAttemptStatus = "queued" | "succeeded" | "failed";
type ProviderOrganizationType =
  | "hospital"
  | "department"
  | "laboratory"
  | "imaging"
  | "payer"
  | "government"
  | "other";
type ProviderEndpointConnectionType =
  | "hl7-fhir-rest"
  | "dicom-wado-rs"
  | "hl7v2-mllp"
  | "direct-project"
  | "ihe-xds"
  | "other";

type ProviderIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type?: string;
};

type ProviderTelecom = {
  readonly system: "phone" | "email" | "url";
  readonly value: string;
  readonly use?: "work" | "mobile" | "home";
};

type ProviderCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type ProviderOrganization = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly type: ProviderOrganizationType;
  readonly name: string;
  readonly alias?: readonly string[];
  readonly address?: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly partOfOrganizationId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ProviderPractitioner = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly fullName: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly qualification?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ProviderEndpoint = {
  readonly id: string;
  readonly managingOrganizationId: string;
  readonly status: "active" | "suspended" | "error" | "off" | "entered-in-error" | "test";
  readonly connectionType: ProviderEndpointConnectionType;
  readonly name: string;
  readonly address: string;
  readonly payloadTypes: readonly ProviderCoding[];
  readonly contact?: readonly ProviderTelecom[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ProviderPractitionerRole = {
  readonly id: string;
  readonly practitionerId?: string;
  readonly organizationId: string;
  readonly active: boolean;
  readonly code: ProviderCoding;
  readonly specialty?: ProviderCoding;
  readonly endpointIds?: readonly string[];
  readonly telecom?: readonly ProviderTelecom[];
  readonly periodStart?: string;
  readonly periodEnd?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ProviderDirectory = {
  readonly organizations: readonly ProviderOrganization[];
  readonly practitioners: readonly ProviderPractitioner[];
  readonly practitionerRoles: readonly ProviderPractitionerRole[];
  readonly endpoints: readonly ProviderEndpoint[];
  readonly generatedAt: string;
};

type PatientIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type: PatientIdentifierType;
};

type Patient = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender: PatientGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
  readonly status: "active" | "merged" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Encounter = {
  readonly id: string;
  readonly patientId: string;
  readonly status: EncounterStatus;
  readonly class: EncounterClass;
  readonly serviceType: string;
  readonly reasonText: string;
  readonly departmentId?: string;
  readonly attendingPractitionerId: string;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ClinicalDocument = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly type: ClinicalDocumentType;
  readonly title: string;
  readonly status: ClinicalDocumentStatus;
  readonly storageUri: string;
  readonly attachmentContentType?: string;
  readonly attachmentSizeBytes?: number;
  readonly attachmentHashSha1Base64?: string;
  readonly attachmentCreatedAt?: string;
  readonly authorPractitionerId: string;
  readonly signedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ObservationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type ConditionCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type AllergyCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type AllergyReaction = {
  readonly manifestation: AllergyCode;
  readonly severity?: AllergyReactionSeverity;
  readonly description?: string;
};

type AllergyIntolerance = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly clinicalStatus: AllergyClinicalStatus;
  readonly verificationStatus: AllergyVerificationStatus;
  readonly type: AllergyType;
  readonly category: AllergyCategory;
  readonly criticality?: AllergyCriticality;
  readonly code: AllergyCode;
  readonly reaction?: AllergyReaction;
  readonly recordedAt: string;
  readonly recorderPractitionerId: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Condition = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly clinicalStatus: ConditionClinicalStatus;
  readonly verificationStatus: ConditionVerificationStatus;
  readonly category: ConditionCategory;
  readonly code: ConditionCode;
  readonly severity?: ConditionSeverity;
  readonly onsetAt?: string;
  readonly recordedAt: string;
  readonly recorderPractitionerId: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ObservationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

type Observation = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly status: ObservationStatus;
  readonly category: ObservationCategory;
  readonly code: ObservationCode;
  readonly effectiveAt: string;
  readonly valueQuantity?: ObservationQuantity;
  readonly valueText?: string;
  readonly performerPractitionerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type MedicationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type MedicationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

type DosageInstruction = {
  readonly text: string;
  readonly route?: string;
  readonly doseQuantity?: MedicationQuantity;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: MedicationTimingUnit;
};

type MedicationRequest = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
  readonly status: MedicationRequestStatus;
  readonly intent: MedicationRequestIntent;
  readonly category: MedicationRequestCategory;
  readonly priority: MedicationRequestPriority;
  readonly medicationCode: MedicationCode;
  readonly dosageInstruction: DosageInstruction;
  readonly authoredOn: string;
  readonly requesterPractitionerId: string;
  readonly expectedSupplyDurationDays?: number;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type MedicationDispense = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly medicationRequestId?: string;
  readonly status: MedicationDispenseStatus;
  readonly statusReason?: MedicationCode;
  readonly category: MedicationDispenseCategory;
  readonly medicationCode: MedicationCode;
  readonly quantity?: MedicationQuantity;
  readonly daysSupply?: MedicationQuantity;
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
  readonly dispenserPractitionerId?: string;
  readonly destinationLocationId?: string;
  readonly receiverPractitionerId?: string;
  readonly dosageInstruction?: DosageInstruction;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type MedicationAdministrationPerformer = {
  readonly actorType: MedicationAdministrationPerformerActorType;
  readonly actorId: string;
  readonly function?: MedicationCode;
};

type MedicationAdministrationEffectivePeriod = {
  readonly start?: string;
  readonly end?: string;
};

type MedicationAdministrationDosage = {
  readonly text?: string;
  readonly route?: MedicationCode;
  readonly doseQuantity?: MedicationQuantity;
};

type MedicationAdministration = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly medicationRequestId?: string;
  readonly reasonConditionId?: string;
  readonly status: MedicationAdministrationStatus;
  readonly statusReason?: MedicationCode;
  readonly category: MedicationAdministrationCategory;
  readonly medicationCode: MedicationCode;
  readonly effectivePeriod: MedicationAdministrationEffectivePeriod;
  readonly performers: readonly MedicationAdministrationPerformer[];
  readonly dosage?: MedicationAdministrationDosage;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ServiceRequestCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type ServiceRequest = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
  readonly status: ServiceRequestStatus;
  readonly intent: ServiceRequestIntent;
  readonly category: ServiceRequestCategory;
  readonly priority: ServiceRequestPriority;
  readonly code: ServiceRequestCode;
  readonly occurrenceAt?: string;
  readonly authoredOn: string;
  readonly requesterPractitionerId: string;
  readonly performerOrganizationId?: string;
  readonly patientInstruction?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type WorkflowTaskCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type WorkflowTaskBusinessStatus = {
  readonly code: string;
  readonly display: string;
};

type WorkflowTaskReference = {
  readonly resourceType: WorkflowTaskReferenceResourceType;
  readonly id: string;
  readonly label?: string;
};

type WorkflowTaskExecutionPeriod = {
  readonly start?: string;
  readonly end?: string;
};

type WorkflowTask = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly status: WorkflowTaskStatus;
  readonly intent: WorkflowTaskIntent;
  readonly priority: WorkflowTaskPriority;
  readonly code: WorkflowTaskCode;
  readonly description?: string;
  readonly businessStatus?: WorkflowTaskBusinessStatus;
  readonly requesterPractitionerId?: string;
  readonly ownerOrganizationId?: string;
  readonly ownerPractitionerId?: string;
  readonly authoredOn: string;
  readonly lastModified: string;
  readonly executionPeriod?: WorkflowTaskExecutionPeriod;
  readonly inputReferences: readonly WorkflowTaskReference[];
  readonly outputReferences: readonly WorkflowTaskReference[];
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ProcedureCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type ProcedurePerformedPeriod = {
  readonly start?: string;
  readonly end?: string;
};

type ProcedurePerformer = {
  readonly actorType: ProcedurePerformerActorType;
  readonly actorId: string;
  readonly function?: ProcedureCoding;
  readonly onBehalfOfOrganizationId?: string;
};

type ProcedureReportReference = {
  readonly resourceType: ProcedureReportReferenceResourceType;
  readonly id: string;
};

type Procedure = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly partOfProcedureId?: string;
  readonly status: ProcedureStatus;
  readonly statusReason?: ProcedureCoding;
  readonly category: ProcedureCategory;
  readonly code: ProcedureCoding;
  readonly performedPeriod?: ProcedurePerformedPeriod;
  readonly recorderPractitionerId?: string;
  readonly asserterPractitionerId?: string;
  readonly performers: readonly ProcedurePerformer[];
  readonly reasonConditionId?: string;
  readonly bodySite?: ProcedureCoding;
  readonly outcome?: ProcedureCoding;
  readonly reportReferences: readonly ProcedureReportReference[];
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type DiagnosticReportCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type DiagnosticReport = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly status: DiagnosticReportStatus;
  readonly category: DiagnosticReportCategory;
  readonly code: DiagnosticReportCode;
  readonly effectiveAt: string;
  readonly issuedAt: string;
  readonly performerOrganizationId?: string;
  readonly resultsInterpreterPractitionerId?: string;
  readonly resultObservationIds: readonly string[];
  readonly conclusion?: string;
  readonly presentedFormUrl?: string;
  readonly presentedFormTitle?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ImagingStudyCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type ImagingStudySeries = {
  readonly uid: string;
  readonly number?: number;
  readonly modality: ImagingStudyCoding;
  readonly description?: string;
  readonly numberOfInstances: number;
  readonly bodySite?: ImagingStudyCoding;
  readonly startedAt?: string;
};

type ImagingStudy = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly diagnosticReportId?: string;
  readonly status: ImagingStudyStatus;
  readonly studyInstanceUid: string;
  readonly accessionNumber?: string;
  readonly description?: string;
  readonly startedAt?: string;
  readonly referrerPractitionerId?: string;
  readonly interpreterPractitionerId?: string;
  readonly endpointId?: string;
  readonly numberOfSeries: number;
  readonly numberOfInstances: number;
  readonly series: readonly ImagingStudySeries[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

type AuditAction =
  | "auth.login.success"
  | "auth.login.failure"
  | "access.denied"
  | "patient.list"
  | "patient.create"
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

type AuditResourceType =
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

type AuditEvent = {
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

type AuditIntegrityStatus = "verified" | "unsealed" | "broken";

type AuditIntegrityReport = {
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

type Consent = {
  readonly id: string;
  readonly patientId: string;
  readonly status: ConsentStatus;
  readonly category: ConsentCategory;
  readonly granteeOrganizationId: string;
  readonly grantorActorId: string;
  readonly evidenceDocumentId?: string;
  readonly revokedByActorId?: string;
  readonly revokedAt?: string;
  readonly revocationReason?: string;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type RecordTransfer = {
  readonly id: string;
  readonly patientId: string;
  readonly status: RecordTransferStatus;
  readonly priority: RecordTransferPriority;
  readonly bundleType: RecordTransferBundleType;
  readonly bundleId: string;
  readonly sourceOrganizationId: string;
  readonly recipientOrganizationId: string;
  readonly consentReference: string;
  readonly requestedByActorId: string;
  readonly reason: string;
  readonly requestedAt: string;
  readonly sentAt?: string;
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly failedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
  readonly retryCount?: number;
  readonly deadLetteredAt?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type RecordTransferDeliveryAttempt = {
  readonly id: string;
  readonly recordTransferId: string;
  readonly patientId: string;
  readonly targetEndpointId: string;
  readonly targetEndpointAddress: string;
  readonly bundleId: string;
  readonly bundleType: RecordTransferBundleType;
  readonly idempotencyKey: string;
  readonly attemptNumber: number;
  readonly status: RecordTransferDeliveryAttemptStatus;
  readonly queuedAt: string;
  readonly completedAt?: string;
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type RecordTransferOperationalSeverity = "info" | "success" | "warning" | "danger";

type RecordTransferOperationalSummary = {
  readonly severity: RecordTransferOperationalSeverity;
  readonly title: string;
  readonly description: string;
  readonly nextAction: string;
  readonly technicalSignal: string;
  readonly attemptCount: number;
  readonly failedAttemptCount: number;
  readonly lastHttpStatus: string;
  readonly nextRetry: string;
};

type PatientsResponse = {
  readonly items: readonly Patient[];
};

type EncountersResponse = {
  readonly items: readonly Encounter[];
};

type ClinicalDocumentsResponse = {
  readonly items: readonly ClinicalDocument[];
};

type ConditionsResponse = {
  readonly items: readonly Condition[];
};

type AllergyIntolerancesResponse = {
  readonly items: readonly AllergyIntolerance[];
};

type ObservationsResponse = {
  readonly items: readonly Observation[];
};

type MedicationRequestsResponse = {
  readonly items: readonly MedicationRequest[];
};

type MedicationDispensesResponse = {
  readonly items: readonly MedicationDispense[];
};

type MedicationAdministrationsResponse = {
  readonly items: readonly MedicationAdministration[];
};

type ServiceRequestsResponse = {
  readonly items: readonly ServiceRequest[];
};

type WorkflowTasksResponse = {
  readonly items: readonly WorkflowTask[];
};

type ProceduresResponse = {
  readonly items: readonly Procedure[];
};

type DiagnosticReportsResponse = {
  readonly items: readonly DiagnosticReport[];
};

type ImagingStudiesResponse = {
  readonly items: readonly ImagingStudy[];
};

type AuditEventsResponse = {
  readonly items: readonly AuditEvent[];
};

type AuditIntegrityReportResponse = AuditIntegrityReport;

type ConsentsResponse = {
  readonly items: readonly Consent[];
};

type RecordTransfersResponse = {
  readonly items: readonly RecordTransfer[];
};

type RecordTransferDeliveryAttemptsResponse = {
  readonly items: readonly RecordTransferDeliveryAttempt[];
};

type NewPatientForm = {
  fullName: string;
  birthDate: string;
  gender: PatientGender;
  nationalId: string;
  hospitalMrn: string;
  phone: string;
  address: string;
  managingOrganizationId: string;
};

type NewRecordTransferForm = {
  priority: RecordTransferPriority;
  bundleType: RecordTransferBundleType;
  sourceOrganizationId: string;
  recipientOrganizationId: string;
  consentReference: string;
  reason: string;
  note: string;
};

type NewEncounterForm = {
  class: EncounterClass;
  serviceType: string;
  reasonText: string;
  departmentId: string;
  attendingPractitionerId: string;
  startedAt: string;
};

type NewClinicalDocumentForm = {
  encounterId: string;
  type: ClinicalDocumentType;
  title: string;
  storageUri: string;
  attachmentContentType: string;
  attachmentSizeBytes: string;
  attachmentHashSha1Base64: string;
  attachmentCreatedAt: string;
  authorPractitionerId: string;
};

type NewConditionForm = {
  encounterId: string;
  category: ConditionCategory;
  clinicalStatus: ConditionClinicalStatus;
  verificationStatus: ConditionVerificationStatus;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  severity: "" | ConditionSeverity;
  onsetAt: string;
  recorderPractitionerId: string;
  note: string;
};

type NewAllergyIntoleranceForm = {
  encounterId: string;
  type: AllergyType;
  category: AllergyCategory;
  clinicalStatus: AllergyClinicalStatus;
  verificationStatus: AllergyVerificationStatus;
  criticality: "" | AllergyCriticality;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  manifestationSystem: string;
  manifestationCode: string;
  manifestationDisplay: string;
  reactionSeverity: "" | AllergyReactionSeverity;
  reactionDescription: string;
  recordedAt: string;
  recorderPractitionerId: string;
  note: string;
};

type NewObservationForm = {
  encounterId: string;
  category: ObservationCategory;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  value: string;
  unit: string;
  unitSystem: string;
  unitCode: string;
  effectiveAt: string;
  performerPractitionerId: string;
};

type NewMedicationRequestForm = {
  encounterId: string;
  reasonConditionId: string;
  category: MedicationRequestCategory;
  priority: MedicationRequestPriority;
  medicationSystem: string;
  medicationCode: string;
  medicationDisplay: string;
  dosageText: string;
  route: string;
  doseValue: string;
  doseUnit: string;
  frequency: string;
  period: string;
  periodUnit: MedicationTimingUnit;
  authoredOn: string;
  requesterPractitionerId: string;
  expectedSupplyDurationDays: string;
  note: string;
};

type NewMedicationDispenseForm = {
  encounterId: string;
  medicationRequestId: string;
  category: MedicationDispenseCategory;
  medicationSystem: string;
  medicationCode: string;
  medicationDisplay: string;
  quantityValue: string;
  quantityUnit: string;
  daysSupplyValue: string;
  whenPrepared: string;
  whenHandedOver: string;
  dispenserPractitionerId: string;
  receiverPractitionerId: string;
  dosageText: string;
  route: string;
  doseValue: string;
  doseUnit: string;
  frequency: string;
  period: string;
  periodUnit: MedicationTimingUnit;
  note: string;
};

type NewMedicationAdministrationForm = {
  encounterId: string;
  medicationRequestId: string;
  reasonConditionId: string;
  category: MedicationAdministrationCategory;
  medicationSystem: string;
  medicationCode: string;
  medicationDisplay: string;
  effectiveStart: string;
  performerActorType: MedicationAdministrationPerformerActorType;
  performerActorId: string;
  performerFunctionDisplay: string;
  dosageText: string;
  routeSystem: string;
  routeCode: string;
  routeDisplay: string;
  doseValue: string;
  doseUnit: string;
  note: string;
};

type NewServiceRequestForm = {
  encounterId: string;
  reasonConditionId: string;
  category: ServiceRequestCategory;
  priority: ServiceRequestPriority;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  occurrenceAt: string;
  authoredOn: string;
  requesterPractitionerId: string;
  performerOrganizationId: string;
  patientInstruction: string;
  note: string;
};

type NewProcedureForm = {
  encounterId: string;
  basedOnServiceRequestId: string;
  reasonConditionId: string;
  category: ProcedureCategory;
  status: ProcedureStatus;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  performedStart: string;
  performedEnd: string;
  performerActorType: ProcedurePerformerActorType;
  performerActorId: string;
  performerFunctionSystem: string;
  performerFunctionCode: string;
  performerFunctionDisplay: string;
  onBehalfOfOrganizationId: string;
  recorderPractitionerId: string;
  asserterPractitionerId: string;
  bodySiteSystem: string;
  bodySiteCode: string;
  bodySiteDisplay: string;
  outcomeSystem: string;
  outcomeCode: string;
  outcomeDisplay: string;
  reportReferenceType: ProcedureReportReferenceResourceType;
  reportReferenceId: string;
  note: string;
};

type NewDiagnosticReportForm = {
  encounterId: string;
  basedOnServiceRequestId: string;
  category: DiagnosticReportCategory;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  effectiveAt: string;
  issuedAt: string;
  performerOrganizationId: string;
  resultsInterpreterPractitionerId: string;
  resultObservationIds: string[];
  conclusion: string;
  presentedFormUrl: string;
  presentedFormTitle: string;
};

type NewImagingStudyForm = {
  encounterId: string;
  basedOnServiceRequestId: string;
  diagnosticReportId: string;
  studyInstanceUid: string;
  accessionNumber: string;
  description: string;
  startedAt: string;
  referrerPractitionerId: string;
  interpreterPractitionerId: string;
  endpointId: string;
  seriesUid: string;
  seriesNumber: string;
  modalitySystem: string;
  modalityCode: string;
  modalityDisplay: string;
  seriesDescription: string;
  numberOfInstances: string;
  bodySiteSystem: string;
  bodySiteCode: string;
  bodySiteDisplay: string;
};

type LoginForm = {
  username: string;
  password: string;
  role: DemoRole;
};

type AuthSession = {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly actor: {
    readonly actorId: string;
    readonly displayName: string;
    readonly role: DemoRole;
  };
};

const defaultPatientForm: NewPatientForm = {
  fullName: "Trần Minh Hải",
  birthDate: "1992-09-18",
  gender: "male",
  nationalId: "031092000002",
  hospitalMrn: "MRN-HP-0002",
  phone: "0912345678",
  address: "Hải Phòng, Việt Nam",
  managingOrganizationId: "hospital-hai-phong-demo"
};

const defaultEncounterForm: NewEncounterForm = {
  class: "ambulatory",
  serviceType: "Khám ngoại trú",
  reasonText: "Tiếp nhận hồ sơ và đánh giá tình trạng ban đầu.",
  departmentId: "department-outpatient",
  attendingPractitionerId: "practitioner-demo-002",
  startedAt: "2026-05-27T10:00"
};

const defaultClinicalDocumentForm: NewClinicalDocumentForm = {
  encounterId: "",
  type: "referral-letter",
  title: "Giấy chuyển tuyến điện tử - Hải Phòng",
  storageUri: "s3://wiiicare-demo/patients/current/referral-letter.pdf",
  attachmentContentType: "application/pdf",
  attachmentSizeBytes: "131072",
  attachmentHashSha1Base64: "QExIY/y1FG989CjaoCo4NtNAlXQ=",
  attachmentCreatedAt: "2026-05-28T09:00",
  authorPractitionerId: "practitioner-demo-003"
};

const defaultConditionForm: NewConditionForm = {
  encounterId: "",
  category: "encounter-diagnosis",
  clinicalStatus: "active",
  verificationStatus: "confirmed",
  codeSystem: "http://hl7.org/fhir/sid/icd-10",
  code: "R50.9",
  codeDisplay: "Sốt chưa rõ nguyên nhân",
  severity: "mild",
  onsetAt: "2026-05-27T09:30",
  recorderPractitionerId: "practitioner-demo-001",
  note: "Chẩn đoán làm việc trong quá trình khám."
};

const defaultAllergyIntoleranceForm: NewAllergyIntoleranceForm = {
  encounterId: "",
  type: "allergy",
  category: "medication",
  clinicalStatus: "active",
  verificationStatus: "confirmed",
  criticality: "high",
  codeSystem: "http://snomed.info/sct",
  code: "91936005",
  codeDisplay: "Allergy to penicillin",
  manifestationSystem: "http://snomed.info/sct",
  manifestationCode: "271807003",
  manifestationDisplay: "Skin rash",
  reactionSeverity: "moderate",
  reactionDescription: "Phát ban sau khi dùng nhóm penicillin theo khai thác bệnh sử.",
  recordedAt: "2026-05-27T10:20",
  recorderPractitionerId: "practitioner-demo-001",
  note: "Cảnh báo dị ứng cần được xem trước khi kê thuốc."
};

const defaultObservationForm: NewObservationForm = {
  encounterId: "",
  category: "laboratory",
  codeSystem: "http://loinc.org",
  code: "718-7",
  codeDisplay: "Hemoglobin",
  value: "13.8",
  unit: "g/dL",
  unitSystem: "http://unitsofmeasure.org",
  unitCode: "g/dL",
  effectiveAt: "2026-05-27T10:15",
  performerPractitionerId: "practitioner-demo-002"
};

const defaultMedicationRequestForm: NewMedicationRequestForm = {
  encounterId: "",
  reasonConditionId: "",
  category: "outpatient",
  priority: "routine",
  medicationSystem: "http://www.whocc.no/atc",
  medicationCode: "C08CA01",
  medicationDisplay: "Amlodipine",
  dosageText: "Uống 5 mg mỗi ngày vào buổi tối",
  route: "Đường uống",
  doseValue: "5",
  doseUnit: "mg",
  frequency: "1",
  period: "1",
  periodUnit: "d",
  authoredOn: "2026-05-27T10:30",
  requesterPractitionerId: "practitioner-demo-001",
  expectedSupplyDurationDays: "30",
  note: "Chỉ định thuốc dùng cho quản lý điều trị ngoại trú."
};

const defaultMedicationDispenseForm: NewMedicationDispenseForm = {
  encounterId: "",
  medicationRequestId: "",
  category: "outpatient",
  medicationSystem: "http://www.whocc.no/atc",
  medicationCode: "C09AA05",
  medicationDisplay: "Ramipril",
  quantityValue: "30",
  quantityUnit: "viên",
  daysSupplyValue: "30",
  whenPrepared: "2026-05-27T12:30",
  whenHandedOver: "2026-05-27T12:45",
  dispenserPractitionerId: "nurse-demo-001",
  receiverPractitionerId: "nurse-demo-001",
  dosageText: "Uống 5 mg mỗi ngày vào buổi sáng",
  route: "Đường uống",
  doseValue: "5",
  doseUnit: "mg",
  frequency: "1",
  period: "1",
  periodUnit: "d",
  note: "Ghi nhận cấp phát thuốc sau khi chỉ định đã được duyệt."
};

const defaultMedicationAdministrationForm: NewMedicationAdministrationForm = {
  encounterId: "",
  medicationRequestId: "",
  reasonConditionId: "",
  category: "outpatient",
  medicationSystem: "http://www.whocc.no/atc",
  medicationCode: "C09AA05",
  medicationDisplay: "Ramipril",
  effectiveStart: "2026-05-27T13:00",
  performerActorType: "Practitioner",
  performerActorId: "nurse-demo-001",
  performerFunctionDisplay: "Nhân sự xác nhận dùng thuốc",
  dosageText: "Uống 5 mg vào buổi sáng",
  routeSystem: "http://snomed.info/sct",
  routeCode: "26643006",
  routeDisplay: "Oral route",
  doseValue: "5",
  doseUnit: "mg",
  note: "Ghi nhận dùng thuốc thực tế theo chỉ định đã có."
};

const defaultServiceRequestForm: NewServiceRequestForm = {
  encounterId: "",
  reasonConditionId: "",
  category: "laboratory",
  priority: "urgent",
  codeSystem: "http://loinc.org",
  code: "58410-2",
  codeDisplay: "Complete blood count panel",
  occurrenceAt: "2026-05-27T11:00",
  authoredOn: "2026-05-27T10:40",
  requesterPractitionerId: "practitioner-demo-001",
  performerOrganizationId: "department-laboratory",
  patientInstruction: "Lấy mẫu theo hướng dẫn của khoa xét nghiệm.",
  note: "Chỉ định xét nghiệm/hình ảnh dùng để nối EMR với LIS/PACS."
};

const defaultProcedureForm: NewProcedureForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  reasonConditionId: "",
  category: "diagnostic",
  status: "completed",
  codeSystem: "http://snomed.info/sct",
  code: "168537006",
  codeDisplay: "Chest X-ray",
  performedStart: "2026-05-27T12:15",
  performedEnd: "2026-05-27T12:30",
  performerActorType: "Practitioner",
  performerActorId: "practitioner-demo-001",
  performerFunctionSystem: "urn:wiiicare:nexus:procedure-performer-function",
  performerFunctionCode: "clinical-performer",
  performerFunctionDisplay: "Người thực hiện lâm sàng",
  onBehalfOfOrganizationId: "department-diagnostic-imaging",
  recorderPractitionerId: "practitioner-demo-001",
  asserterPractitionerId: "practitioner-demo-001",
  bodySiteSystem: "http://snomed.info/sct",
  bodySiteCode: "51185008",
  bodySiteDisplay: "Thoracic structure",
  outcomeSystem: "urn:wiiicare:nexus:procedure-outcome",
  outcomeCode: "completed",
  outcomeDisplay: "Hoàn tất thủ thuật",
  reportReferenceType: "DiagnosticReport",
  reportReferenceId: "",
  note: "Procedure ghi nhận hành động y tế đã thực hiện, khác với ServiceRequest là y lệnh và Task là hàng đợi thực thi."
};

const defaultDiagnosticReportForm: NewDiagnosticReportForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  category: "laboratory",
  codeSystem: "http://loinc.org",
  code: "58410-2",
  codeDisplay: "Complete blood count panel",
  effectiveAt: "2026-05-27T11:30",
  issuedAt: "2026-05-27T12:00",
  performerOrganizationId: "department-laboratory",
  resultsInterpreterPractitionerId: "practitioner-demo-002",
  resultObservationIds: [],
  conclusion: "Kết quả phù hợp với bối cảnh lâm sàng hiện tại.",
  presentedFormUrl: "",
  presentedFormTitle: ""
};

const defaultImagingStudyForm: NewImagingStudyForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  diagnosticReportId: "",
  studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270002",
  accessionNumber: "HP-CXR-20260527-0002",
  description: "Chest X-ray follow-up study",
  startedAt: "2026-05-27T12:10",
  referrerPractitionerId: "practitioner-demo-001",
  interpreterPractitionerId: "practitioner-demo-001",
  endpointId: "endpoint-pacs-hai-phong-demo",
  seriesUid: "1.2.826.0.1.3680043.10.543.202605270002.1",
  seriesNumber: "1",
  modalitySystem: "http://dicom.nema.org/resources/ontology/DCM",
  modalityCode: "DX",
  modalityDisplay: "Digital Radiography",
  seriesDescription: "PA and lateral chest radiographs",
  numberOfInstances: "2",
  bodySiteSystem: "http://snomed.info/sct",
  bodySiteCode: "51185008",
  bodySiteDisplay: "Thoracic structure"
};

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (window.location.port === "7311" ? "http://localhost:7310/api/v1" : "/api/v1");

const defaultTransferContext = {
  consentReference: "consent-demo-transfer-001",
  recipientOrganizationId: "hospital-hai-phong-referral"
};

const defaultRecordTransferForm: NewRecordTransferForm = {
  priority: "urgent",
  bundleType: "document",
  sourceOrganizationId: "hospital-hai-phong-demo",
  recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
  consentReference: defaultTransferContext.consentReference,
  reason: "Chuyển hồ sơ sang bệnh viện tiếp nhận để theo dõi sau cấp cứu.",
  note: "Dùng FHIR document Bundle có Composition làm mục lục lâm sàng."
};

const loginPresets: Record<DemoRole, LoginForm> = {
  clinician: {
    username: "practitioner-demo-001",
    password: "demo",
    role: "clinician"
  },
  nurse: {
    username: "nurse-demo-001",
    password: "demo",
    role: "nurse"
  },
  auditor: {
    username: "security-officer-demo",
    password: "demo",
    role: "auditor"
  },
  admin: {
    username: "admin-demo",
    password: "demo",
    role: "admin"
  },
  integration: {
    username: "gateway-hai-phong-referral",
    password: "demo",
    role: "integration"
  }
};

const workflowSteps = [
  "Tiếp nhận bệnh nhân",
  "Mở lượt khám",
  "Kiểm tra dị ứng",
  "Ghi nhận chẩn đoán",
  "Chỉ định dịch vụ",
  "Theo dõi Task thực thi",
  "Ghi nhận Procedure",
  "Nhận kết quả",
  "Gắn siêu dữ liệu PACS",
  "Định danh cơ sở/endpoint",
  "Ghi nhận chỉ số",
  "Kê đơn/thuốc",
  "Cấp phát thuốc",
  "Xác nhận dùng thuốc",
  "Gắn tài liệu",
  "Ký/xác thực",
  "Xuất FHIR"
];

const documentTaxonomy = [
  "Advance Directive",
  "CCD/CCDA/CCR",
  "Lab Report",
  "Medical Record",
  "Patient Information",
  "FHIR Export Document"
];

const navigationItems: readonly {
  readonly route: Exclude<AppRoute, "landing" | "login">;
  readonly label: string;
  readonly hint: string;
}[] = [
  { route: "dashboard", label: "Tổng quan", hint: "Vận hành" },
  { route: "workspace", label: "Hồ sơ bệnh nhân", hint: "Lượt khám" },
  { route: "documents", label: "Tài liệu", hint: "Bệnh án điện tử" },
  { route: "audit", label: "Kiểm toán", hint: "Nhật ký truy cập" },
  { route: "interop", label: "Liên thông", hint: "FHIR/HIS/LIS/PACS" },
  { route: "settings", label: "Cấu hình", hint: "Vai trò và bảo mật" }
];

const referenceSignals = [
  {
    name: "OpenEMR",
    value: "Workbench bệnh viện: lịch khám, hồ sơ bệnh nhân, encounter, tài liệu, audit và API."
  },
  {
    name: "HL7 FHIR R4",
    value: "Patient, Encounter, AllergyIntolerance, Condition, ServiceRequest, Task, Procedure, Observation, DiagnosticReport, ImagingStudy, MedicationRequest, MedicationDispense, MedicationAdministration, DocumentReference, Provenance cùng Organization/Practitioner/Endpoint là lõi trao đổi dữ liệu; RecordTransfer xuất thành Task để điều phối chuyển hồ sơ."
  },
  {
    name: "Bối cảnh Việt Nam",
    value: "Ưu tiên Hải Phòng, định danh nội bộ, BHYT/CCCD ở lớp dữ liệu; chưa giả lập HIS/LIS/PACS khi chưa tích hợp thật."
  },
  {
    name: "Product direction",
    value: "Không làm landing page đẹp trước; xây bàn làm việc nghiệp vụ cho nhân viên y tế trước."
  }
];

export function App() {
  const [appRoute, setAppRoute] = useState<AppRoute>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession>();
  const [loginForm, setLoginForm] = useState<LoginForm>(loginPresets.clinician);
  const [loginError, setLoginError] = useState<string>();
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [encounters, setEncounters] = useState<readonly Encounter[]>([]);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>();
  const [clinicalDocuments, setClinicalDocuments] = useState<readonly ClinicalDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>();
  const [allergyIntolerances, setAllergyIntolerances] = useState<readonly AllergyIntolerance[]>([]);
  const [selectedAllergyIntoleranceId, setSelectedAllergyIntoleranceId] = useState<string>();
  const [conditions, setConditions] = useState<readonly Condition[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState<string>();
  const [observations, setObservations] = useState<readonly Observation[]>([]);
  const [selectedObservationId, setSelectedObservationId] = useState<string>();
  const [medicationRequests, setMedicationRequests] = useState<readonly MedicationRequest[]>([]);
  const [selectedMedicationRequestId, setSelectedMedicationRequestId] = useState<string>();
  const [medicationDispenses, setMedicationDispenses] =
    useState<readonly MedicationDispense[]>([]);
  const [selectedMedicationDispenseId, setSelectedMedicationDispenseId] =
    useState<string>();
  const [medicationAdministrations, setMedicationAdministrations] =
    useState<readonly MedicationAdministration[]>([]);
  const [selectedMedicationAdministrationId, setSelectedMedicationAdministrationId] =
    useState<string>();
  const [serviceRequests, setServiceRequests] = useState<readonly ServiceRequest[]>([]);
  const [selectedServiceRequestId, setSelectedServiceRequestId] = useState<string>();
  const [workflowTasks, setWorkflowTasks] = useState<readonly WorkflowTask[]>([]);
  const [selectedWorkflowTaskId, setSelectedWorkflowTaskId] = useState<string>();
  const [procedures, setProcedures] = useState<readonly Procedure[]>([]);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>();
  const [diagnosticReports, setDiagnosticReports] = useState<readonly DiagnosticReport[]>([]);
  const [selectedDiagnosticReportId, setSelectedDiagnosticReportId] = useState<string>();
  const [imagingStudies, setImagingStudies] = useState<readonly ImagingStudy[]>([]);
  const [selectedImagingStudyId, setSelectedImagingStudyId] = useState<string>();
  const [auditEvents, setAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [globalAuditEvents, setGlobalAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [auditIntegrityReport, setAuditIntegrityReport] =
    useState<AuditIntegrityReport>();
  const [auditFhirBundlePreview, setAuditFhirBundlePreview] = useState<unknown>();
  const [consents, setConsents] = useState<readonly Consent[]>([]);
  const [recordTransfers, setRecordTransfers] = useState<readonly RecordTransfer[]>([]);
  const [selectedRecordTransferId, setSelectedRecordTransferId] = useState<string>();
  const [recordTransferDeliveryAttempts, setRecordTransferDeliveryAttempts] =
    useState<readonly RecordTransferDeliveryAttempt[]>([]);
  const [providerDirectory, setProviderDirectory] = useState<ProviderDirectory>();
  const [patientFhirPreview, setPatientFhirPreview] = useState<unknown>();
  const [patientFhirBundlePreview, setPatientFhirBundlePreview] = useState<unknown>();
  const [patientFhirDocumentBundlePreview, setPatientFhirDocumentBundlePreview] = useState<unknown>();
  const [capabilityStatementPreview, setCapabilityStatementPreview] = useState<unknown>();
  const [providerDirectoryFhirPreview, setProviderDirectoryFhirPreview] = useState<unknown>();
  const [consentFhirPreview, setConsentFhirPreview] = useState<unknown>();
  const [recordTransferFhirTaskPreview, setRecordTransferFhirTaskPreview] =
    useState<unknown>();
  const [encounterFhirPreview, setEncounterFhirPreview] = useState<unknown>();
  const [documentFhirPreview, setDocumentFhirPreview] = useState<unknown>();
  const [documentProvenanceFhirPreview, setDocumentProvenanceFhirPreview] =
    useState<unknown>();
  const [allergyIntoleranceFhirPreview, setAllergyIntoleranceFhirPreview] = useState<unknown>();
  const [conditionFhirPreview, setConditionFhirPreview] = useState<unknown>();
  const [observationFhirPreview, setObservationFhirPreview] = useState<unknown>();
  const [medicationRequestFhirPreview, setMedicationRequestFhirPreview] = useState<unknown>();
  const [medicationDispenseFhirPreview, setMedicationDispenseFhirPreview] =
    useState<unknown>();
  const [medicationAdministrationFhirPreview, setMedicationAdministrationFhirPreview] =
    useState<unknown>();
  const [serviceRequestFhirPreview, setServiceRequestFhirPreview] = useState<unknown>();
  const [workflowTaskFhirPreview, setWorkflowTaskFhirPreview] = useState<unknown>();
  const [procedureFhirPreview, setProcedureFhirPreview] = useState<unknown>();
  const [diagnosticReportFhirPreview, setDiagnosticReportFhirPreview] = useState<unknown>();
  const [imagingStudyFhirPreview, setImagingStudyFhirPreview] = useState<unknown>();
  const [patientForm, setPatientForm] = useState<NewPatientForm>(defaultPatientForm);
  const [recordTransferForm, setRecordTransferForm] =
    useState<NewRecordTransferForm>(defaultRecordTransferForm);
  const [encounterForm, setEncounterForm] = useState<NewEncounterForm>(defaultEncounterForm);
  const [documentForm, setDocumentForm] =
    useState<NewClinicalDocumentForm>(defaultClinicalDocumentForm);
  const [allergyIntoleranceForm, setAllergyIntoleranceForm] =
    useState<NewAllergyIntoleranceForm>(defaultAllergyIntoleranceForm);
  const [conditionForm, setConditionForm] =
    useState<NewConditionForm>(defaultConditionForm);
  const [observationForm, setObservationForm] =
    useState<NewObservationForm>(defaultObservationForm);
  const [medicationRequestForm, setMedicationRequestForm] =
    useState<NewMedicationRequestForm>(defaultMedicationRequestForm);
  const [medicationDispenseForm, setMedicationDispenseForm] =
    useState<NewMedicationDispenseForm>(defaultMedicationDispenseForm);
  const [medicationAdministrationForm, setMedicationAdministrationForm] =
    useState<NewMedicationAdministrationForm>(defaultMedicationAdministrationForm);
  const [serviceRequestForm, setServiceRequestForm] =
    useState<NewServiceRequestForm>(defaultServiceRequestForm);
  const [procedureForm, setProcedureForm] =
    useState<NewProcedureForm>(defaultProcedureForm);
  const [diagnosticReportForm, setDiagnosticReportForm] =
    useState<NewDiagnosticReportForm>(defaultDiagnosticReportForm);
  const [imagingStudyForm, setImagingStudyForm] =
    useState<NewImagingStudyForm>(defaultImagingStudyForm);
  const [statusMessage, setStatusMessage] = useState("Chưa đăng nhập.");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingAllergyIntolerances, setIsLoadingAllergyIntolerances] = useState(false);
  const [isLoadingConditions, setIsLoadingConditions] = useState(false);
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [isLoadingMedicationRequests, setIsLoadingMedicationRequests] = useState(false);
  const [isLoadingMedicationDispenses, setIsLoadingMedicationDispenses] =
    useState(false);
  const [isLoadingMedicationAdministrations, setIsLoadingMedicationAdministrations] =
    useState(false);
  const [isLoadingServiceRequests, setIsLoadingServiceRequests] = useState(false);
  const [isLoadingWorkflowTasks, setIsLoadingWorkflowTasks] = useState(false);
  const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);
  const [isLoadingDiagnosticReports, setIsLoadingDiagnosticReports] = useState(false);
  const [isLoadingImagingStudies, setIsLoadingImagingStudies] = useState(false);
  const [isLoadingAuditEvents, setIsLoadingAuditEvents] = useState(false);
  const [isLoadingGlobalAuditEvents, setIsLoadingGlobalAuditEvents] = useState(false);
  const [isVerifyingAuditIntegrity, setIsVerifyingAuditIntegrity] = useState(false);
  const [isExportingAuditFhir, setIsExportingAuditFhir] = useState(false);
  const [isLoadingConsents, setIsLoadingConsents] = useState(false);
  const [isLoadingRecordTransfers, setIsLoadingRecordTransfers] = useState(false);
  const [isLoadingRecordTransferDeliveryAttempts, setIsLoadingRecordTransferDeliveryAttempts] =
    useState(false);
  const [isLoadingProviderDirectory, setIsLoadingProviderDirectory] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [isSubmittingEncounter, setIsSubmittingEncounter] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isSubmittingAllergyIntolerance, setIsSubmittingAllergyIntolerance] = useState(false);
  const [isSubmittingCondition, setIsSubmittingCondition] = useState(false);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [isSubmittingMedicationRequest, setIsSubmittingMedicationRequest] = useState(false);
  const [isSubmittingMedicationDispense, setIsSubmittingMedicationDispense] =
    useState(false);
  const [isSubmittingMedicationAdministration, setIsSubmittingMedicationAdministration] =
    useState(false);
  const [isSubmittingServiceRequest, setIsSubmittingServiceRequest] = useState(false);
  const [isSubmittingProcedure, setIsSubmittingProcedure] = useState(false);
  const [isSubmittingDiagnosticReport, setIsSubmittingDiagnosticReport] = useState(false);
  const [isSubmittingImagingStudy, setIsSubmittingImagingStudy] = useState(false);
  const [isSubmittingRecordTransfer, setIsSubmittingRecordTransfer] = useState(false);
  const [transitioningRecordTransferId, setTransitioningRecordTransferId] =
    useState<string>();
  const [revokingConsentId, setRevokingConsentId] = useState<string>();
  const [isSigningDocument, setIsSigningDocument] = useState(false);
  const [isFinishingEncounter, setIsFinishingEncounter] = useState(false);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedEncounter = encounters.find((encounter) => encounter.id === selectedEncounterId);
  const selectedDocument = clinicalDocuments.find((document) => document.id === selectedDocumentId);
  const selectedAllergyIntolerance = allergyIntolerances.find(
    (allergyIntolerance) => allergyIntolerance.id === selectedAllergyIntoleranceId
  );
  const selectedCondition = conditions.find((condition) => condition.id === selectedConditionId);
  const selectedObservation = observations.find((observation) => observation.id === selectedObservationId);
  const selectedMedicationRequest = medicationRequests.find(
    (medicationRequest) => medicationRequest.id === selectedMedicationRequestId
  );
  const selectedMedicationDispense = medicationDispenses.find(
    (medicationDispense) => medicationDispense.id === selectedMedicationDispenseId
  );
  const selectedMedicationAdministration = medicationAdministrations.find(
    (medicationAdministration) =>
      medicationAdministration.id === selectedMedicationAdministrationId
  );
  const selectedServiceRequest = serviceRequests.find(
    (serviceRequest) => serviceRequest.id === selectedServiceRequestId
  );
  const selectedWorkflowTask = workflowTasks.find((task) => task.id === selectedWorkflowTaskId);
  const selectedProcedure = procedures.find((procedure) => procedure.id === selectedProcedureId);
  const selectedDiagnosticReport = diagnosticReports.find(
    (diagnosticReport) => diagnosticReport.id === selectedDiagnosticReportId
  );
  const selectedImagingStudy = imagingStudies.find(
    (imagingStudy) => imagingStudy.id === selectedImagingStudyId
  );
  const selectedRecordTransfer = recordTransfers.find(
    (recordTransfer) => recordTransfer.id === selectedRecordTransferId
  );
  const selectedEncounterDocuments = selectedEncounter
    ? clinicalDocuments.filter((document) => document.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterAllergyIntolerances = selectedEncounter
    ? allergyIntolerances.filter((allergyIntolerance) => allergyIntolerance.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterObservations = selectedEncounter
    ? observations.filter((observation) => observation.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterConditions = selectedEncounter
    ? conditions.filter((condition) => condition.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterMedicationRequests = selectedEncounter
    ? medicationRequests.filter((medicationRequest) => medicationRequest.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterMedicationDispenses = selectedEncounter
    ? medicationDispenses.filter(
        (medicationDispense) => medicationDispense.encounterId === selectedEncounter.id
      )
    : [];
  const selectedEncounterMedicationAdministrations = selectedEncounter
    ? medicationAdministrations.filter(
        (medicationAdministration) =>
          medicationAdministration.encounterId === selectedEncounter.id
      )
    : [];
  const selectedEncounterServiceRequests = selectedEncounter
    ? serviceRequests.filter((serviceRequest) => serviceRequest.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterWorkflowTasks = selectedEncounter
    ? workflowTasks.filter((task) => task.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterProcedures = selectedEncounter
    ? procedures.filter((procedure) => procedure.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterDiagnosticReports = selectedEncounter
    ? diagnosticReports.filter((diagnosticReport) => diagnosticReport.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterImagingStudies = selectedEncounter
    ? imagingStudies.filter((imagingStudy) => imagingStudy.encounterId === selectedEncounter.id)
    : [];
  const openEncounters = encounters.filter((encounter) => encounter.status === "in-progress");
  const signedDocuments = clinicalDocuments.filter((document) => document.status === "signed");
  const draftDocuments = clinicalDocuments.filter((document) => document.status === "draft");
  const canReadAudit = authSession?.actor.role === "auditor" || authSession?.actor.role === "admin";
  const isAuditOnlySession = authSession?.actor.role === "auditor";

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void loadPatients();
    void loadCapabilityStatement();
    void loadProviderDirectory();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !canReadAudit) {
      setGlobalAuditEvents([]);
      return;
    }

    void loadGlobalAuditEvents({ silent: true });
  }, [isAuthenticated, authSession?.actor.role]);

  useEffect(() => {
    if (!isAuthenticated || !selectedPatientId) {
      setPatientFhirPreview(undefined);
      setPatientFhirBundlePreview(undefined);
      setPatientFhirDocumentBundlePreview(undefined);
      setCapabilityStatementPreview(undefined);
      setConsentFhirPreview(undefined);
      setEncounterFhirPreview(undefined);
      setRecordTransferFhirTaskPreview(undefined);
      setDocumentFhirPreview(undefined);
      setAllergyIntoleranceFhirPreview(undefined);
      setConditionFhirPreview(undefined);
      setObservationFhirPreview(undefined);
      setMedicationRequestFhirPreview(undefined);
      setMedicationDispenseFhirPreview(undefined);
      setMedicationAdministrationFhirPreview(undefined);
      setServiceRequestFhirPreview(undefined);
      setWorkflowTaskFhirPreview(undefined);
      setProcedureFhirPreview(undefined);
      setDiagnosticReportFhirPreview(undefined);
      setImagingStudyFhirPreview(undefined);
      setEncounters([]);
      setClinicalDocuments([]);
      setAllergyIntolerances([]);
      setConditions([]);
      setObservations([]);
      setMedicationRequests([]);
      setMedicationDispenses([]);
      setMedicationAdministrations([]);
      setServiceRequests([]);
      setWorkflowTasks([]);
      setProcedures([]);
      setDiagnosticReports([]);
      setImagingStudies([]);
      setAuditEvents([]);
      setAuditIntegrityReport(undefined);
      setAuditFhirBundlePreview(undefined);
      setConsents([]);
      setRecordTransfers([]);
      setRecordTransferDeliveryAttempts([]);
      setSelectedEncounterId(undefined);
      setSelectedDocumentId(undefined);
      setSelectedAllergyIntoleranceId(undefined);
      setSelectedConditionId(undefined);
      setSelectedObservationId(undefined);
      setSelectedMedicationRequestId(undefined);
      setSelectedMedicationDispenseId(undefined);
      setSelectedMedicationAdministrationId(undefined);
      setSelectedServiceRequestId(undefined);
      setSelectedWorkflowTaskId(undefined);
      setSelectedProcedureId(undefined);
      setSelectedDiagnosticReportId(undefined);
      setSelectedImagingStudyId(undefined);
      setSelectedRecordTransferId(undefined);
      return;
    }

    void loadPatientWorkspace(selectedPatientId);
  }, [isAuthenticated, selectedPatientId]);

  useEffect(() => {
    if (!selectedEncounterId) {
      setEncounterFhirPreview(undefined);
      setDocumentForm((current) => ({ ...current, encounterId: "" }));
      setAllergyIntoleranceForm((current) => ({ ...current, encounterId: "" }));
      setConditionForm((current) => ({ ...current, encounterId: "" }));
      setObservationForm((current) => ({ ...current, encounterId: "" }));
      setMedicationRequestForm((current) => ({ ...current, encounterId: "" }));
      setMedicationDispenseForm((current) => ({ ...current, encounterId: "" }));
      setMedicationAdministrationForm((current) => ({ ...current, encounterId: "" }));
      setServiceRequestForm((current) => ({ ...current, encounterId: "" }));
      setProcedureForm((current) => ({ ...current, encounterId: "" }));
      setDiagnosticReportForm((current) => ({ ...current, encounterId: "" }));
      setImagingStudyForm((current) => ({ ...current, encounterId: "" }));
      return;
    }

    setDocumentForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setAllergyIntoleranceForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setConditionForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setObservationForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setMedicationRequestForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setMedicationDispenseForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setMedicationAdministrationForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setServiceRequestForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setProcedureForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setDiagnosticReportForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setImagingStudyForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    void loadEncounterFhirPreview(selectedEncounterId);
  }, [selectedEncounterId]);

  useEffect(() => {
    if (!selectedDocumentId) {
      setDocumentFhirPreview(undefined);
      setDocumentProvenanceFhirPreview(undefined);
      return;
    }

    void loadDocumentFhirPreview(selectedDocumentId);
    if (selectedDocument?.status === "signed") {
      void loadDocumentProvenanceFhirPreview(selectedDocumentId);
      return;
    }

    setDocumentProvenanceFhirPreview({
      note: "FHIR Provenance chỉ được xuất khi tài liệu đã ký/xác nhận."
    });
  }, [selectedDocumentId, selectedDocument?.status]);

  useEffect(() => {
    if (!selectedConditionId) {
      setConditionFhirPreview(undefined);
      return;
    }

    void loadConditionFhirPreview(selectedConditionId);
  }, [selectedConditionId]);

  useEffect(() => {
    if (!selectedAllergyIntoleranceId) {
      setAllergyIntoleranceFhirPreview(undefined);
      return;
    }

    void loadAllergyIntoleranceFhirPreview(selectedAllergyIntoleranceId);
  }, [selectedAllergyIntoleranceId]);

  useEffect(() => {
    if (!selectedObservationId) {
      setObservationFhirPreview(undefined);
      return;
    }

    void loadObservationFhirPreview(selectedObservationId);
  }, [selectedObservationId]);

  useEffect(() => {
    if (!selectedMedicationRequestId) {
      setMedicationRequestFhirPreview(undefined);
      return;
    }

    void loadMedicationRequestFhirPreview(selectedMedicationRequestId);
  }, [selectedMedicationRequestId]);

  useEffect(() => {
    if (!selectedMedicationDispenseId) {
      setMedicationDispenseFhirPreview(undefined);
      return;
    }

    void loadMedicationDispenseFhirPreview(selectedMedicationDispenseId);
  }, [selectedMedicationDispenseId]);

  useEffect(() => {
    if (!selectedMedicationAdministrationId) {
      setMedicationAdministrationFhirPreview(undefined);
      return;
    }

    void loadMedicationAdministrationFhirPreview(selectedMedicationAdministrationId);
  }, [selectedMedicationAdministrationId]);

  useEffect(() => {
    if (!selectedServiceRequestId) {
      setServiceRequestFhirPreview(undefined);
      return;
    }

    void loadServiceRequestFhirPreview(selectedServiceRequestId);
  }, [selectedServiceRequestId]);

  useEffect(() => {
    if (!selectedWorkflowTaskId) {
      setWorkflowTaskFhirPreview(undefined);
      return;
    }

    void loadWorkflowTaskFhirPreview(selectedWorkflowTaskId);
  }, [selectedWorkflowTaskId]);

  useEffect(() => {
    if (!selectedProcedureId) {
      setProcedureFhirPreview(undefined);
      return;
    }

    void loadProcedureFhirPreview(selectedProcedureId);
  }, [selectedProcedureId]);

  useEffect(() => {
    if (!selectedDiagnosticReportId) {
      setDiagnosticReportFhirPreview(undefined);
      return;
    }

    void loadDiagnosticReportFhirPreview(selectedDiagnosticReportId);
  }, [selectedDiagnosticReportId]);

  useEffect(() => {
    if (!selectedImagingStudyId) {
      setImagingStudyFhirPreview(undefined);
      return;
    }

    void loadImagingStudyFhirPreview(selectedImagingStudyId);
  }, [selectedImagingStudyId]);

  useEffect(() => {
    if (!selectedRecordTransferId) {
      setRecordTransferFhirTaskPreview(undefined);
      setRecordTransferDeliveryAttempts([]);
      return;
    }

    void loadRecordTransferFhirTaskPreview(selectedRecordTransferId);
    void loadRecordTransferDeliveryAttempts(selectedRecordTransferId);
  }, [selectedRecordTransferId]);

  function buildHeaders(
    purposeOfUse: PurposeOfUse,
    headers: Record<string, string> = {}
  ): Record<string, string> {
    if (!authSession) {
      throw new Error("Chưa có phiên đăng nhập hợp lệ.");
    }

    return {
      ...headers,
      Authorization: `Bearer ${authSession.accessToken}`,
      "x-purpose-of-use": purposeOfUse
    };
  }

  async function loadPatients(nextSelectedId?: string) {
    setIsLoadingPatients(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients`, {
        headers: buildHeaders(isAuditOnlySession ? "AUDIT" : "TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as PatientsResponse;
      setPatients(data.items);
      setSelectedPatientId(nextSelectedId ?? selectedPatientId ?? data.items[0]?.id);
      setStatusMessage(`Đã tải ${data.items.length} hồ sơ bệnh nhân từ backend.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải dữ liệu bệnh nhân: ${error.message}`
          : "Không thể tải dữ liệu bệnh nhân."
      );
    } finally {
      setIsLoadingPatients(false);
    }
  }

  async function loadProviderDirectory() {
    setIsLoadingProviderDirectory(true);

    try {
      if (isAuditOnlySession) {
        const response = await fetch(`${apiBaseUrl}/provider-directory`, {
          headers: buildHeaders("AUDIT")
        });

        if (!response.ok) {
          throw new Error(`Provider Directory API trả về HTTP ${response.status}`);
        }

        setProviderDirectory((await response.json()) as ProviderDirectory);
        setProviderDirectoryFhirPreview({
          note: "Phiên kiểm toán chỉ tải danh bạ vận hành; không xuất FHIR Provider Directory."
        });
        return;
      }

      const [directoryResponse, fhirResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/provider-directory`, {
          headers: buildHeaders("TREATMENT")
        }),
        fetch(`${apiBaseUrl}/provider-directory/fhir`, {
          headers: buildHeaders("TREATMENT")
        })
      ]);

      if (!directoryResponse.ok) {
        throw new Error(`Provider Directory API trả về HTTP ${directoryResponse.status}`);
      }

      if (!fhirResponse.ok) {
        throw new Error(`Provider Directory FHIR API trả về HTTP ${fhirResponse.status}`);
      }

      setProviderDirectory((await directoryResponse.json()) as ProviderDirectory);
      setProviderDirectoryFhirPreview(await fhirResponse.json());
    } catch (error) {
      setProviderDirectory(undefined);
      setProviderDirectoryFhirPreview({
        error:
          error instanceof Error
            ? `Không thể tải Provider Directory: ${error.message}`
            : "Không thể tải Provider Directory."
      });
    } finally {
      setIsLoadingProviderDirectory(false);
    }
  }

  async function loadCapabilityStatement() {
    try {
      const response = await fetch(`${apiBaseUrl}/fhir/metadata`);

      if (!response.ok) {
        throw new Error(`FHIR metadata API trả về HTTP ${response.status}`);
      }

      setCapabilityStatementPreview(await response.json());
    } catch (error) {
      setCapabilityStatementPreview({
        error:
          error instanceof Error
            ? `Không thể tải FHIR CapabilityStatement: ${error.message}`
            : "Không thể tải FHIR CapabilityStatement."
      });
    }
  }

  async function loadPatientWorkspace(patientId: string) {
    if (isAuditOnlySession) {
      await loadAuditEvents(patientId, { silent: true });
      return;
    }

    const workspaceTasks = [
      loadPatientFhirPreview(patientId),
      loadPatientFhirBundlePreview(patientId),
      loadPatientFhirDocumentBundlePreview(patientId),
      loadEncounters(patientId),
      loadAllergyIntolerances(patientId),
      loadConditions(patientId),
      loadObservations(patientId),
      loadMedicationRequests(patientId),
      loadMedicationDispenses(patientId),
      loadMedicationAdministrations(patientId),
      loadServiceRequests(patientId),
      loadWorkflowTasks(patientId),
      loadProcedures(patientId),
      loadDiagnosticReports(patientId),
      loadImagingStudies(patientId),
      loadClinicalDocuments(patientId),
      loadConsents(patientId),
      loadConsentFhirPreview(defaultTransferContext.consentReference),
      loadRecordTransfers(patientId)
    ];

    if (canReadAudit) {
      workspaceTasks.push(loadAuditEvents(patientId, { silent: true }));
    } else {
      setAuditEvents([]);
      setAuditIntegrityReport(undefined);
    }

    await Promise.all(workspaceTasks);
  }

  async function loadEncounters(patientId: string, nextSelectedEncounterId?: string) {
    setIsLoadingEncounters(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/encounters`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as EncountersResponse;
      setEncounters(data.items);
      setSelectedEncounterId(nextSelectedEncounterId ?? data.items[0]?.id);
    } catch (error) {
      setEncounters([]);
      setSelectedEncounterId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải lượt khám: ${error.message}`
          : "Không thể tải lượt khám."
      );
    } finally {
      setIsLoadingEncounters(false);
    }
  }

  async function loadClinicalDocuments(patientId: string, nextSelectedDocumentId?: string) {
    setIsLoadingDocuments(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/documents`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ClinicalDocumentsResponse;
      setClinicalDocuments(data.items);
      setSelectedDocumentId(nextSelectedDocumentId ?? data.items[0]?.id);
    } catch (error) {
      setClinicalDocuments([]);
      setSelectedDocumentId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải tài liệu bệnh án: ${error.message}`
          : "Không thể tải tài liệu bệnh án."
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  async function loadAllergyIntolerances(
    patientId: string,
    nextSelectedAllergyIntoleranceId?: string
  ) {
    setIsLoadingAllergyIntolerances(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/allergy-intolerances`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as AllergyIntolerancesResponse;
      setAllergyIntolerances(data.items);
      setSelectedAllergyIntoleranceId(nextSelectedAllergyIntoleranceId ?? data.items[0]?.id);
    } catch (error) {
      setAllergyIntolerances([]);
      setSelectedAllergyIntoleranceId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải dị ứng/cảnh báo: ${error.message}`
          : "Không thể tải dị ứng/cảnh báo."
      );
    } finally {
      setIsLoadingAllergyIntolerances(false);
    }
  }

  async function loadConditions(patientId: string, nextSelectedConditionId?: string) {
    setIsLoadingConditions(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/conditions`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ConditionsResponse;
      setConditions(data.items);
      setSelectedConditionId(nextSelectedConditionId ?? data.items[0]?.id);
    } catch (error) {
      setConditions([]);
      setSelectedConditionId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chẩn đoán/vấn đề sức khỏe: ${error.message}`
          : "Không thể tải chẩn đoán/vấn đề sức khỏe."
      );
    } finally {
      setIsLoadingConditions(false);
    }
  }

  async function loadObservations(patientId: string, nextSelectedObservationId?: string) {
    setIsLoadingObservations(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/observations`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ObservationsResponse;
      setObservations(data.items);
      setSelectedObservationId(nextSelectedObservationId ?? data.items[0]?.id);
    } catch (error) {
      setObservations([]);
      setSelectedObservationId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ số lâm sàng: ${error.message}`
          : "Không thể tải chỉ số lâm sàng."
      );
    } finally {
      setIsLoadingObservations(false);
    }
  }

  async function loadMedicationRequests(
    patientId: string,
    nextSelectedMedicationRequestId?: string
  ) {
    setIsLoadingMedicationRequests(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/medication-requests`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as MedicationRequestsResponse;
      setMedicationRequests(data.items);
      setSelectedMedicationRequestId(nextSelectedMedicationRequestId ?? data.items[0]?.id);
    } catch (error) {
      setMedicationRequests([]);
      setSelectedMedicationRequestId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ định thuốc: ${error.message}`
          : "Không thể tải chỉ định thuốc."
      );
    } finally {
      setIsLoadingMedicationRequests(false);
    }
  }

  async function loadMedicationDispenses(
    patientId: string,
    nextSelectedMedicationDispenseId?: string
  ) {
    setIsLoadingMedicationDispenses(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/patients/${patientId}/medication-dispenses`,
        {
          headers: buildHeaders("TREATMENT")
        }
      );

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as MedicationDispensesResponse;
      setMedicationDispenses(data.items);
      setSelectedMedicationDispenseId(
        nextSelectedMedicationDispenseId ?? data.items[0]?.id
      );
    } catch (error) {
      setMedicationDispenses([]);
      setSelectedMedicationDispenseId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải cấp phát thuốc: ${error.message}`
          : "Không thể tải cấp phát thuốc."
      );
    } finally {
      setIsLoadingMedicationDispenses(false);
    }
  }

  async function loadMedicationAdministrations(
    patientId: string,
    nextSelectedMedicationAdministrationId?: string
  ) {
    setIsLoadingMedicationAdministrations(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/patients/${patientId}/medication-administrations`,
        {
          headers: buildHeaders("TREATMENT")
        }
      );

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as MedicationAdministrationsResponse;
      setMedicationAdministrations(data.items);
      setSelectedMedicationAdministrationId(
        nextSelectedMedicationAdministrationId ?? data.items[0]?.id
      );
    } catch (error) {
      setMedicationAdministrations([]);
      setSelectedMedicationAdministrationId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải lần dùng thuốc: ${error.message}`
          : "Không thể tải lần dùng thuốc."
      );
    } finally {
      setIsLoadingMedicationAdministrations(false);
    }
  }

  async function loadServiceRequests(
    patientId: string,
    nextSelectedServiceRequestId?: string
  ) {
    setIsLoadingServiceRequests(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/service-requests`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ServiceRequestsResponse;
      setServiceRequests(data.items);
      setSelectedServiceRequestId(nextSelectedServiceRequestId ?? data.items[0]?.id);
    } catch (error) {
      setServiceRequests([]);
      setSelectedServiceRequestId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ định dịch vụ: ${error.message}`
          : "Không thể tải chỉ định dịch vụ."
      );
    } finally {
      setIsLoadingServiceRequests(false);
    }
  }

  async function loadWorkflowTasks(patientId: string, nextSelectedWorkflowTaskId?: string) {
    setIsLoadingWorkflowTasks(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/workflow-tasks`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as WorkflowTasksResponse;
      setWorkflowTasks(data.items);
      setSelectedWorkflowTaskId(nextSelectedWorkflowTaskId ?? data.items[0]?.id);
    } catch (error) {
      setWorkflowTasks([]);
      setSelectedWorkflowTaskId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải hàng đợi công việc: ${error.message}`
          : "Không thể tải hàng đợi công việc."
      );
    } finally {
      setIsLoadingWorkflowTasks(false);
    }
  }

  async function loadProcedures(patientId: string, nextSelectedProcedureId?: string) {
    setIsLoadingProcedures(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/procedures`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ProceduresResponse;
      setProcedures(data.items);
      setSelectedProcedureId(nextSelectedProcedureId ?? data.items[0]?.id);
    } catch (error) {
      setProcedures([]);
      setSelectedProcedureId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải thủ thuật/hoạt động đã thực hiện: ${error.message}`
          : "Không thể tải thủ thuật/hoạt động đã thực hiện."
      );
    } finally {
      setIsLoadingProcedures(false);
    }
  }

  async function loadDiagnosticReports(
    patientId: string,
    nextSelectedDiagnosticReportId?: string
  ) {
    setIsLoadingDiagnosticReports(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/diagnostic-reports`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as DiagnosticReportsResponse;
      setDiagnosticReports(data.items);
      setSelectedDiagnosticReportId(nextSelectedDiagnosticReportId ?? data.items[0]?.id);
    } catch (error) {
      setDiagnosticReports([]);
      setSelectedDiagnosticReportId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải báo cáo kết quả: ${error.message}`
          : "Không thể tải báo cáo kết quả."
      );
    } finally {
      setIsLoadingDiagnosticReports(false);
    }
  }

  async function loadImagingStudies(patientId: string, nextSelectedImagingStudyId?: string) {
    setIsLoadingImagingStudies(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/imaging-studies`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ImagingStudiesResponse;
      setImagingStudies(data.items);
      setSelectedImagingStudyId(nextSelectedImagingStudyId ?? data.items[0]?.id);
    } catch (error) {
      setImagingStudies([]);
      setSelectedImagingStudyId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải nghiên cứu hình ảnh/PACS: ${error.message}`
          : "Không thể tải nghiên cứu hình ảnh/PACS."
      );
    } finally {
      setIsLoadingImagingStudies(false);
    }
  }

  async function loadAuditEvents(patientId: string, options: { readonly silent?: boolean } = {}) {
    if (!canReadAudit) {
      setAuditEvents([]);
      setAuditIntegrityReport(undefined);
      setAuditFhirBundlePreview(undefined);

      if (!options.silent) {
        setStatusMessage("Nhật ký kiểm toán chỉ mở cho vai trò kiểm toán hoặc quản trị.");
      }

      return;
    }

    setIsLoadingAuditEvents(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/audit-events`, {
        headers: buildHeaders("AUDIT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as AuditEventsResponse;
      setAuditEvents(data.items);
    } catch (error) {
      setAuditEvents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải nhật ký kiểm toán: ${error.message}`
          : "Không thể tải nhật ký kiểm toán."
      );
    } finally {
      setIsLoadingAuditEvents(false);
    }
  }

  async function loadGlobalAuditEvents(options: { readonly silent?: boolean } = {}) {
    if (!canReadAudit) {
      setGlobalAuditEvents([]);

      if (!options.silent) {
        setStatusMessage("Nhật ký bảo mật toàn hệ thống chỉ mở cho kiểm toán viên hoặc quản trị viên.");
      }

      return;
    }

    setIsLoadingGlobalAuditEvents(true);

    try {
      const response = await fetch(`${apiBaseUrl}/audit-events?limit=100`, {
        headers: buildHeaders("AUDIT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as AuditEventsResponse;
      setGlobalAuditEvents(data.items);

      if (!options.silent) {
        setStatusMessage(`Đã tải ${data.items.length} bản ghi kiểm toán toàn hệ thống.`);
      }
    } catch (error) {
      setGlobalAuditEvents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải nhật ký bảo mật toàn hệ thống: ${error.message}`
          : "Không thể tải nhật ký bảo mật toàn hệ thống."
      );
    } finally {
      setIsLoadingGlobalAuditEvents(false);
    }
  }

  async function verifyAuditIntegrity(
    patientId: string,
    options: { readonly silent?: boolean } = {}
  ) {
    if (!canReadAudit) {
      setAuditIntegrityReport(undefined);

      if (!options.silent) {
        setStatusMessage("Kiểm tra toàn vẹn audit chỉ mở cho vai trò kiểm toán hoặc quản trị.");
      }

      return;
    }

    setIsVerifyingAuditIntegrity(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/audit-integrity`, {
        headers: buildHeaders("AUDIT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as AuditIntegrityReportResponse;
      setAuditIntegrityReport(data);

      if (!options.silent) {
        setStatusMessage(
          data.verified
            ? "Chuỗi audit đã được xác minh toàn vẹn."
            : `Chuỗi audit cần kiểm tra: ${formatAuditIntegrityReason(data.brokenReason)}.`
        );
      }
    } catch (error) {
      setAuditIntegrityReport(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể kiểm tra toàn vẹn audit: ${error.message}`
          : "Không thể kiểm tra toàn vẹn audit."
      );
    } finally {
      setIsVerifyingAuditIntegrity(false);
    }
  }

  async function loadAuditFhirBundle(patientId: string) {
    if (!canReadAudit) {
      setAuditFhirBundlePreview(undefined);
      setStatusMessage("Xuất FHIR AuditEvent chỉ mở cho vai trò kiểm toán hoặc quản trị.");
      return;
    }

    setIsExportingAuditFhir(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/audit-events/fhir-bundle`, {
        headers: buildHeaders("AUDIT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setAuditFhirBundlePreview(await response.json());
      setStatusMessage("Đã xuất FHIR AuditEvent Bundle cho nhật ký kiểm toán.");
    } catch (error) {
      setAuditFhirBundlePreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR AuditEvent Bundle: ${error.message}`
            : "Không thể xuất FHIR AuditEvent Bundle."
      });
    } finally {
      setIsExportingAuditFhir(false);
    }
  }

  async function loadConsents(patientId: string) {
    setIsLoadingConsents(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/consents`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ConsentsResponse;
      setConsents(data.items);
    } catch (error) {
      setConsents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải đồng ý chia sẻ hồ sơ: ${error.message}`
          : "Không thể tải đồng ý chia sẻ hồ sơ."
      );
    } finally {
      setIsLoadingConsents(false);
    }
  }

  async function handleRevokeConsent(consent: Consent) {
    if (!selectedPatient) {
      return;
    }

    setRevokingConsentId(consent.id);

    try {
      const response = await fetch(
        `${apiBaseUrl}/patients/${selectedPatient.id}/consents/${consent.id}/revoke`,
        {
          method: "POST",
          headers: buildHeaders("TREATMENT", {
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({
            reason: "Thu hồi theo yêu cầu người bệnh trong phiên demo."
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const revokedConsent = (await response.json()) as Consent;
      await loadConsents(selectedPatient.id);
      await loadConsentFhirPreview(revokedConsent.id);
      setStatusMessage(`Đã thu hồi consent ${revokedConsent.id}; các lần xuất/chuyển hồ sơ mới sẽ bị chặn nếu dùng consent này.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể thu hồi consent: ${error.message}`
          : "Không thể thu hồi consent."
      );
    } finally {
      setRevokingConsentId(undefined);
    }
  }

  async function loadRecordTransfers(
    patientId: string,
    nextSelectedRecordTransferId?: string
  ) {
    setIsLoadingRecordTransfers(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/record-transfers`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as RecordTransfersResponse;
      setRecordTransfers(data.items);
      setSelectedRecordTransferId(
        nextSelectedRecordTransferId ?? selectedRecordTransferId ?? data.items[0]?.id
      );
    } catch (error) {
      setRecordTransfers([]);
      setSelectedRecordTransferId(undefined);
      setRecordTransferDeliveryAttempts([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải gói chuyển hồ sơ: ${error.message}`
          : "Không thể tải gói chuyển hồ sơ."
      );
    } finally {
      setIsLoadingRecordTransfers(false);
    }
  }

  async function loadRecordTransferFhirTaskPreview(recordTransferId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/record-transfers/${recordTransferId}/fhir-task`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setRecordTransferFhirTaskPreview(await response.json());
    } catch (error) {
      setRecordTransferFhirTaskPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Task chuyển hồ sơ: ${error.message}`
            : "Không thể xuất FHIR Task chuyển hồ sơ."
      });
    }
  }

  async function loadRecordTransferDeliveryAttempts(recordTransferId: string) {
    setIsLoadingRecordTransferDeliveryAttempts(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/record-transfers/${recordTransferId}/delivery-attempts`,
        {
          headers: buildHeaders("TREATMENT")
        }
      );

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as RecordTransferDeliveryAttemptsResponse;
      setRecordTransferDeliveryAttempts(data.items);
    } catch (error) {
      setRecordTransferDeliveryAttempts([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải lịch sử gửi hồ sơ: ${error.message}`
          : "Không thể tải lịch sử gửi hồ sơ."
      );
    } finally {
      setIsLoadingRecordTransferDeliveryAttempts(false);
    }
  }

  async function loadConsentFhirPreview(consentId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/consents/${consentId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setConsentFhirPreview(await response.json());
    } catch (error) {
      setConsentFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Consent: ${error.message}`
            : "Không thể xuất FHIR Consent."
      });
    }
  }

  async function loadPatientFhirPreview(patientId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setPatientFhirPreview(await response.json());
    } catch (error) {
      setPatientFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Patient: ${error.message}`
            : "Không thể xuất FHIR Patient."
      });
    }
  }

  async function loadPatientFhirBundlePreview(patientId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/fhir-bundle`, {
        headers: buildHeaders("TREATMENT", {
          "x-consent-reference": defaultTransferContext.consentReference,
          "x-recipient-organization-id": defaultTransferContext.recipientOrganizationId
        })
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setPatientFhirBundlePreview(await response.json());
    } catch (error) {
      setPatientFhirBundlePreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Bundle hồ sơ bệnh nhân: ${error.message}`
            : "Không thể xuất FHIR Bundle hồ sơ bệnh nhân."
      });
    }
  }

  async function loadPatientFhirDocumentBundlePreview(patientId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/fhir-document-bundle`, {
        headers: buildHeaders("TREATMENT", {
          "x-consent-reference": defaultTransferContext.consentReference,
          "x-recipient-organization-id": defaultTransferContext.recipientOrganizationId
        })
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setPatientFhirDocumentBundlePreview(await response.json());
    } catch (error) {
      setPatientFhirDocumentBundlePreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR document Bundle hồ sơ bệnh nhân: ${error.message}`
            : "Không thể xuất FHIR document Bundle hồ sơ bệnh nhân."
      });
    }
  }

  async function loadEncounterFhirPreview(encounterId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/encounters/${encounterId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setEncounterFhirPreview(await response.json());
    } catch (error) {
      setEncounterFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Encounter: ${error.message}`
            : "Không thể xuất FHIR Encounter."
      });
    }
  }

  async function loadDocumentFhirPreview(documentId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/clinical-documents/${documentId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setDocumentFhirPreview(await response.json());
    } catch (error) {
      setDocumentFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR DocumentReference: ${error.message}`
            : "Không thể xuất FHIR DocumentReference."
      });
    }
  }

  async function loadDocumentProvenanceFhirPreview(documentId: string) {
    try {
      const response = await fetch(
        `${apiBaseUrl}/clinical-documents/${documentId}/fhir-provenance`,
        {
          headers: buildHeaders("TREATMENT")
        }
      );

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setDocumentProvenanceFhirPreview(await response.json());
    } catch (error) {
      setDocumentProvenanceFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Provenance: ${error.message}`
            : "Không thể xuất FHIR Provenance."
      });
    }
  }

  async function loadConditionFhirPreview(conditionId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/conditions/${conditionId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setConditionFhirPreview(await response.json());
    } catch (error) {
      setConditionFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Condition: ${error.message}`
            : "Không thể xuất FHIR Condition."
      });
    }
  }

  async function loadAllergyIntoleranceFhirPreview(allergyIntoleranceId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/allergy-intolerances/${allergyIntoleranceId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setAllergyIntoleranceFhirPreview(await response.json());
    } catch (error) {
      setAllergyIntoleranceFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR AllergyIntolerance: ${error.message}`
            : "Không thể xuất FHIR AllergyIntolerance."
      });
    }
  }

  async function loadObservationFhirPreview(observationId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/observations/${observationId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setObservationFhirPreview(await response.json());
    } catch (error) {
      setObservationFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Observation: ${error.message}`
            : "Không thể xuất FHIR Observation."
      });
    }
  }

  async function loadMedicationRequestFhirPreview(medicationRequestId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/medication-requests/${medicationRequestId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setMedicationRequestFhirPreview(await response.json());
    } catch (error) {
      setMedicationRequestFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR MedicationRequest: ${error.message}`
            : "Không thể xuất FHIR MedicationRequest."
      });
    }
  }

  async function loadMedicationDispenseFhirPreview(medicationDispenseId: string) {
    try {
      const response = await fetch(
        `${apiBaseUrl}/medication-dispenses/${medicationDispenseId}/fhir`,
        {
          headers: buildHeaders("TREATMENT")
        }
      );

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setMedicationDispenseFhirPreview(await response.json());
    } catch (error) {
      setMedicationDispenseFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR MedicationDispense: ${error.message}`
            : "Không thể xuất FHIR MedicationDispense."
      });
    }
  }

  async function loadMedicationAdministrationFhirPreview(
    medicationAdministrationId: string
  ) {
    try {
      const response = await fetch(
        `${apiBaseUrl}/medication-administrations/${medicationAdministrationId}/fhir`,
        {
          headers: buildHeaders("TREATMENT")
        }
      );

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setMedicationAdministrationFhirPreview(await response.json());
    } catch (error) {
      setMedicationAdministrationFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR MedicationAdministration: ${error.message}`
            : "Không thể xuất FHIR MedicationAdministration."
      });
    }
  }

  async function loadServiceRequestFhirPreview(serviceRequestId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/service-requests/${serviceRequestId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setServiceRequestFhirPreview(await response.json());
    } catch (error) {
      setServiceRequestFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR ServiceRequest: ${error.message}`
            : "Không thể xuất FHIR ServiceRequest."
      });
    }
  }

  async function loadWorkflowTaskFhirPreview(taskId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/workflow-tasks/${taskId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setWorkflowTaskFhirPreview(await response.json());
    } catch (error) {
      setWorkflowTaskFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Task: ${error.message}`
            : "Không thể xuất FHIR Task."
      });
    }
  }

  async function loadProcedureFhirPreview(procedureId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/procedures/${procedureId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setProcedureFhirPreview(await response.json());
    } catch (error) {
      setProcedureFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Procedure: ${error.message}`
            : "Không thể xuất FHIR Procedure."
      });
    }
  }

  async function loadDiagnosticReportFhirPreview(diagnosticReportId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/diagnostic-reports/${diagnosticReportId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setDiagnosticReportFhirPreview(await response.json());
    } catch (error) {
      setDiagnosticReportFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR DiagnosticReport: ${error.message}`
            : "Không thể xuất FHIR DiagnosticReport."
      });
    }
  }

  async function loadImagingStudyFhirPreview(imagingStudyId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/imaging-studies/${imagingStudyId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setImagingStudyFhirPreview(await response.json());
    } catch (error) {
      setImagingStudyFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR ImagingStudy: ${error.message}`
            : "Không thể xuất FHIR ImagingStudy."
      });
    }
  }

  async function handleLogin(event?: FormEvent<HTMLFormElement>) {
    const shouldOpenLoginOnFailure = !event;

    event?.preventDefault();

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError("Vui lòng nhập tài khoản và mật khẩu demo.");
      return;
    }

    try {
      setLoginError(undefined);
      setStatusMessage("Đang xác thực phiên đăng nhập...");

      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginForm)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const session = (await response.json()) as AuthSession;
      setAuthSession(session);
      setIsAuthenticated(true);
      setAppRoute(session.actor.role === "auditor" ? "audit" : "dashboard");
      setStatusMessage(
        `Đã đăng nhập ${session.actor.displayName}; phiên hết hạn ${formatDateTime(session.expiresAt)}.`
      );
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Không thể đăng nhập phiên demo."
      );
      setStatusMessage("Đăng nhập thất bại.");

      if (shouldOpenLoginOnFailure) {
        setAppRoute("login");
      }
    }
  }

  function handleLogout() {
    setAuthSession(undefined);
    setIsAuthenticated(false);
    setAppRoute("landing");
    setStatusMessage("Đã đăng xuất khỏi phiên demo.");
    setPatients([]);
    setEncounters([]);
    setClinicalDocuments([]);
    setAllergyIntolerances([]);
    setConditions([]);
    setObservations([]);
    setMedicationRequests([]);
    setMedicationDispenses([]);
    setMedicationAdministrations([]);
    setServiceRequests([]);
    setWorkflowTasks([]);
    setProcedures([]);
    setDiagnosticReports([]);
    setImagingStudies([]);
    setAuditEvents([]);
    setGlobalAuditEvents([]);
    setAuditIntegrityReport(undefined);
    setConsents([]);
    setRecordTransfers([]);
    setRecordTransferDeliveryAttempts([]);
    setProviderDirectory(undefined);
    setPatientFhirPreview(undefined);
    setPatientFhirBundlePreview(undefined);
    setPatientFhirDocumentBundlePreview(undefined);
    setCapabilityStatementPreview(undefined);
    setProviderDirectoryFhirPreview(undefined);
    setEncounterFhirPreview(undefined);
    setDocumentFhirPreview(undefined);
    setAllergyIntoleranceFhirPreview(undefined);
    setConditionFhirPreview(undefined);
    setObservationFhirPreview(undefined);
    setMedicationRequestFhirPreview(undefined);
    setMedicationDispenseFhirPreview(undefined);
    setMedicationAdministrationFhirPreview(undefined);
    setServiceRequestFhirPreview(undefined);
    setWorkflowTaskFhirPreview(undefined);
    setProcedureFhirPreview(undefined);
    setDiagnosticReportFhirPreview(undefined);
    setImagingStudyFhirPreview(undefined);
    setRecordTransferFhirTaskPreview(undefined);
    setSelectedPatientId(undefined);
    setSelectedEncounterId(undefined);
    setSelectedDocumentId(undefined);
    setSelectedAllergyIntoleranceId(undefined);
    setSelectedConditionId(undefined);
    setSelectedObservationId(undefined);
    setSelectedMedicationRequestId(undefined);
    setSelectedMedicationDispenseId(undefined);
    setSelectedMedicationAdministrationId(undefined);
    setSelectedServiceRequestId(undefined);
    setSelectedWorkflowTaskId(undefined);
    setSelectedProcedureId(undefined);
    setSelectedDiagnosticReportId(undefined);
    setSelectedImagingStudyId(undefined);
    setSelectedRecordTransferId(undefined);
    setTransitioningRecordTransferId(undefined);
  }

  async function handleCreatePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingPatient(true);

    const identifiers: PatientIdentifier[] = [
      {
        system: "urn:gov:vietnam:national-id",
        value: patientForm.nationalId,
        type: "national-id"
      },
      {
        system: "urn:benh-vien-so:mrn",
        value: patientForm.hospitalMrn,
        type: "hospital-mrn"
      }
    ];

    try {
      const response = await fetch(`${apiBaseUrl}/patients`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          identifiers,
          fullName: patientForm.fullName,
          birthDate: patientForm.birthDate || undefined,
          gender: patientForm.gender,
          address: patientForm.address || undefined,
          phone: patientForm.phone || undefined,
          managingOrganizationId: patientForm.managingOrganizationId
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdPatient = (await response.json()) as Patient;
      await loadPatients(createdPatient.id);
      setAppRoute("workspace");
      setStatusMessage(`Đã tạo hồ sơ ${createdPatient.fullName} và chọn ngay trên workspace.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo hồ sơ bệnh nhân: ${error.message}`
          : "Không thể tạo hồ sơ bệnh nhân."
      );
    } finally {
      setIsSubmittingPatient(false);
    }
  }

  async function handleCreateRecordTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo gói chuyển hồ sơ.");
      return;
    }

    setIsSubmittingRecordTransfer(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/record-transfers`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          priority: recordTransferForm.priority,
          bundleType: recordTransferForm.bundleType,
          sourceOrganizationId: recordTransferForm.sourceOrganizationId,
          recipientOrganizationId: recordTransferForm.recipientOrganizationId,
          consentReference: recordTransferForm.consentReference,
          reason: recordTransferForm.reason,
          note: recordTransferForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdTransfer = (await response.json()) as RecordTransfer;
      await loadRecordTransfers(selectedPatient.id, createdTransfer.id);
      setStatusMessage(
        `Đã tạo gói chuyển hồ sơ ${createdTransfer.id} cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo gói chuyển hồ sơ: ${error.message}`
          : "Không thể tạo gói chuyển hồ sơ."
      );
    } finally {
      setIsSubmittingRecordTransfer(false);
    }
  }

  async function handleSendRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi gửi gói chuyển hồ sơ.");
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const response = await fetch(`${apiBaseUrl}/record-transfers/${recordTransfer.id}/send`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          note: "Đã gửi gói hồ sơ qua gateway liên thông demo."
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const updatedTransfer = (await response.json()) as RecordTransfer;
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã gửi gói chuyển hồ sơ ${updatedTransfer.id}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể gửi gói chuyển hồ sơ: ${error.message}`
          : "Không thể gửi gói chuyển hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleReceiveRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi xác nhận tiếp nhận hồ sơ.");
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const response = await fetch(`${apiBaseUrl}/record-transfers/${recordTransfer.id}/receive`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          note: "Bệnh viện nhận đã xác nhận tiếp nhận qua giao diện demo."
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const updatedTransfer = (await response.json()) as RecordTransfer;
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã xác nhận bệnh viện nhận tiếp nhận gói ${updatedTransfer.id}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể xác nhận tiếp nhận hồ sơ: ${error.message}`
          : "Không thể xác nhận tiếp nhận hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleFailRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận lỗi chuyển hồ sơ.");
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const response = await fetch(`${apiBaseUrl}/record-transfers/${recordTransfer.id}/fail`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          failureReason: "Gateway liên thông demo tạm thời không phản hồi.",
          note: "Đã ghi nhận lỗi gửi để thử lại sau."
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const updatedTransfer = (await response.json()) as RecordTransfer;
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã ghi nhận lỗi gửi gói chuyển hồ sơ ${updatedTransfer.id}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận lỗi chuyển hồ sơ: ${error.message}`
          : "Không thể ghi nhận lỗi chuyển hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleRetryRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi thử gửi lại hồ sơ.");
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const response = await fetch(`${apiBaseUrl}/record-transfers/${recordTransfer.id}/retry`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          note: "Đưa lại gói hồ sơ vào hàng đợi gửi."
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const updatedTransfer = (await response.json()) as RecordTransfer;
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã đưa gói chuyển hồ sơ ${updatedTransfer.id} về hàng đợi gửi lại.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể thử gửi lại hồ sơ: ${error.message}`
          : "Không thể thử gửi lại hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleCreateEncounter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi mở lượt khám.");
      return;
    }

    setIsSubmittingEncounter(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/encounters`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          class: encounterForm.class,
          serviceType: encounterForm.serviceType,
          reasonText: encounterForm.reasonText,
          departmentId: encounterForm.departmentId || undefined,
          attendingPractitionerId: encounterForm.attendingPractitionerId,
          startedAt: toApiDateTime(encounterForm.startedAt)
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdEncounter = (await response.json()) as Encounter;
      await loadEncounters(selectedPatient.id, createdEncounter.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã mở lượt khám "${createdEncounter.serviceType}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể mở lượt khám: ${error.message}`
          : "Không thể mở lượt khám."
      );
    } finally {
      setIsSubmittingEncounter(false);
    }
  }

  async function handleFinishEncounter(encounterId: string) {
    if (!selectedPatient) {
      return;
    }

    setIsFinishingEncounter(true);

    try {
      const response = await fetch(`${apiBaseUrl}/encounters/${encounterId}/finish`, {
        method: "POST",
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const finishedEncounter = (await response.json()) as Encounter;
      await loadEncounters(selectedPatient.id, finishedEncounter.id);
      await loadEncounterFhirPreview(finishedEncounter.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setStatusMessage(`Đã kết thúc lượt khám "${finishedEncounter.serviceType}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể kết thúc lượt khám: ${error.message}`
          : "Không thể kết thúc lượt khám."
      );
    } finally {
      setIsFinishingEncounter(false);
    }
  }

  async function handleCreateAllergyIntolerance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận dị ứng/cảnh báo.");
      return;
    }

    const hasReaction =
      allergyIntoleranceForm.manifestationCode.trim() ||
      allergyIntoleranceForm.manifestationDisplay.trim() ||
      allergyIntoleranceForm.reactionDescription.trim();

    setIsSubmittingAllergyIntolerance(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/allergy-intolerances`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: allergyIntoleranceForm.encounterId || undefined,
          clinicalStatus: allergyIntoleranceForm.clinicalStatus,
          verificationStatus: allergyIntoleranceForm.verificationStatus,
          type: allergyIntoleranceForm.type,
          category: allergyIntoleranceForm.category,
          criticality: allergyIntoleranceForm.criticality || undefined,
          code: {
            system: allergyIntoleranceForm.codeSystem,
            code: allergyIntoleranceForm.code,
            display: allergyIntoleranceForm.codeDisplay
          },
          reaction: hasReaction
            ? {
                manifestation: {
                  system: allergyIntoleranceForm.manifestationSystem,
                  code: allergyIntoleranceForm.manifestationCode,
                  display: allergyIntoleranceForm.manifestationDisplay
                },
                severity: allergyIntoleranceForm.reactionSeverity || undefined,
                description: allergyIntoleranceForm.reactionDescription || undefined
              }
            : undefined,
          recordedAt: allergyIntoleranceForm.recordedAt
            ? toApiDateTime(allergyIntoleranceForm.recordedAt)
            : undefined,
          recorderPractitionerId: allergyIntoleranceForm.recorderPractitionerId,
          note: allergyIntoleranceForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdAllergyIntolerance = (await response.json()) as AllergyIntolerance;
      await loadAllergyIntolerances(selectedPatient.id, createdAllergyIntolerance.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận dị ứng/cảnh báo "${createdAllergyIntolerance.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận dị ứng/cảnh báo: ${error.message}`
          : "Không thể ghi nhận dị ứng/cảnh báo."
      );
    } finally {
      setIsSubmittingAllergyIntolerance(false);
    }
  }

  async function handleCreateCondition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận chẩn đoán.");
      return;
    }

    setIsSubmittingCondition(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/conditions`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: conditionForm.encounterId || undefined,
          clinicalStatus: conditionForm.clinicalStatus,
          verificationStatus: conditionForm.verificationStatus,
          category: conditionForm.category,
          code: {
            system: conditionForm.codeSystem,
            code: conditionForm.code,
            display: conditionForm.codeDisplay
          },
          severity: conditionForm.severity || undefined,
          onsetAt: conditionForm.onsetAt ? toApiDateTime(conditionForm.onsetAt) : undefined,
          recorderPractitionerId: conditionForm.recorderPractitionerId,
          note: conditionForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdCondition = (await response.json()) as Condition;
      await loadConditions(selectedPatient.id, createdCondition.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã ghi nhận chẩn đoán "${createdCondition.code.display}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chẩn đoán: ${error.message}`
          : "Không thể ghi nhận chẩn đoán."
      );
    } finally {
      setIsSubmittingCondition(false);
    }
  }

  async function handleCreateObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận chỉ số lâm sàng.");
      return;
    }

    const numericValue = Number(observationForm.value);

    if (!Number.isFinite(numericValue)) {
      setStatusMessage("Giá trị chỉ số phải là số hợp lệ.");
      return;
    }

    setIsSubmittingObservation(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/observations`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: observationForm.encounterId || undefined,
          category: observationForm.category,
          code: {
            system: observationForm.codeSystem,
            code: observationForm.code,
            display: observationForm.codeDisplay
          },
          effectiveAt: toApiDateTime(observationForm.effectiveAt),
          valueQuantity: {
            value: numericValue,
            unit: observationForm.unit,
            system: observationForm.unitSystem || undefined,
            code: observationForm.unitCode || undefined
          },
          performerPractitionerId: observationForm.performerPractitionerId || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdObservation = (await response.json()) as Observation;
      await loadObservations(selectedPatient.id, createdObservation.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã ghi nhận "${createdObservation.code.display}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chỉ số lâm sàng: ${error.message}`
          : "Không thể ghi nhận chỉ số lâm sàng."
      );
    } finally {
      setIsSubmittingObservation(false);
    }
  }

  async function handleCreateMedicationRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi kê/chỉ định thuốc.");
      return;
    }

    const doseValue = Number(medicationRequestForm.doseValue);
    const frequency = Number(medicationRequestForm.frequency);
    const period = Number(medicationRequestForm.period);
    const expectedSupplyDurationDays = Number(
      medicationRequestForm.expectedSupplyDurationDays
    );

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      setStatusMessage("Liều lượng thuốc phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isFinite(period) || period <= 0) {
      setStatusMessage("Nhịp dùng thuốc phải có tần suất và chu kỳ lớn hơn 0.");
      return;
    }

    if (
      medicationRequestForm.expectedSupplyDurationDays &&
      (!Number.isFinite(expectedSupplyDurationDays) || expectedSupplyDurationDays <= 0)
    ) {
      setStatusMessage("Số ngày cấp thuốc phải là số lớn hơn 0.");
      return;
    }

    setIsSubmittingMedicationRequest(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/medication-requests`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: medicationRequestForm.encounterId || undefined,
          reasonConditionId: medicationRequestForm.reasonConditionId || undefined,
          category: medicationRequestForm.category,
          priority: medicationRequestForm.priority,
          medicationCode: {
            system: medicationRequestForm.medicationSystem,
            code: medicationRequestForm.medicationCode,
            display: medicationRequestForm.medicationDisplay
          },
          dosageInstruction: {
            text: medicationRequestForm.dosageText,
            route: medicationRequestForm.route || undefined,
            doseQuantity: {
              value: doseValue,
              unit: medicationRequestForm.doseUnit,
              system: "http://unitsofmeasure.org",
              code: medicationRequestForm.doseUnit
            },
            frequency,
            period,
            periodUnit: medicationRequestForm.periodUnit
          },
          authoredOn: medicationRequestForm.authoredOn
            ? toApiDateTime(medicationRequestForm.authoredOn)
            : undefined,
          requesterPractitionerId: medicationRequestForm.requesterPractitionerId,
          expectedSupplyDurationDays: medicationRequestForm.expectedSupplyDurationDays
            ? expectedSupplyDurationDays
            : undefined,
          note: medicationRequestForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdMedicationRequest = (await response.json()) as MedicationRequest;
      await loadMedicationRequests(selectedPatient.id, createdMedicationRequest.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận chỉ định thuốc "${createdMedicationRequest.medicationCode.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chỉ định thuốc: ${error.message}`
          : "Không thể ghi nhận chỉ định thuốc."
      );
    } finally {
      setIsSubmittingMedicationRequest(false);
    }
  }

  async function handleCreateMedicationDispense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận cấp phát thuốc.");
      return;
    }

    const quantityValue = Number(medicationDispenseForm.quantityValue);
    const daysSupplyValue = Number(medicationDispenseForm.daysSupplyValue);
    const doseValue = Number(medicationDispenseForm.doseValue);
    const frequency = Number(medicationDispenseForm.frequency);
    const period = Number(medicationDispenseForm.period);

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      setStatusMessage("Số lượng thuốc cấp phát phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(daysSupplyValue) || daysSupplyValue <= 0) {
      setStatusMessage("Số ngày cấp thuốc phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      setStatusMessage("Liều hướng dẫn sau cấp phát phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isFinite(period) || period <= 0) {
      setStatusMessage("Nhịp dùng thuốc sau cấp phát phải có tần suất và chu kỳ lớn hơn 0.");
      return;
    }

    if (!medicationDispenseForm.whenHandedOver) {
      setStatusMessage("Cần nhập thời điểm bàn giao thuốc khi trạng thái là đã hoàn tất.");
      return;
    }

    setIsSubmittingMedicationDispense(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/patients/${selectedPatient.id}/medication-dispenses`,
        {
          method: "POST",
          headers: buildHeaders("TREATMENT", {
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({
            encounterId: medicationDispenseForm.encounterId || undefined,
            medicationRequestId: medicationDispenseForm.medicationRequestId || undefined,
            status: "completed",
            category: medicationDispenseForm.category,
            medicationCode: {
              system: medicationDispenseForm.medicationSystem,
              code: medicationDispenseForm.medicationCode,
              display: medicationDispenseForm.medicationDisplay
            },
            quantity: {
              value: quantityValue,
              unit: medicationDispenseForm.quantityUnit,
              system: "http://unitsofmeasure.org",
              code: medicationDispenseForm.quantityUnit
            },
            daysSupply: {
              value: daysSupplyValue,
              unit: "ngày",
              system: "http://unitsofmeasure.org",
              code: "d"
            },
            whenPrepared: medicationDispenseForm.whenPrepared
              ? toApiDateTime(medicationDispenseForm.whenPrepared)
              : undefined,
            whenHandedOver: toApiDateTime(medicationDispenseForm.whenHandedOver),
            dispenserPractitionerId:
              medicationDispenseForm.dispenserPractitionerId || undefined,
            receiverPractitionerId:
              medicationDispenseForm.receiverPractitionerId || undefined,
            dosageInstruction: {
              text: medicationDispenseForm.dosageText,
              route: medicationDispenseForm.route || undefined,
              doseQuantity: {
                value: doseValue,
                unit: medicationDispenseForm.doseUnit,
                system: "http://unitsofmeasure.org",
                code: medicationDispenseForm.doseUnit
              },
              frequency,
              period,
              periodUnit: medicationDispenseForm.periodUnit
            },
            note: medicationDispenseForm.note || undefined
          })
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdMedicationDispense = (await response.json()) as MedicationDispense;
      await loadMedicationDispenses(selectedPatient.id, createdMedicationDispense.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadPatientFhirDocumentBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận cấp phát thuốc "${createdMedicationDispense.medicationCode.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận cấp phát thuốc: ${error.message}`
          : "Không thể ghi nhận cấp phát thuốc."
      );
    } finally {
      setIsSubmittingMedicationDispense(false);
    }
  }

  async function handleCreateMedicationAdministration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận dùng thuốc thực tế.");
      return;
    }

    const doseValue = Number(medicationAdministrationForm.doseValue);

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      setStatusMessage("Liều dùng thực tế phải là số lớn hơn 0.");
      return;
    }

    if (!medicationAdministrationForm.effectiveStart) {
      setStatusMessage("Cần nhập thời điểm dùng thuốc thực tế.");
      return;
    }

    if (!medicationAdministrationForm.performerActorId.trim()) {
      setStatusMessage("Cần nhập người hoặc thiết bị xác nhận dùng thuốc.");
      return;
    }

    setIsSubmittingMedicationAdministration(true);

    try {
      const response = await fetch(
        `${apiBaseUrl}/patients/${selectedPatient.id}/medication-administrations`,
        {
          method: "POST",
          headers: buildHeaders("TREATMENT", {
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({
            encounterId: medicationAdministrationForm.encounterId || undefined,
            medicationRequestId:
              medicationAdministrationForm.medicationRequestId || undefined,
            reasonConditionId: medicationAdministrationForm.reasonConditionId || undefined,
            status: "completed",
            category: medicationAdministrationForm.category,
            medicationCode: {
              system: medicationAdministrationForm.medicationSystem,
              code: medicationAdministrationForm.medicationCode,
              display: medicationAdministrationForm.medicationDisplay
            },
            effectivePeriod: {
              start: toApiDateTime(medicationAdministrationForm.effectiveStart)
            },
            performers: [
              {
                actorType: medicationAdministrationForm.performerActorType,
                actorId: medicationAdministrationForm.performerActorId,
                function: medicationAdministrationForm.performerFunctionDisplay
                  ? {
                      system:
                        "urn:wiiicare:nexus:medication-admin-performer-function",
                      code: "medication-administration-recorder",
                      display: medicationAdministrationForm.performerFunctionDisplay
                    }
                  : undefined
              }
            ],
            dosage: {
              text: medicationAdministrationForm.dosageText || undefined,
              route: medicationAdministrationForm.routeCode
                ? {
                    system: medicationAdministrationForm.routeSystem,
                    code: medicationAdministrationForm.routeCode,
                    display: medicationAdministrationForm.routeDisplay
                  }
                : undefined,
              doseQuantity: {
                value: doseValue,
                unit: medicationAdministrationForm.doseUnit,
                system: "http://unitsofmeasure.org",
                code: medicationAdministrationForm.doseUnit
              }
            },
            note: medicationAdministrationForm.note || undefined
          })
        }
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdMedicationAdministration =
        (await response.json()) as MedicationAdministration;
      await loadMedicationAdministrations(
        selectedPatient.id,
        createdMedicationAdministration.id
      );
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadPatientFhirDocumentBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận dùng thuốc "${createdMedicationAdministration.medicationCode.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận dùng thuốc thực tế: ${error.message}`
          : "Không thể ghi nhận dùng thuốc thực tế."
      );
    } finally {
      setIsSubmittingMedicationAdministration(false);
    }
  }

  async function handleCreateServiceRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo chỉ định dịch vụ.");
      return;
    }

    setIsSubmittingServiceRequest(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/service-requests`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: serviceRequestForm.encounterId || undefined,
          reasonConditionId: serviceRequestForm.reasonConditionId || undefined,
          category: serviceRequestForm.category,
          priority: serviceRequestForm.priority,
          code: {
            system: serviceRequestForm.codeSystem,
            code: serviceRequestForm.code,
            display: serviceRequestForm.codeDisplay
          },
          occurrenceAt: serviceRequestForm.occurrenceAt
            ? toApiDateTime(serviceRequestForm.occurrenceAt)
            : undefined,
          authoredOn: serviceRequestForm.authoredOn
            ? toApiDateTime(serviceRequestForm.authoredOn)
            : undefined,
          requesterPractitionerId: serviceRequestForm.requesterPractitionerId,
          performerOrganizationId: serviceRequestForm.performerOrganizationId || undefined,
          patientInstruction: serviceRequestForm.patientInstruction || undefined,
          note: serviceRequestForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdServiceRequest = (await response.json()) as ServiceRequest;
      await loadServiceRequests(selectedPatient.id, createdServiceRequest.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã tạo chỉ định dịch vụ "${createdServiceRequest.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo chỉ định dịch vụ: ${error.message}`
          : "Không thể tạo chỉ định dịch vụ."
      );
    } finally {
      setIsSubmittingServiceRequest(false);
    }
  }

  async function handleCreateProcedure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận thủ thuật/hoạt động đã thực hiện.");
      return;
    }

    setIsSubmittingProcedure(true);

    const reportReferences =
      procedureForm.reportReferenceId.trim().length > 0
        ? [
            {
              resourceType: procedureForm.reportReferenceType,
              id: procedureForm.reportReferenceId
            }
          ]
        : [];

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/procedures`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: procedureForm.encounterId || undefined,
          basedOnServiceRequestId: procedureForm.basedOnServiceRequestId || undefined,
          reasonConditionId: procedureForm.reasonConditionId || undefined,
          category: procedureForm.category,
          status: procedureForm.status,
          code: {
            system: procedureForm.codeSystem,
            code: procedureForm.code,
            display: procedureForm.codeDisplay
          },
          performedPeriod:
            procedureForm.performedStart || procedureForm.performedEnd
              ? {
                  start: procedureForm.performedStart
                    ? toApiDateTime(procedureForm.performedStart)
                    : undefined,
                  end: procedureForm.performedEnd
                    ? toApiDateTime(procedureForm.performedEnd)
                    : undefined
                }
              : undefined,
          performers: procedureForm.performerActorId
            ? [
                {
                  actorType: procedureForm.performerActorType,
                  actorId: procedureForm.performerActorId,
                  function:
                    procedureForm.performerFunctionCode && procedureForm.performerFunctionDisplay
                      ? {
                          system: procedureForm.performerFunctionSystem,
                          code: procedureForm.performerFunctionCode,
                          display: procedureForm.performerFunctionDisplay
                        }
                      : undefined,
                  onBehalfOfOrganizationId: procedureForm.onBehalfOfOrganizationId || undefined
                }
              ]
            : [],
          recorderPractitionerId: procedureForm.recorderPractitionerId || undefined,
          asserterPractitionerId: procedureForm.asserterPractitionerId || undefined,
          bodySite:
            procedureForm.bodySiteCode && procedureForm.bodySiteDisplay
              ? {
                  system: procedureForm.bodySiteSystem,
                  code: procedureForm.bodySiteCode,
                  display: procedureForm.bodySiteDisplay
                }
              : undefined,
          outcome:
            procedureForm.outcomeCode && procedureForm.outcomeDisplay
              ? {
                  system: procedureForm.outcomeSystem,
                  code: procedureForm.outcomeCode,
                  display: procedureForm.outcomeDisplay
                }
              : undefined,
          reportReferences,
          note: procedureForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdProcedure = (await response.json()) as Procedure;
      await loadProcedures(selectedPatient.id, createdProcedure.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadPatientFhirDocumentBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận Procedure "${createdProcedure.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận thủ thuật/hoạt động: ${error.message}`
          : "Không thể ghi nhận thủ thuật/hoạt động."
      );
    } finally {
      setIsSubmittingProcedure(false);
    }
  }

  async function handleCreateDiagnosticReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo báo cáo kết quả.");
      return;
    }

    setIsSubmittingDiagnosticReport(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/diagnostic-reports`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: diagnosticReportForm.encounterId || undefined,
          basedOnServiceRequestId: diagnosticReportForm.basedOnServiceRequestId || undefined,
          category: diagnosticReportForm.category,
          code: {
            system: diagnosticReportForm.codeSystem,
            code: diagnosticReportForm.code,
            display: diagnosticReportForm.codeDisplay
          },
          effectiveAt: toApiDateTime(diagnosticReportForm.effectiveAt),
          issuedAt: diagnosticReportForm.issuedAt
            ? toApiDateTime(diagnosticReportForm.issuedAt)
            : undefined,
          performerOrganizationId: diagnosticReportForm.performerOrganizationId || undefined,
          resultsInterpreterPractitionerId:
            diagnosticReportForm.resultsInterpreterPractitionerId || undefined,
          resultObservationIds: diagnosticReportForm.resultObservationIds,
          conclusion: diagnosticReportForm.conclusion || undefined,
          presentedFormUrl: diagnosticReportForm.presentedFormUrl || undefined,
          presentedFormTitle: diagnosticReportForm.presentedFormTitle || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdDiagnosticReport = (await response.json()) as DiagnosticReport;
      await loadDiagnosticReports(selectedPatient.id, createdDiagnosticReport.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã tạo báo cáo kết quả "${createdDiagnosticReport.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo báo cáo kết quả: ${error.message}`
          : "Không thể tạo báo cáo kết quả."
      );
    } finally {
      setIsSubmittingDiagnosticReport(false);
    }
  }

  async function handleCreateImagingStudy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo nghiên cứu hình ảnh.");
      return;
    }

    setIsSubmittingImagingStudy(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/imaging-studies`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: imagingStudyForm.encounterId || undefined,
          basedOnServiceRequestId: imagingStudyForm.basedOnServiceRequestId || undefined,
          diagnosticReportId: imagingStudyForm.diagnosticReportId || undefined,
          studyInstanceUid: imagingStudyForm.studyInstanceUid,
          accessionNumber: imagingStudyForm.accessionNumber || undefined,
          description: imagingStudyForm.description || undefined,
          startedAt: imagingStudyForm.startedAt ? toApiDateTime(imagingStudyForm.startedAt) : undefined,
          referrerPractitionerId: imagingStudyForm.referrerPractitionerId || undefined,
          interpreterPractitionerId: imagingStudyForm.interpreterPractitionerId || undefined,
          endpointId: imagingStudyForm.endpointId || undefined,
          series: [
            {
              uid: imagingStudyForm.seriesUid,
              number: imagingStudyForm.seriesNumber
                ? Number.parseInt(imagingStudyForm.seriesNumber, 10)
                : undefined,
              modality: {
                system: imagingStudyForm.modalitySystem,
                code: imagingStudyForm.modalityCode,
                display: imagingStudyForm.modalityDisplay
              },
              description: imagingStudyForm.seriesDescription || undefined,
              numberOfInstances: imagingStudyForm.numberOfInstances
                ? Number.parseInt(imagingStudyForm.numberOfInstances, 10)
                : undefined,
              bodySite:
                imagingStudyForm.bodySiteCode || imagingStudyForm.bodySiteDisplay
                  ? {
                      system: imagingStudyForm.bodySiteSystem,
                      code: imagingStudyForm.bodySiteCode,
                      display: imagingStudyForm.bodySiteDisplay
                    }
                  : undefined
            }
          ]
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdImagingStudy = (await response.json()) as ImagingStudy;
      await loadImagingStudies(selectedPatient.id, createdImagingStudy.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã tạo nghiên cứu hình ảnh "${createdImagingStudy.description ?? createdImagingStudy.studyInstanceUid}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo nghiên cứu hình ảnh: ${error.message}`
          : "Không thể tạo nghiên cứu hình ảnh."
      );
    } finally {
      setIsSubmittingImagingStudy(false);
    }
  }

  async function handleCreateClinicalDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo tài liệu bệnh án.");
      return;
    }

    setIsSubmittingDocument(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/documents`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: documentForm.encounterId || undefined,
          type: documentForm.type,
          title: documentForm.title,
          storageUri: documentForm.storageUri.replace("/current/", `/${selectedPatient.id}/`),
          attachmentContentType: documentForm.attachmentContentType || undefined,
          attachmentSizeBytes: documentForm.attachmentSizeBytes
            ? Number(documentForm.attachmentSizeBytes)
            : undefined,
          attachmentHashSha1Base64: documentForm.attachmentHashSha1Base64 || undefined,
          attachmentCreatedAt: documentForm.attachmentCreatedAt
            ? toApiDateTime(documentForm.attachmentCreatedAt)
            : undefined,
          authorPractitionerId: documentForm.authorPractitionerId
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdDocument = (await response.json()) as ClinicalDocument;
      await loadClinicalDocuments(selectedPatient.id, createdDocument.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("documents");
      setStatusMessage(`Đã tạo tài liệu "${createdDocument.title}" ở trạng thái nháp.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo tài liệu bệnh án: ${error.message}`
          : "Không thể tạo tài liệu bệnh án."
      );
    } finally {
      setIsSubmittingDocument(false);
    }
  }

  async function handleSignClinicalDocument(documentId: string) {
    setIsSigningDocument(true);

    try {
      const response = await fetch(`${apiBaseUrl}/clinical-documents/${documentId}/sign`, {
        method: "POST",
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const signedDocument = (await response.json()) as ClinicalDocument;
      await loadClinicalDocuments(signedDocument.patientId, signedDocument.id);
      await loadDocumentFhirPreview(signedDocument.id);
      await loadDocumentProvenanceFhirPreview(signedDocument.id);
      await loadAuditEvents(signedDocument.patientId, { silent: true });
      setStatusMessage(`Đã ký tài liệu "${signedDocument.title}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ký tài liệu bệnh án: ${error.message}`
          : "Không thể ký tài liệu bệnh án."
      );
    } finally {
      setIsSigningDocument(false);
    }
  }

  if (!isAuthenticated) {
    if (appRoute === "login") {
      return (
        <LoginPage
          form={loginForm}
          error={loginError}
          onBack={() => setAppRoute("landing")}
          onChange={setLoginForm}
          onSubmit={handleLogin}
        />
      );
    }

    return <LandingPage onDemo={() => void handleLogin()} onLogin={() => setAppRoute("login")} />;
  }

  return (
    <AuthenticatedLayout
      apiBaseUrl={apiBaseUrl}
      currentRoute={appRoute}
      userRole={authSession?.actor.role ?? loginForm.role}
      userName={authSession?.actor.displayName ?? loginForm.username}
      onLogout={handleLogout}
      onNavigate={setAppRoute}
      statusMessage={statusMessage}
    >
      {renderCurrentRoute()}
    </AuthenticatedLayout>
  );

  function renderCurrentRoute(): ReactNode {
    if (appRoute === "workspace") {
      return renderWorkspacePage();
    }

    if (appRoute === "documents") {
      return renderDocumentsPage();
    }

    if (appRoute === "audit") {
      return renderAuditPage();
    }

    if (appRoute === "interop") {
      return renderInteropPage();
    }

    if (appRoute === "settings") {
      return renderSettingsPage();
    }

    return renderDashboardPage();
  }

  function renderDashboardPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Dashboard"
          title="Tổng quan vận hành bệnh án điện tử"
          description="Màn hình dành cho đầu ca làm việc: xem nhanh hồ sơ, lượt khám mở, tài liệu chờ ký và trạng thái liên thông."
        />

        <section className="metric-grid">
          <MetricCard label="Bệnh nhân" value={`${patients.length}`} note="Hồ sơ trong registry demo" />
          <MetricCard
            label="Provider Directory"
            value={`${providerDirectory?.organizations.length ?? 0}/${providerDirectory?.endpoints.length ?? 0}`}
            note="Cơ sở y tế / endpoint liên thông"
          />
          <MetricCard label="Lượt khám mở" value={`${openEncounters.length}`} note="Theo bệnh nhân đang chọn" />
          <MetricCard label="Dị ứng" value={`${allergyIntolerances.length}`} note="Cảnh báo an toàn" />
          <MetricCard label="Chẩn đoán" value={`${conditions.length}`} note="Vấn đề sức khỏe có cấu trúc" />
          <MetricCard label="Chỉ định DV" value={`${serviceRequests.length}`} note="FHIR ServiceRequest" />
          <MetricCard label="Công việc" value={`${workflowTasks.length}`} note="FHIR Task" />
          <MetricCard label="Thủ thuật" value={`${procedures.length}`} note="FHIR Procedure" />
          <MetricCard label="Kết quả" value={`${diagnosticReports.length}`} note="FHIR DiagnosticReport" />
          <MetricCard label="Ảnh y khoa" value={`${imagingStudies.length}`} note="FHIR ImagingStudy" />
          <MetricCard label="Chỉ định thuốc" value={`${medicationRequests.length}`} note="FHIR MedicationRequest" />
          <MetricCard label="Cấp phát thuốc" value={`${medicationDispenses.length}`} note="FHIR MedicationDispense" />
          <MetricCard label="Dùng thuốc" value={`${medicationAdministrations.length}`} note="FHIR MedicationAdministration" />
          <MetricCard label="Chuyển hồ sơ" value={`${recordTransfers.length}`} note="FHIR Task liên viện" />
          <MetricCard label="Tài liệu nháp" value={`${draftDocuments.length}`} note="Cần ký/xác thực" />
        </section>

        <section className="dashboard-grid">
          <article className="panel command-panel">
            <div>
              <p className="eyebrow">Today queue</p>
              <h2>Việc nên xử lý tiếp</h2>
            </div>
            <div className="queue-list">
              <button type="button" onClick={() => setAppRoute("workspace")}>
                <strong>Mở patient workspace</strong>
                <span>Xem hồ sơ, lượt khám và tài liệu đang gắn với bệnh nhân.</span>
              </button>
              <button type="button" onClick={() => setAppRoute("documents")}>
                <strong>Kiểm tra tài liệu chờ ký</strong>
                <span>{draftDocuments.length} tài liệu đang ở trạng thái nháp.</span>
              </button>
              <button type="button" onClick={() => setAppRoute("interop")}>
                <strong>Xem gói FHIR</strong>
                <span>Patient, Encounter, AllergyIntolerance, Condition, ServiceRequest, Task, Procedure, Observation, DiagnosticReport, ImagingStudy, MedicationRequest, MedicationDispense, MedicationAdministration, DocumentReference, Provenance và gói chuyển hồ sơ đã có preview.</span>
              </button>
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">Selected chart</p>
            <h2>{selectedPatient?.fullName ?? "Chưa chọn bệnh nhân"}</h2>
            {selectedPatient ? (
              <div className="detail-grid compact">
                <Info label="MRN" value={selectedPatient.identifiers[0]?.value ?? selectedPatient.id} />
                <Info label="Lượt khám gần nhất" value={encounters[0]?.serviceType ?? "Chưa có"} />
                <Info label="Dị ứng/cảnh báo" value={`${allergyIntolerances.length}`} />
                <Info label="Chẩn đoán/vấn đề" value={`${conditions.length}`} />
                <Info label="Chỉ định dịch vụ" value={`${serviceRequests.length}`} />
                <Info label="Công việc thực thi" value={`${workflowTasks.length}`} />
                <Info label="Thủ thuật/hoạt động" value={`${procedures.length}`} />
                <Info label="Chỉ số lâm sàng" value={`${observations.length}`} />
                <Info label="Báo cáo kết quả" value={`${diagnosticReports.length}`} />
                <Info label="Nghiên cứu hình ảnh" value={`${imagingStudies.length}`} />
                <Info label="Chỉ định thuốc" value={`${medicationRequests.length}`} />
                <Info label="Cấp phát thuốc" value={`${medicationDispenses.length}`} />
                <Info label="Dùng thuốc thực tế" value={`${medicationAdministrations.length}`} />
                <Info label="Gói chuyển hồ sơ" value={`${recordTransfers.length}`} />
                <Info label="Tài liệu" value={`${clinicalDocuments.length}`} />
                <Info label="Cập nhật" value={formatDateTime(selectedPatient.updatedAt)} />
              </div>
            ) : (
              <p className="empty-state">Chưa có dữ liệu bệnh nhân để hiển thị.</p>
            )}
          </article>
        </section>
      </div>
    );
  }

  function renderWorkspacePage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Patient Workspace"
          title="Bàn làm việc bệnh nhân"
          description="Luồng chính mô phỏng EMR thật: chọn bệnh nhân, mở lượt khám, gắn tài liệu và theo dõi hồ sơ."
        />

        <section className="workspace">
          {renderPatientListPanel()}
          {renderPatientDetailPanel()}
          {renderEncounterPanel()}
          {renderAllergyIntolerancePanel()}
          {renderConditionPanel()}
          {renderServiceRequestPanel()}
          {renderWorkflowTaskPanel()}
          {renderProcedurePanel()}
          {renderObservationPanel()}
          {renderDiagnosticReportPanel()}
          {renderImagingStudyPanel()}
          {renderMedicationRequestPanel()}
          {renderMedicationDispensePanel()}
          {renderMedicationAdministrationPanel()}
          {renderCreatePatientPanel()}
        </section>
      </div>
    );
  }

  function renderDocumentsPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Document Center"
          title="Trung tâm tài liệu bệnh án"
          description="Tổ chức tài liệu theo danh mục gần với OpenEMR: CCR/CCDA, hồ sơ bệnh án, xét nghiệm, thông tin bệnh nhân và tài liệu FHIR export."
        />

        <section className="workspace">
          {renderPatientListPanel()}
          {renderDocumentPanel()}
          <FhirPanel title="FHIR DocumentReference JSON" badge="DocumentReference" value={documentFhirPreview} />
          <FhirPanel title="FHIR Provenance JSON" badge="Provenance" value={documentProvenanceFhirPreview} />
        </section>
      </div>
    );
  }

  function renderAuditPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Audit"
          title="Nhật ký truy cập và kiểm toán"
          description="Mỗi lần xem FHIR, mở lượt khám, tạo/ký tài liệu đều được ghi log với actor, mục đích sử dụng và tài nguyên liên quan."
        />

        <section className="workspace">
          {renderGlobalAuditPanel()}
          {renderAuditPanel()}
          <article className="panel">
            <p className="eyebrow">Policy note</p>
            <h2>Ranh giới demo</h2>
            <ul className="milestone-list">
              <li>Giao diện đã dùng phiên Bearer token nội bộ, chưa phải IAM/SSO bệnh viện thật.</li>
              <li>API chặn quyền cơ bản: điều trị thao tác hồ sơ, kiểm toán xem nhật ký, quản trị có quyền giám sát.</li>
              <li>Khi lên sản phẩm thật cần thêm SSO/MFA, đồng ý chia sẻ (consent), chữ ký số và log bất biến.</li>
            </ul>
          </article>
        </section>
      </div>
    );
  }

  function renderInteropPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Interop"
          title="FHIR và hướng liên thông bệnh viện"
          description="Màn này gom các biểu diễn FHIR hiện có để chuẩn bị cho luồng gửi sang HAPI FHIR hoặc hệ thống bệnh viện khác."
        />

        <section className="workflow-strip" aria-label="Luồng liên thông">
          {workflowSteps.map((item, index) => (
            <div className="workflow-step" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </section>

        <section className="workspace">
          {renderProviderDirectoryPanel()}
          <FhirPanel title="FHIR CapabilityStatement JSON" badge="CapabilityStatement" value={capabilityStatementPreview} />
          <FhirPanel title="FHIR Provider Directory Bundle JSON" badge="Organization/Endpoint" value={providerDirectoryFhirPreview} />
          <FhirPanel title="FHIR Patient JSON" badge="Patient" value={patientFhirPreview} />
          <FhirPanel title="FHIR Patient Record Bundle JSON" badge="Bundle" value={patientFhirBundlePreview} />
          <FhirPanel title="FHIR Clinical Document Bundle JSON" badge="Composition" value={patientFhirDocumentBundlePreview} />
          <FhirPanel title="FHIR Encounter JSON" badge="Encounter" value={encounterFhirPreview} />
          <FhirPanel title="FHIR AllergyIntolerance JSON" badge="AllergyIntolerance" value={allergyIntoleranceFhirPreview} />
          <FhirPanel title="FHIR Condition JSON" badge="Condition" value={conditionFhirPreview} />
          <FhirPanel title="FHIR ServiceRequest JSON" badge="ServiceRequest" value={serviceRequestFhirPreview} />
          <FhirPanel title="FHIR Task JSON" badge="Task" value={workflowTaskFhirPreview} />
          <FhirPanel title="FHIR Procedure JSON" badge="Procedure" value={procedureFhirPreview} />
          <FhirPanel title="FHIR Observation JSON" badge="Observation" value={observationFhirPreview} />
          <FhirPanel title="FHIR DiagnosticReport JSON" badge="DiagnosticReport" value={diagnosticReportFhirPreview} />
          <FhirPanel title="FHIR ImagingStudy JSON" badge="ImagingStudy" value={imagingStudyFhirPreview} />
          <FhirPanel title="FHIR MedicationRequest JSON" badge="MedicationRequest" value={medicationRequestFhirPreview} />
          <FhirPanel title="FHIR MedicationDispense JSON" badge="MedicationDispense" value={medicationDispenseFhirPreview} />
          <FhirPanel title="FHIR MedicationAdministration JSON" badge="MedicationAdministration" value={medicationAdministrationFhirPreview} />
          <FhirPanel title="FHIR DocumentReference JSON" badge="DocumentReference" value={documentFhirPreview} />
          <FhirPanel title="FHIR Document Provenance JSON" badge="Provenance" value={documentProvenanceFhirPreview} />
          {renderConsentInteropPanel()}
          <FhirPanel title="FHIR Consent JSON" badge="Consent" value={consentFhirPreview} />
          {renderRecordTransferInteropPanel()}
          <FhirPanel title="FHIR Record Transfer Task JSON" badge="Task" value={recordTransferFhirTaskPreview} />
          <article className="panel dark-panel">
            <p className="eyebrow">Reference map</p>
            <h2>Chuẩn đang bám theo</h2>
            <div className="reference-list">
              {referenceSignals.map((reference) => (
                <div key={reference.name}>
                  <strong>{reference.name}</strong>
                  <span>{reference.value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    );
  }

  function renderSettingsPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Settings"
          title="Cấu hình demo và đường nâng cấp"
          description="Trang này cố ý ghi rõ phần nào là demo, phần nào cần triển khai thật để tránh nhầm với hệ thống bệnh viện hoàn chỉnh."
        />

        <section className="settings-grid">
          <article className="panel">
            <p className="eyebrow">Session</p>
            <h2>Phiên hiện tại</h2>
            <div className="detail-grid compact">
              <Info label="Người dùng" value={authSession?.actor.displayName ?? loginForm.username} />
              <Info label="Mã actor" value={authSession?.actor.actorId ?? "Chưa xác thực"} />
              <Info label="Vai trò demo" value={formatDemoRole(authSession?.actor.role ?? loginForm.role)} />
              <Info label="API" value={apiBaseUrl} />
              <Info label="Phiên hết hạn" value={authSession ? formatDateTime(authSession.expiresAt) : "Chưa có"} />
              <Info label="Mục đích" value="Bearer token + PurposeOfUse" />
            </div>
          </article>
          <article className="panel">
            <p className="eyebrow">Roadmap</p>
            <h2>Cần làm thật sau skeleton</h2>
            <ul className="milestone-list">
              <li>Thêm IAM/SSO thật thay cho đăng nhập demo.</li>
              <li>Bổ sung role matrix chi tiết theo bác sĩ, điều dưỡng, văn thư, kiểm toán, quản trị.</li>
              <li>Thêm đồng ý chia sẻ (consent), chữ ký số, luồng gửi nhận FHIR Bundle.</li>
              <li>Tách cấu hình cơ sở y tế, khoa/phòng, mã định danh và danh mục tài liệu.</li>
            </ul>
          </article>
        </section>
      </div>
    );
  }

  function renderPatientListPanel(): ReactNode {
    return (
      <article className="panel patient-list">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Registry</p>
            <h2>Danh sách bệnh nhân</h2>
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={() => void loadPatients()}
            disabled={isLoadingPatients}
          >
            {isLoadingPatients ? "Đang tải..." : "Tải lại"}
          </button>
        </div>

        <div className="patient-cards">
          {patients.map((patient) => (
            <button
              className={patient.id === selectedPatientId ? "patient-card selected" : "patient-card"}
              key={patient.id}
              type="button"
              onClick={() => setSelectedPatientId(patient.id)}
            >
              <span>{patient.identifiers[0]?.value ?? patient.id}</span>
              <strong>{patient.fullName}</strong>
              <small>{patient.address ?? "Chưa có địa chỉ"}</small>
            </button>
          ))}
        </div>
      </article>
    );
  }

  function renderConsentInteropPanel(): ReactNode {
    return (
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Đồng ý chia sẻ hồ sơ</p>
            <h2>Căn cứ chia sẻ hồ sơ</h2>
          </div>
          <span className="pill cyan">{isLoadingConsents ? "đang tải" : `${consents.length} đồng ý`}</span>
        </div>

        <div className="detail-grid compact">
          <Info label="Mã đồng ý dùng để xuất Bundle" value={defaultTransferContext.consentReference} />
          <Info label="Đơn vị nhận" value={defaultTransferContext.recipientOrganizationId} />
        </div>

        <div className="reference-list">
          {consents.map((consent) => (
            <div key={consent.id}>
              <div className="reference-header">
                <strong>
                  {consent.id} · {formatConsentStatus(consent.status)}
                </strong>
                <div className="reference-actions">
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    onClick={() => void loadConsentFhirPreview(consent.id)}
                  >
                    FHIR
                  </button>
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      consent.status !== "active" ||
                      revokingConsentId === consent.id ||
                      !selectedPatient
                    }
                    onClick={() => void handleRevokeConsent(consent)}
                  >
                    {revokingConsentId === consent.id ? "Đang thu hồi..." : "Thu hồi"}
                  </button>
                </div>
              </div>
              <span>
                {formatConsentCategory(consent.category)} cho {consent.granteeOrganizationId}, hiệu lực từ{" "}
                {formatDateTime(consent.validFrom)}
                {consent.validUntil ? ` đến ${formatDateTime(consent.validUntil)}` : ""}
              </span>
              {consent.revokedAt ? (
                <span>
                  Thu hồi lúc {formatDateTime(consent.revokedAt)} bởi {consent.revokedByActorId ?? "không rõ"}
                  {consent.revocationReason ? ` · ${consent.revocationReason}` : ""}
                </span>
              ) : null}
            </div>
          ))}
          {consents.length === 0 ? (
            <p className="empty-state">
              Chưa có đồng ý chia sẻ hợp lệ trong workspace này; FHIR Bundle liên viện sẽ bị API chặn nếu thiếu consent.
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  function renderRecordTransferInteropPanel(): ReactNode {
    return (
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Chuyển hồ sơ liên viện</p>
            <h2>Gói chuyển hồ sơ</h2>
          </div>
          <span className="pill cyan">
            {isLoadingRecordTransfers
              ? "đang tải"
              : `${recordTransfers.length} gói`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {recordTransfers.map((recordTransfer) => (
              <button
                className={
                  recordTransfer.id === selectedRecordTransferId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={recordTransfer.id}
                type="button"
                onClick={() => setSelectedRecordTransferId(recordTransfer.id)}
              >
                <span>{formatRecordTransferStatus(recordTransfer.status)}</span>
                <strong>{formatRecordTransferBundleType(recordTransfer.bundleType)}</strong>
                <small>
                  {recordTransfer.recipientOrganizationId} · {formatDateTime(recordTransfer.requestedAt)}
                </small>
              </button>
            ))}
            {recordTransfers.length === 0 ? (
              <p className="empty-state">
                Chưa có gói chuyển hồ sơ. API sẽ kiểm consent trước khi cho tạo yêu cầu chuyển.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedRecordTransfer ? (
              <>
                {renderRecordTransferOperationalSummary(
                  selectedRecordTransfer,
                  recordTransferDeliveryAttempts
                )}
                <div className="document-meta">
                  <Info label="Trạng thái" value={formatRecordTransferStatus(selectedRecordTransfer.status)} />
                  <Info label="Độ ưu tiên" value={formatRecordTransferPriority(selectedRecordTransfer.priority)} />
                  <Info label="Bundle" value={selectedRecordTransfer.bundleId} />
                  <Info label="Loại gói" value={formatRecordTransferBundleType(selectedRecordTransfer.bundleType)} />
                  <Info label="Cơ sở gửi" value={selectedRecordTransfer.sourceOrganizationId} />
                  <Info label="Cơ sở nhận" value={selectedRecordTransfer.recipientOrganizationId} />
                  <Info label="Consent" value={selectedRecordTransfer.consentReference} />
                  <Info label="Người tạo" value={selectedRecordTransfer.requestedByActorId} />
                  <Info label="Thời điểm gửi" value={selectedRecordTransfer.sentAt ? formatDateTime(selectedRecordTransfer.sentAt) : "Chưa gửi"} />
                  <Info label="Thời điểm nhận" value={selectedRecordTransfer.receivedAt ? formatDateTime(selectedRecordTransfer.receivedAt) : "Chưa xác nhận"} />
                  <Info label="Người xác nhận nhận" value={selectedRecordTransfer.receivedByActorId ?? "Chưa xác nhận"} />
                  <Info label="Biên nhận tiếp nhận" value={selectedRecordTransfer.acknowledgementReference ?? "Chưa phát sinh"} />
                  <Info label="Lỗi gửi" value={selectedRecordTransfer.failureReason ?? "Chưa ghi nhận"} />
                  <Info label="Thử lại" value={formatRecordTransferRetryCount(selectedRecordTransfer.retryCount)} />
                  <Info label="Hẹn gửi lại" value={selectedRecordTransfer.nextRetryAt ? formatDateTime(selectedRecordTransfer.nextRetryAt) : "Chưa hẹn"} />
                  <Info label="Hàng lỗi cuối" value={selectedRecordTransfer.deadLetteredAt ? formatDateTime(selectedRecordTransfer.deadLetteredAt) : "Chưa đưa vào"} />
                </div>
                <div className="panel-actions">
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      Boolean(selectedRecordTransfer.sentAt) ||
                      ["completed", "cancelled", "failed", "dead-lettered"].includes(selectedRecordTransfer.status) ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleSendRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Đánh dấu đã gửi"}
                  </button>
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      !selectedRecordTransfer.sentAt ||
                      selectedRecordTransfer.status !== "in-progress" ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleReceiveRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Xác nhận đã nhận"}
                  </button>
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      selectedRecordTransfer.status === "completed" ||
                      selectedRecordTransfer.status === "cancelled" ||
                      selectedRecordTransfer.status === "failed" ||
                      selectedRecordTransfer.status === "dead-lettered" ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleFailRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Ghi nhận lỗi gửi"}
                  </button>
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      selectedRecordTransfer.status !== "failed" ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleRetryRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Đưa vào hàng đợi gửi lại"}
                  </button>
                </div>
                <p className="empty-state">
                  RecordTransfer là lớp điều phối nội bộ: sản phẩm dùng nó để theo dõi gửi/nhận,
                  còn khi liên thông chuẩn sẽ xuất thành FHIR Task trỏ tới Bundle và consent tương ứng.
                </p>
                {selectedRecordTransfer.status === "dead-lettered" ? (
                  <p className="transfer-alert">
                    Gói này đã vượt quá số lần thử gửi tự động. Cần kiểm tra endpoint FHIR,
                    consent, mạng hoặc cấu hình bên nhận trước khi tạo luồng xử lý tiếp theo.
                  </p>
                ) : null}
                {renderRecordTransferDeliveryAttemptList()}
              </>
            ) : (
              <p className="empty-state">Chọn một gói chuyển để xem siêu dữ liệu và xuất FHIR Task.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateRecordTransfer(event)}>
          <label>
            Độ ưu tiên
            <select
              value={recordTransferForm.priority}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  priority: event.target.value as RecordTransferPriority
                })
              }
            >
              <option value="routine">Thường quy</option>
              <option value="urgent">Khẩn</option>
              <option value="asap">Càng sớm càng tốt</option>
              <option value="stat">Cấp cứu</option>
            </select>
          </label>
          <label>
            Loại Bundle
            <select
              value={recordTransferForm.bundleType}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  bundleType: event.target.value as RecordTransferBundleType
                })
              }
            >
              <option value="document">Document Bundle</option>
              <option value="collection">Collection Bundle</option>
            </select>
          </label>
          <label>
            Cơ sở gửi
            <input
              value={recordTransferForm.sourceOrganizationId}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  sourceOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label>
            Cơ sở nhận
            <input
              value={recordTransferForm.recipientOrganizationId}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  recipientOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label>
            Consent
            <input
              value={recordTransferForm.consentReference}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  consentReference: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Lý do chuyển hồ sơ
            <input
              value={recordTransferForm.reason}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  reason: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú vận hành
            <input
              value={recordTransferForm.note}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  note: event.target.value
                })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={!selectedPatient || isSubmittingRecordTransfer}
          >
            {isSubmittingRecordTransfer ? "Đang tạo..." : "Tạo gói chuyển hồ sơ"}
          </button>
        </form>
      </article>
    );
  }

  function renderRecordTransferDeliveryAttemptList(): ReactNode {
    return (
      <div className="delivery-attempts">
        <div className="subsection-heading">
          <div>
            <strong>Lịch sử gửi qua endpoint</strong>
            <span>
              Outbox vận hành cho biết hệ thống đã xếp hàng, gửi thành công hay lỗi từng lần.
            </span>
          </div>
          <span className="pill cyan">
            {isLoadingRecordTransferDeliveryAttempts
              ? "đang tải"
              : `${recordTransferDeliveryAttempts.length} lần`}
          </span>
        </div>

        {recordTransferDeliveryAttempts.map((attempt) => (
          <div
            className={`delivery-attempt delivery-attempt--${attempt.status}`}
            key={attempt.id}
          >
            <div>
              <span>Lần gửi</span>
              <strong>#{attempt.attemptNumber}</strong>
            </div>
            <div>
              <span>Trạng thái</span>
              <strong>{formatRecordTransferDeliveryAttemptStatus(attempt.status)}</strong>
            </div>
            <div>
              <span>HTTP</span>
              <strong>{attempt.httpStatus ? `HTTP ${attempt.httpStatus}` : "Chưa có"}</strong>
            </div>
            <div>
              <span>Xếp hàng</span>
              <strong>{formatDateTime(attempt.queuedAt)}</strong>
            </div>
            <div>
              <span>Hoàn tất</span>
              <strong>{attempt.completedAt ? formatDateTime(attempt.completedAt) : "Đang chờ"}</strong>
            </div>
            <div className="delivery-attempt-wide">
              <span>Endpoint đích</span>
              <strong>{attempt.targetEndpointAddress}</strong>
            </div>
            <div className="delivery-attempt-wide">
              <span>Idempotency key</span>
              <strong className="hash-text">{attempt.idempotencyKey}</strong>
            </div>
            {attempt.errorMessage || attempt.responseBodyPreview ? (
              <div className="delivery-attempt-wide">
                <span>{attempt.errorMessage ? "Lỗi" : "Phản hồi"}</span>
                <strong>{attempt.errorMessage ?? attempt.responseBodyPreview}</strong>
              </div>
            ) : null}
          </div>
        ))}

        {!isLoadingRecordTransferDeliveryAttempts &&
        recordTransferDeliveryAttempts.length === 0 ? (
          <p className="empty-state">
            Chưa có lần gửi nào. Khi bấm gửi, API sẽ tạo delivery attempt kèm endpoint,
            Bundle và idempotency key để worker xử lý.
          </p>
        ) : null}
      </div>
    );
  }

  function renderRecordTransferOperationalSummary(
    recordTransfer: RecordTransfer,
    attempts: readonly RecordTransferDeliveryAttempt[]
  ): ReactNode {
    const summary = buildRecordTransferOperationalSummary(recordTransfer, attempts);

    return (
      <div className={`transfer-ops-summary transfer-ops-summary--${summary.severity}`}>
        <div className="transfer-ops-headline">
          <span>Tình trạng vận hành</span>
          <strong>{summary.title}</strong>
          <p>{summary.description}</p>
        </div>
        <div className="transfer-ops-grid">
          <Info label="Tín hiệu kỹ thuật" value={summary.technicalSignal} />
          <Info label="Số lần gửi" value={`${summary.attemptCount}`} />
          <Info label="Lần lỗi" value={`${summary.failedAttemptCount}`} />
          <Info label="HTTP gần nhất" value={summary.lastHttpStatus} />
          <Info label="Lịch retry" value={summary.nextRetry} />
        </div>
        <div className="transfer-ops-action">
          <span>Việc cần làm tiếp</span>
          <strong>{summary.nextAction}</strong>
        </div>
      </div>
    );
  }

  function renderProviderDirectoryPanel(): ReactNode {
    return (
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Provider Directory</p>
            <h2>Cơ sở, nhân sự và endpoint liên thông</h2>
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={() => void loadProviderDirectory()}
            disabled={isLoadingProviderDirectory}
          >
            {isLoadingProviderDirectory ? "Đang tải..." : "Tải lại"}
          </button>
        </div>

        <div className="detail-grid compact">
          <Info label="Cơ sở/khoa phòng" value={`${providerDirectory?.organizations.length ?? 0}`} />
          <Info label="Nhân sự" value={`${providerDirectory?.practitioners.length ?? 0}`} />
          <Info label="Vai trò" value={`${providerDirectory?.practitionerRoles.length ?? 0}`} />
          <Info label="Endpoint" value={`${providerDirectory?.endpoints.length ?? 0}`} />
        </div>

        <div className="reference-list">
          {providerDirectory?.endpoints.map((endpoint) => (
            <div key={endpoint.id}>
              <strong>
                {endpoint.name} · {formatProviderEndpointConnectionType(endpoint.connectionType)}
              </strong>
              <span>
                {endpoint.id}; quản lý bởi {endpoint.managingOrganizationId}; payload{" "}
                {endpoint.payloadTypes.map((payloadType) => payloadType.display).join(", ")}.
              </span>
            </div>
          ))}
          {!providerDirectory ? (
            <p className="empty-state">
              Provider Directory chưa tải được. Bundle liên thông vẫn nên có Organization, Practitioner,
              PractitionerRole và Endpoint để bên nhận hiểu đúng các reference trong hồ sơ.
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  function renderPatientDetailPanel(): ReactNode {
    return (
      <article className="panel patient-detail">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Patient chart</p>
            <h2>Hồ sơ đang chọn</h2>
          </div>
          {selectedPatient ? <span className="pill">{selectedPatient.status}</span> : null}
        </div>

        {selectedPatient ? (
          <div className="detail-grid">
            <Info label="Họ tên" value={selectedPatient.fullName} />
            <Info label="Ngày sinh" value={selectedPatient.birthDate ?? "Chưa có"} />
            <Info label="Giới tính" value={formatGender(selectedPatient.gender)} />
            <Info label="Điện thoại" value={selectedPatient.phone ?? "Chưa có"} />
            <Info label="Cơ sở quản lý" value={selectedPatient.managingOrganizationId} />
            <Info label="Cập nhật" value={formatDateTime(selectedPatient.updatedAt)} />
            <div className="identifiers">
              <span>Định danh</span>
              {selectedPatient.identifiers.map((identifier) => (
                <code key={`${identifier.system}:${identifier.value}`}>
                  {formatIdentifierType(identifier.type)} · {identifier.value}
                </code>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state">Chưa có bệnh nhân nào để hiển thị.</p>
        )}
      </article>
    );
  }

  function renderEncounterPanel(): ReactNode {
    return (
      <article className="panel encounter-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Encounter timeline</p>
            <h2>Lượt khám và đợt điều trị</h2>
          </div>
          <span className="pill cyan">{isLoadingEncounters ? "đang tải" : `${encounters.length} lượt`}</span>
        </div>

        <div className="encounter-layout">
          <div className="timeline">
            {encounters.map((encounter) => (
              <button
                className={encounter.id === selectedEncounterId ? "timeline-item selected" : "timeline-item"}
                key={encounter.id}
                type="button"
                onClick={() => setSelectedEncounterId(encounter.id)}
              >
                <span>{formatDateTime(encounter.startedAt)}</span>
                <strong>{encounter.serviceType}</strong>
                <small>
                  {formatEncounterClass(encounter.class)} · {formatEncounterStatus(encounter.status)}
                </small>
              </button>
            ))}
            {encounters.length === 0 ? (
              <p className="empty-state">Chưa có lượt khám nào cho bệnh nhân này.</p>
            ) : null}
          </div>

          <div className="encounter-summary">
            {selectedEncounter ? (
              <>
                <div className="document-meta">
                  <Info label="Lý do khám" value={selectedEncounter.reasonText} />
                  <Info label="Khoa/phòng" value={selectedEncounter.departmentId ?? "Chưa gắn"} />
                  <Info label="Nhân sự phụ trách" value={selectedEncounter.attendingPractitionerId} />
                  <Info label="Dị ứng gắn lượt khám" value={`${selectedEncounterAllergyIntolerances.length}`} />
                  <Info label="Chẩn đoán gắn lượt khám" value={`${selectedEncounterConditions.length}`} />
                  <Info label="Chỉ định dịch vụ gắn lượt khám" value={`${selectedEncounterServiceRequests.length}`} />
                  <Info label="Công việc thực thi gắn lượt khám" value={`${selectedEncounterWorkflowTasks.length}`} />
                  <Info label="Thủ thuật/hoạt động gắn lượt khám" value={`${selectedEncounterProcedures.length}`} />
                  <Info label="Chỉ số gắn lượt khám" value={`${selectedEncounterObservations.length}`} />
                  <Info label="Báo cáo kết quả gắn lượt khám" value={`${selectedEncounterDiagnosticReports.length}`} />
                  <Info label="Ảnh y khoa gắn lượt khám" value={`${selectedEncounterImagingStudies.length}`} />
                  <Info label="Thuốc gắn lượt khám" value={`${selectedEncounterMedicationRequests.length}`} />
                  <Info label="Cấp phát thuốc gắn lượt khám" value={`${selectedEncounterMedicationDispenses.length}`} />
                  <Info label="Dùng thuốc gắn lượt khám" value={`${selectedEncounterMedicationAdministrations.length}`} />
                  <Info label="Tài liệu gắn lượt khám" value={`${selectedEncounterDocuments.length}`} />
                </div>
                <div className="action-row">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={selectedEncounter.status !== "in-progress" || isFinishingEncounter}
                    onClick={() => void handleFinishEncounter(selectedEncounter.id)}
                  >
                    {isFinishingEncounter ? "Đang kết thúc..." : "Kết thúc lượt khám"}
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một lượt khám để xem chi tiết và xuất FHIR Encounter.</p>
            )}
          </div>
        </div>

        <form className="encounter-form" onSubmit={(event) => void handleCreateEncounter(event)}>
          <label>
            Loại lượt khám
            <select
              value={encounterForm.class}
              onChange={(event) =>
                setEncounterForm({ ...encounterForm, class: event.target.value as EncounterClass })
              }
            >
              <option value="ambulatory">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="emergency">Cấp cứu</option>
              <option value="virtual">Khám từ xa</option>
            </select>
          </label>
          <label>
            Dịch vụ/khoa khám
            <input
              value={encounterForm.serviceType}
              onChange={(event) => setEncounterForm({ ...encounterForm, serviceType: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Lý do khám
            <input
              value={encounterForm.reasonText}
              onChange={(event) => setEncounterForm({ ...encounterForm, reasonText: event.target.value })}
            />
          </label>
          <label>
            Khoa/phòng
            <input
              value={encounterForm.departmentId}
              onChange={(event) => setEncounterForm({ ...encounterForm, departmentId: event.target.value })}
            />
          </label>
          <label>
            Nhân sự phụ trách
            <input
              value={encounterForm.attendingPractitionerId}
              onChange={(event) =>
                setEncounterForm({ ...encounterForm, attendingPractitionerId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Thời điểm bắt đầu
            <input
              type="datetime-local"
              value={encounterForm.startedAt}
              onChange={(event) => setEncounterForm({ ...encounterForm, startedAt: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingEncounter}>
            {isSubmittingEncounter ? "Đang mở..." : "Mở lượt khám"}
          </button>
        </form>
      </article>
    );
  }

  function renderAllergyIntolerancePanel(): ReactNode {
    return (
      <article className="panel allergy-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Allergy safety</p>
            <h2>Dị ứng và cảnh báo an toàn</h2>
          </div>
          <span className="pill cyan">
            {isLoadingAllergyIntolerances ? "đang tải" : `${allergyIntolerances.length} cảnh báo`}
          </span>
        </div>

        <div className="document-layout">
          <div className="allergy-cards">
            {allergyIntolerances.map((allergyIntolerance) => (
              <button
                className={
                  allergyIntolerance.id === selectedAllergyIntoleranceId
                    ? "allergy-card selected"
                    : "allergy-card"
                }
                key={allergyIntolerance.id}
                type="button"
                onClick={() => setSelectedAllergyIntoleranceId(allergyIntolerance.id)}
              >
                <span>{formatAllergyCategory(allergyIntolerance.category)}</span>
                <strong>{allergyIntolerance.code.display}</strong>
                <small>
                  {formatAllergyCriticality(allergyIntolerance.criticality)} ·{" "}
                  {formatDateTime(allergyIntolerance.recordedAt)}
                </small>
              </button>
            ))}
            {allergyIntolerances.length === 0 ? (
              <p className="empty-state">
                Chưa có dị ứng/cảnh báo có cấu trúc. Khi kê thuốc, đây là vùng cần kiểm tra trước tiên.
              </p>
            ) : null}
          </div>

          <div className="allergy-summary">
            {selectedAllergyIntolerance ? (
              <>
                <div className="document-meta">
                  <Info label="Tác nhân" value={selectedAllergyIntolerance.code.display} />
                  <Info label="Loại" value={formatAllergyType(selectedAllergyIntolerance.type)} />
                  <Info label="Nhóm" value={formatAllergyCategory(selectedAllergyIntolerance.category)} />
                  <Info label="Mức cảnh báo" value={formatAllergyCriticality(selectedAllergyIntolerance.criticality)} />
                  <Info label="Lâm sàng" value={formatAllergyClinicalStatus(selectedAllergyIntolerance.clinicalStatus)} />
                  <Info label="Xác minh" value={formatAllergyVerificationStatus(selectedAllergyIntolerance.verificationStatus)} />
                  <Info label="Biểu hiện" value={selectedAllergyIntolerance.reaction?.manifestation.display ?? "Chưa ghi"} />
                  <Info label="Encounter" value={selectedAllergyIntolerance.encounterId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  AllergyIntolerance giúp hệ thống cảnh báo trước khi kê thuốc hoặc chuyển hồ sơ, tránh để dị ứng chỉ nằm trong ghi chú tự do.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một dị ứng/cảnh báo để xem siêu dữ liệu và xuất FHIR AllergyIntolerance.</p>
            )}
          </div>
        </div>

        <form className="allergy-form" onSubmit={(event) => void handleCreateAllergyIntolerance(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={allergyIntoleranceForm.encounterId}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại
            <select
              value={allergyIntoleranceForm.type}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, type: event.target.value as AllergyType })
              }
            >
              <option value="allergy">Dị ứng</option>
              <option value="intolerance">Không dung nạp</option>
            </select>
          </label>
          <label>
            Nhóm
            <select
              value={allergyIntoleranceForm.category}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  category: event.target.value as AllergyCategory
                })
              }
            >
              <option value="medication">Thuốc</option>
              <option value="food">Thực phẩm</option>
              <option value="environment">Môi trường</option>
              <option value="biologic">Sinh phẩm</option>
            </select>
          </label>
          <label>
            Mức cảnh báo
            <select
              value={allergyIntoleranceForm.criticality}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  criticality: event.target.value as "" | AllergyCriticality
                })
              }
            >
              <option value="">Chưa đánh giá</option>
              <option value="low">Thấp</option>
              <option value="high">Cao</option>
              <option value="unable-to-assess">Chưa thể đánh giá</option>
            </select>
          </label>
          <label>
            Trạng thái lâm sàng
            <select
              value={allergyIntoleranceForm.clinicalStatus}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  clinicalStatus: event.target.value as AllergyClinicalStatus
                })
              }
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </label>
          <label>
            Trạng thái xác minh
            <select
              value={allergyIntoleranceForm.verificationStatus}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  verificationStatus: event.target.value as AllergyVerificationStatus
                })
              }
            >
              <option value="confirmed">Đã xác nhận</option>
              <option value="unconfirmed">Chưa xác nhận</option>
              <option value="refuted">Đã loại trừ</option>
              <option value="entered-in-error">Nhập lỗi</option>
            </select>
          </label>
          <label>
            Hệ mã tác nhân
            <input
              value={allergyIntoleranceForm.codeSystem}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, codeSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã tác nhân
            <input
              value={allergyIntoleranceForm.code}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, code: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên tác nhân
            <input
              value={allergyIntoleranceForm.codeDisplay}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, codeDisplay: event.target.value })
              }
            />
          </label>
          <label>
            Mã biểu hiện
            <input
              value={allergyIntoleranceForm.manifestationCode}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  manifestationCode: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Biểu hiện phản ứng
            <input
              value={allergyIntoleranceForm.manifestationDisplay}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  manifestationDisplay: event.target.value
                })
              }
            />
          </label>
          <label>
            Mức độ phản ứng
            <select
              value={allergyIntoleranceForm.reactionSeverity}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  reactionSeverity: event.target.value as "" | AllergyReactionSeverity
                })
              }
            >
              <option value="">Chưa ghi</option>
              <option value="mild">Nhẹ</option>
              <option value="moderate">Trung bình</option>
              <option value="severe">Nặng</option>
            </select>
          </label>
          <label>
            Thời điểm ghi nhận
            <input
              type="datetime-local"
              value={allergyIntoleranceForm.recordedAt}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, recordedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Người ghi nhận
            <input
              value={allergyIntoleranceForm.recorderPractitionerId}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  recorderPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả phản ứng
            <input
              value={allergyIntoleranceForm.reactionDescription}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  reactionDescription: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={allergyIntoleranceForm.note}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, note: event.target.value })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={!selectedPatient || isSubmittingAllergyIntolerance}
          >
            {isSubmittingAllergyIntolerance ? "Đang ghi nhận..." : "Ghi nhận dị ứng/cảnh báo"}
          </button>
        </form>
      </article>
    );
  }

  function renderConditionPanel(): ReactNode {
    return (
      <article className="panel condition-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Conditions</p>
            <h2>Chẩn đoán và vấn đề sức khỏe</h2>
          </div>
          <span className="pill cyan">{isLoadingConditions ? "đang tải" : `${conditions.length} chẩn đoán`}</span>
        </div>

        <div className="document-layout">
          <div className="condition-cards">
            {conditions.map((condition) => (
              <button
                className={condition.id === selectedConditionId ? "condition-card selected" : "condition-card"}
                key={condition.id}
                type="button"
                onClick={() => setSelectedConditionId(condition.id)}
              >
                <span>{formatConditionCategory(condition.category)}</span>
                <strong>{condition.code.display}</strong>
                <small>
                  {formatConditionClinicalStatus(condition.clinicalStatus)} ·{" "}
                  {formatDateTime(condition.recordedAt)}
                </small>
              </button>
            ))}
            {conditions.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chẩn đoán có cấu trúc. Hãy ghi nhận vấn đề sức khỏe đầu tiên.
              </p>
            ) : null}
          </div>

          <div className="condition-summary">
            {selectedCondition ? (
              <>
                <div className="document-meta">
                  <Info label="Nhóm" value={formatConditionCategory(selectedCondition.category)} />
                  <Info label="Lâm sàng" value={formatConditionClinicalStatus(selectedCondition.clinicalStatus)} />
                  <Info label="Xác minh" value={formatConditionVerificationStatus(selectedCondition.verificationStatus)} />
                  <Info label="Mã chuẩn" value={`${selectedCondition.code.system} · ${selectedCondition.code.code}`} />
                  <Info label="Mức độ" value={selectedCondition.severity ? formatConditionSeverity(selectedCondition.severity) : "Chưa gắn"} />
                  <Info label="Encounter" value={selectedCondition.encounterId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Condition giúp bên nhận hiểu chẩn đoán/vấn đề sức khỏe ở dạng có cấu trúc, thay vì chỉ đọc thủ công trong file PDF.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chẩn đoán để xem siêu dữ liệu và xuất FHIR Condition.</p>
            )}
          </div>
        </div>

        <form className="condition-form" onSubmit={(event) => void handleCreateCondition(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={conditionForm.encounterId}
              onChange={(event) => setConditionForm({ ...conditionForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại chẩn đoán
            <select
              value={conditionForm.category}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, category: event.target.value as ConditionCategory })
              }
            >
              <option value="encounter-diagnosis">Chẩn đoán theo lượt khám</option>
              <option value="problem-list-item">Vấn đề sức khỏe dài hạn</option>
            </select>
          </label>
          <label>
            Trạng thái lâm sàng
            <select
              value={conditionForm.clinicalStatus}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, clinicalStatus: event.target.value as ConditionClinicalStatus })
              }
            >
              <option value="active">Đang hoạt động</option>
              <option value="recurrence">Tái phát</option>
              <option value="relapse">Diễn tiến lại</option>
              <option value="inactive">Không hoạt động</option>
              <option value="remission">Thuyên giảm</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </label>
          <label>
            Trạng thái xác minh
            <select
              value={conditionForm.verificationStatus}
              onChange={(event) =>
                setConditionForm({
                  ...conditionForm,
                  verificationStatus: event.target.value as ConditionVerificationStatus
                })
              }
            >
              <option value="confirmed">Đã xác nhận</option>
              <option value="provisional">Tạm thời</option>
              <option value="differential">Chẩn đoán phân biệt</option>
              <option value="unconfirmed">Chưa xác nhận</option>
              <option value="refuted">Đã loại trừ</option>
              <option value="entered-in-error">Nhập lỗi</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={conditionForm.codeSystem}
              onChange={(event) => setConditionForm({ ...conditionForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã chẩn đoán
            <input
              value={conditionForm.code}
              onChange={(event) => setConditionForm({ ...conditionForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên chẩn đoán
            <input
              value={conditionForm.codeDisplay}
              onChange={(event) => setConditionForm({ ...conditionForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Mức độ
            <select
              value={conditionForm.severity}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, severity: event.target.value as "" | ConditionSeverity })
              }
            >
              <option value="">Chưa gắn</option>
              <option value="mild">Nhẹ</option>
              <option value="moderate">Trung bình</option>
              <option value="severe">Nặng</option>
            </select>
          </label>
          <label>
            Thời điểm khởi phát
            <input
              type="datetime-local"
              value={conditionForm.onsetAt}
              onChange={(event) => setConditionForm({ ...conditionForm, onsetAt: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Nhân sự ghi nhận
            <input
              value={conditionForm.recorderPractitionerId}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, recorderPractitionerId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={conditionForm.note}
              onChange={(event) => setConditionForm({ ...conditionForm, note: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingCondition}>
            {isSubmittingCondition ? "Đang ghi nhận..." : "Ghi nhận chẩn đoán"}
          </button>
        </form>
      </article>
    );
  }

  function renderServiceRequestPanel(): ReactNode {
    return (
      <article className="panel service-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Service requests</p>
            <h2>Chỉ định xét nghiệm, hình ảnh và dịch vụ</h2>
          </div>
          <span className="pill cyan">
            {isLoadingServiceRequests ? "đang tải" : `${serviceRequests.length} chỉ định`}
          </span>
        </div>

        <div className="document-layout">
          <div className="service-cards">
            {serviceRequests.map((serviceRequest) => (
              <button
                className={serviceRequest.id === selectedServiceRequestId ? "service-card selected" : "service-card"}
                key={serviceRequest.id}
                type="button"
                onClick={() => setSelectedServiceRequestId(serviceRequest.id)}
              >
                <span>{formatServiceRequestCategory(serviceRequest.category)}</span>
                <strong>{serviceRequest.code.display}</strong>
                <small>
                  {formatServiceRequestPriority(serviceRequest.priority)} ·{" "}
                  {formatDateTime(serviceRequest.authoredOn)}
                </small>
              </button>
            ))}
            {serviceRequests.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ định dịch vụ. Hãy tạo ServiceRequest để nối luồng EMR với LIS/PACS.
              </p>
            ) : null}
          </div>

          <div className="service-summary">
            {selectedServiceRequest ? (
              <>
                <div className="document-meta">
                  <Info label="Dịch vụ" value={selectedServiceRequest.code.display} />
                  <Info label="Mã dịch vụ" value={`${selectedServiceRequest.code.system} · ${selectedServiceRequest.code.code}`} />
                  <Info label="Nhóm" value={formatServiceRequestCategory(selectedServiceRequest.category)} />
                  <Info label="Trạng thái" value={formatServiceRequestStatus(selectedServiceRequest.status)} />
                  <Info label="Mục đích" value={formatServiceRequestIntent(selectedServiceRequest.intent)} />
                  <Info label="Ưu tiên" value={formatServiceRequestPriority(selectedServiceRequest.priority)} />
                  <Info label="Khoa thực hiện" value={selectedServiceRequest.performerOrganizationId ?? "Chưa gắn"} />
                  <Info label="Dự kiến thực hiện" value={selectedServiceRequest.occurrenceAt ? formatDateTime(selectedServiceRequest.occurrenceAt) : "Chưa gắn"} />
                  <Info label="Chẩn đoán liên quan" value={selectedServiceRequest.reasonConditionId ?? "Chưa gắn"} />
                  <Info label="Người chỉ định" value={selectedServiceRequest.requesterPractitionerId} />
                </div>
                <p className="empty-state">
                  ServiceRequest là y lệnh dịch vụ máy đọc được: xét nghiệm đi sang LIS, chẩn đoán hình ảnh đi sang PACS/RIS, còn kết quả về sau có thể gom bằng Observation hoặc DiagnosticReport.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ định dịch vụ để xem siêu dữ liệu và xuất FHIR ServiceRequest.</p>
            )}
          </div>
        </div>

        <form className="service-form" onSubmit={(event) => void handleCreateServiceRequest(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={serviceRequestForm.encounterId}
              onChange={(event) =>
                setServiceRequestForm({ ...serviceRequestForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán liên quan
            <select
              value={serviceRequestForm.reasonConditionId}
              onChange={(event) =>
                setServiceRequestForm({ ...serviceRequestForm, reasonConditionId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm dịch vụ
            <select
              value={serviceRequestForm.category}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  category: event.target.value as ServiceRequestCategory
                })
              }
            >
              <option value="laboratory">Xét nghiệm</option>
              <option value="imaging">Chẩn đoán hình ảnh</option>
              <option value="procedure">Thủ thuật</option>
              <option value="consultation">Hội chẩn/tư vấn</option>
              <option value="therapy">Điều trị/phục hồi</option>
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              value={serviceRequestForm.priority}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  priority: event.target.value as ServiceRequestPriority
                })
              }
            >
              <option value="routine">Thông thường</option>
              <option value="urgent">Khẩn</option>
              <option value="asap">Càng sớm càng tốt</option>
              <option value="stat">Cấp cứu ngay</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={serviceRequestForm.codeSystem}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã dịch vụ
            <input
              value={serviceRequestForm.code}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên dịch vụ
            <input
              value={serviceRequestForm.codeDisplay}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Thời điểm chỉ định
            <input
              type="datetime-local"
              value={serviceRequestForm.authoredOn}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, authoredOn: event.target.value })}
            />
          </label>
          <label>
            Dự kiến thực hiện
            <input
              type="datetime-local"
              value={serviceRequestForm.occurrenceAt}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, occurrenceAt: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Người chỉ định
            <input
              value={serviceRequestForm.requesterPractitionerId}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  requesterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Khoa/phòng thực hiện
            <input
              value={serviceRequestForm.performerOrganizationId}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  performerOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Hướng dẫn cho người bệnh
            <input
              value={serviceRequestForm.patientInstruction}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  patientInstruction: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={serviceRequestForm.note}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, note: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingServiceRequest}>
            {isSubmittingServiceRequest ? "Đang tạo..." : "Tạo chỉ định dịch vụ"}
          </button>
        </form>
      </article>
    );
  }

  function renderWorkflowTaskPanel(): ReactNode {
    return (
      <article className="panel service-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Task queue</p>
            <h2>Luồng công việc thực thi y lệnh</h2>
          </div>
          <span className="pill cyan">
            {isLoadingWorkflowTasks ? "đang tải" : `${workflowTasks.length} công việc`}
          </span>
        </div>

        <div className="document-layout">
          <div className="service-cards">
            {workflowTasks.map((task) => (
              <button
                className={task.id === selectedWorkflowTaskId ? "service-card selected" : "service-card"}
                key={task.id}
                type="button"
                onClick={() => setSelectedWorkflowTaskId(task.id)}
              >
                <span>{formatWorkflowTaskStatus(task.status)}</span>
                <strong>{task.code.display}</strong>
                <small>
                  {formatServiceRequestPriority(task.priority)} · {formatDateTime(task.lastModified)}
                </small>
              </button>
            ))}
            {workflowTasks.length === 0 ? (
              <p className="empty-state">
                Chưa có Task cho bệnh nhân này. Task dùng để theo dõi y lệnh đang ở hàng đợi LIS/PACS, ai phụ trách và kết quả nào đã quay về EMR.
              </p>
            ) : null}
          </div>

          <div className="service-summary">
            {selectedWorkflowTask ? (
              <>
                <div className="document-meta">
                  <Info label="Công việc" value={selectedWorkflowTask.code.display} />
                  <Info label="Trạng thái FHIR" value={formatWorkflowTaskStatus(selectedWorkflowTask.status)} />
                  <Info label="Trạng thái nghiệp vụ" value={selectedWorkflowTask.businessStatus?.display ?? "Chưa gắn"} />
                  <Info label="Y lệnh gốc" value={selectedWorkflowTask.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Khoa/phòng phụ trách" value={selectedWorkflowTask.ownerOrganizationId ?? "Chưa gắn"} />
                  <Info label="Người phụ trách" value={selectedWorkflowTask.ownerPractitionerId ?? "Chưa gắn"} />
                  <Info label="Tạo lúc" value={formatDateTime(selectedWorkflowTask.authoredOn)} />
                  <Info label="Cập nhật" value={formatDateTime(selectedWorkflowTask.lastModified)} />
                  <Info
                    label="Bắt đầu"
                    value={
                      selectedWorkflowTask.executionPeriod?.start
                        ? formatDateTime(selectedWorkflowTask.executionPeriod.start)
                        : "Chưa gắn"
                    }
                  />
                  <Info
                    label="Kết thúc"
                    value={
                      selectedWorkflowTask.executionPeriod?.end
                        ? formatDateTime(selectedWorkflowTask.executionPeriod.end)
                        : "Chưa gắn"
                    }
                  />
                </div>
                <div className="reference-list compact-list">
                  <div>
                    <strong>Input</strong>
                    <span>{formatWorkflowTaskReferences(selectedWorkflowTask.inputReferences)}</span>
                  </div>
                  <div>
                    <strong>Output</strong>
                    <span>{formatWorkflowTaskReferences(selectedWorkflowTask.outputReferences)}</span>
                  </div>
                </div>
                <p className="empty-state">
                  FHIR Task không thay thế ServiceRequest; nó theo dõi việc thực thi ServiceRequest qua từng hàng đợi, chủ sở hữu, thời gian xử lý và kết quả đầu ra.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một công việc để xem siêu dữ liệu và xuất FHIR Task.</p>
            )}
          </div>
        </div>
      </article>
    );
  }

  function renderProcedurePanel(): ReactNode {
    return (
      <article className="panel service-request-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Clinical procedures</p>
            <h2>Thủ thuật và hoạt động đã thực hiện</h2>
          </div>
          <span className="pill cyan">
            {isLoadingProcedures ? "đang tải" : `${procedures.length} bản ghi`}
          </span>
        </div>

        <div className="document-layout">
          <div className="service-cards">
            {procedures.map((procedure) => (
              <button
                className={procedure.id === selectedProcedureId ? "service-card selected" : "service-card"}
                key={procedure.id}
                type="button"
                onClick={() => setSelectedProcedureId(procedure.id)}
              >
                <span>{formatProcedureCategory(procedure.category)}</span>
                <strong>{procedure.code.display}</strong>
                <small>
                  {formatProcedureStatus(procedure.status)} ·{" "}
                  {procedure.performedPeriod?.start
                    ? formatDateTime(procedure.performedPeriod.start)
                    : formatDateTime(procedure.updatedAt)}
                </small>
              </button>
            ))}
            {procedures.length === 0 ? (
              <p className="empty-state">
                Chưa có Procedure cho bệnh nhân này. Procedure ghi lại hành động y tế đã thực hiện, còn ServiceRequest là y lệnh và Task là hàng đợi xử lý.
              </p>
            ) : null}
          </div>

          <div className="service-summary">
            {selectedProcedure ? (
              <>
                <div className="document-meta">
                  <Info label="Hoạt động" value={selectedProcedure.code.display} />
                  <Info label="Mã chuẩn" value={`${selectedProcedure.code.system} · ${selectedProcedure.code.code}`} />
                  <Info label="Nhóm" value={formatProcedureCategory(selectedProcedure.category)} />
                  <Info label="Trạng thái FHIR" value={formatProcedureStatus(selectedProcedure.status)} />
                  <Info label="Y lệnh gốc" value={selectedProcedure.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Chẩn đoán/lý do" value={selectedProcedure.reasonConditionId ?? "Chưa gắn"} />
                  <Info
                    label="Bắt đầu"
                    value={
                      selectedProcedure.performedPeriod?.start
                        ? formatDateTime(selectedProcedure.performedPeriod.start)
                        : "Chưa gắn"
                    }
                  />
                  <Info
                    label="Kết thúc"
                    value={
                      selectedProcedure.performedPeriod?.end
                        ? formatDateTime(selectedProcedure.performedPeriod.end)
                        : "Chưa gắn"
                    }
                  />
                  <Info label="Người ghi nhận" value={selectedProcedure.recorderPractitionerId ?? "Chưa gắn"} />
                  <Info label="Người xác nhận" value={selectedProcedure.asserterPractitionerId ?? "Chưa gắn"} />
                  <Info label="Vị trí/cơ quan" value={selectedProcedure.bodySite?.display ?? "Chưa gắn"} />
                  <Info label="Kết quả thủ thuật" value={selectedProcedure.outcome?.display ?? "Chưa gắn"} />
                </div>
                <div className="reference-list compact-list">
                  <div>
                    <strong>Người/đơn vị thực hiện</strong>
                    <span>{formatProcedurePerformers(selectedProcedure.performers)}</span>
                  </div>
                  <div>
                    <strong>Báo cáo liên quan</strong>
                    <span>{formatProcedureReferences(selectedProcedure.reportReferences)}</span>
                  </div>
                </div>
                <p className="empty-state">
                  Procedure là lớp “đã làm gì cho người bệnh”: ví dụ chụp X-quang, thủ thuật, tư vấn hoặc phục hồi chức năng. Nó giúp Bundle không chỉ có y lệnh và kết quả, mà còn có dấu vết lâm sàng của hành động đã diễn ra.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một thủ thuật/thao tác y khoa để xem siêu dữ liệu và xuất FHIR Procedure.</p>
            )}
          </div>
        </div>

        <form className="service-form" onSubmit={(event) => void handleCreateProcedure(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={procedureForm.encounterId}
              onChange={(event) => setProcedureForm({ ...procedureForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Y lệnh gốc
            <select
              value={procedureForm.basedOnServiceRequestId}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, basedOnServiceRequestId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {serviceRequests.map((serviceRequest) => (
                <option key={serviceRequest.id} value={serviceRequest.id}>
                  {serviceRequest.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán/lý do
            <select
              value={procedureForm.reasonConditionId}
              onChange={(event) => setProcedureForm({ ...procedureForm, reasonConditionId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm Procedure
            <select
              value={procedureForm.category}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, category: event.target.value as ProcedureCategory })
              }
            >
              <option value="diagnostic">Chẩn đoán</option>
              <option value="therapeutic">Điều trị</option>
              <option value="surgical">Phẫu thuật</option>
              <option value="counseling">Tư vấn</option>
              <option value="rehabilitation">Phục hồi chức năng</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label>
            Trạng thái
            <select
              value={procedureForm.status}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, status: event.target.value as ProcedureStatus })
              }
            >
              <option value="completed">Hoàn tất</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="preparation">Chuẩn bị</option>
              <option value="not-done">Không thực hiện</option>
              <option value="on-hold">Tạm giữ</option>
              <option value="stopped">Đã dừng</option>
              <option value="unknown">Chưa rõ</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={procedureForm.codeSystem}
              onChange={(event) => setProcedureForm({ ...procedureForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã Procedure
            <input
              value={procedureForm.code}
              onChange={(event) => setProcedureForm({ ...procedureForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên Procedure
            <input
              value={procedureForm.codeDisplay}
              onChange={(event) => setProcedureForm({ ...procedureForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Bắt đầu
            <input
              type="datetime-local"
              value={procedureForm.performedStart}
              onChange={(event) => setProcedureForm({ ...procedureForm, performedStart: event.target.value })}
            />
          </label>
          <label>
            Kết thúc
            <input
              type="datetime-local"
              value={procedureForm.performedEnd}
              onChange={(event) => setProcedureForm({ ...procedureForm, performedEnd: event.target.value })}
            />
          </label>
          <label>
            Người/đơn vị thực hiện
            <input
              value={procedureForm.performerActorId}
              onChange={(event) => setProcedureForm({ ...procedureForm, performerActorId: event.target.value })}
            />
          </label>
          <label>
            Đại diện khoa/phòng
            <input
              value={procedureForm.onBehalfOfOrganizationId}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, onBehalfOfOrganizationId: event.target.value })
              }
            />
          </label>
          <label>
            Chức năng thực hiện
            <input
              value={procedureForm.performerFunctionDisplay}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, performerFunctionDisplay: event.target.value })
              }
            />
          </label>
          <label>
            Người ghi nhận
            <input
              value={procedureForm.recorderPractitionerId}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, recorderPractitionerId: event.target.value })
              }
            />
          </label>
          <label>
            Vị trí/cơ quan
            <input
              value={procedureForm.bodySiteDisplay}
              onChange={(event) => setProcedureForm({ ...procedureForm, bodySiteDisplay: event.target.value })}
            />
          </label>
          <label>
            Kết quả
            <input
              value={procedureForm.outcomeDisplay}
              onChange={(event) => setProcedureForm({ ...procedureForm, outcomeDisplay: event.target.value })}
            />
          </label>
          <label>
            Báo cáo liên quan
            <select
              value={procedureForm.reportReferenceId}
              onChange={(event) => setProcedureForm({ ...procedureForm, reportReferenceId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {diagnosticReports.map((diagnosticReport) => (
                <option key={diagnosticReport.id} value={diagnosticReport.id}>
                  {diagnosticReport.code.display}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            Ghi chú
            <textarea
              value={procedureForm.note}
              onChange={(event) => setProcedureForm({ ...procedureForm, note: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingProcedure}>
            {isSubmittingProcedure ? "Đang ghi nhận..." : "Ghi nhận Procedure"}
          </button>
        </form>
      </article>
    );
  }

  function renderObservationPanel(): ReactNode {
    return (
      <article className="panel observation-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Clinical observations</p>
            <h2>Chỉ số lâm sàng và xét nghiệm</h2>
          </div>
          <span className="pill cyan">{isLoadingObservations ? "đang tải" : `${observations.length} chỉ số`}</span>
        </div>

        <div className="document-layout">
          <div className="observation-cards">
            {observations.map((observation) => (
              <button
                className={observation.id === selectedObservationId ? "observation-card selected" : "observation-card"}
                key={observation.id}
                type="button"
                onClick={() => setSelectedObservationId(observation.id)}
              >
                <span>{formatObservationCategory(observation.category)}</span>
                <strong>{observation.code.display}</strong>
                <small>
                  {formatObservationValue(observation)} · {formatDateTime(observation.effectiveAt)}
                </small>
              </button>
            ))}
            {observations.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ số có cấu trúc. Hãy ghi nhận sinh hiệu hoặc kết quả xét nghiệm đầu tiên.
              </p>
            ) : null}
          </div>

          <div className="observation-summary">
            {selectedObservation ? (
              <>
                <div className="document-meta">
                  <Info label="Nhóm" value={formatObservationCategory(selectedObservation.category)} />
                  <Info label="Trạng thái" value={formatObservationStatus(selectedObservation.status)} />
                  <Info label="Mã chuẩn" value={`${selectedObservation.code.system} · ${selectedObservation.code.code}`} />
                  <Info label="Giá trị" value={formatObservationValue(selectedObservation)} />
                  <Info label="Encounter" value={selectedObservation.encounterId ?? "Chưa gắn"} />
                  <Info label="Người ghi nhận" value={selectedObservation.performerPractitionerId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Observation là dữ liệu lâm sàng có cấu trúc; khi xuất Bundle sẽ đi cùng Patient, Encounter và
                  DocumentReference để bên nhận có thể xử lý máy đọc được.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ số để xem siêu dữ liệu và xuất FHIR Observation.</p>
            )}
          </div>
        </div>

        <form className="observation-form" onSubmit={(event) => void handleCreateObservation(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={observationForm.encounterId}
              onChange={(event) => setObservationForm({ ...observationForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm chỉ số
            <select
              value={observationForm.category}
              onChange={(event) =>
                setObservationForm({ ...observationForm, category: event.target.value as ObservationCategory })
              }
            >
              <option value="laboratory">Xét nghiệm</option>
              <option value="vital-signs">Sinh hiệu</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={observationForm.codeSystem}
              onChange={(event) => setObservationForm({ ...observationForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã chỉ số
            <input
              value={observationForm.code}
              onChange={(event) => setObservationForm({ ...observationForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên chỉ số
            <input
              value={observationForm.codeDisplay}
              onChange={(event) => setObservationForm({ ...observationForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Giá trị
            <input
              type="number"
              step="any"
              value={observationForm.value}
              onChange={(event) => setObservationForm({ ...observationForm, value: event.target.value })}
            />
          </label>
          <label>
            Đơn vị
            <input
              value={observationForm.unit}
              onChange={(event) => setObservationForm({ ...observationForm, unit: event.target.value })}
            />
          </label>
          <label>
            Hệ đơn vị
            <input
              value={observationForm.unitSystem}
              onChange={(event) => setObservationForm({ ...observationForm, unitSystem: event.target.value })}
            />
          </label>
          <label>
            Mã đơn vị
            <input
              value={observationForm.unitCode}
              onChange={(event) => setObservationForm({ ...observationForm, unitCode: event.target.value })}
            />
          </label>
          <label>
            Thời điểm ghi nhận
            <input
              type="datetime-local"
              value={observationForm.effectiveAt}
              onChange={(event) => setObservationForm({ ...observationForm, effectiveAt: event.target.value })}
            />
          </label>
          <label>
            Nhân sự ghi nhận
            <input
              value={observationForm.performerPractitionerId}
              onChange={(event) =>
                setObservationForm({ ...observationForm, performerPractitionerId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingObservation}>
            {isSubmittingObservation ? "Đang ghi nhận..." : "Ghi nhận chỉ số"}
          </button>
        </form>
      </article>
    );
  }

  function renderDiagnosticReportPanel(): ReactNode {
    return (
      <article className="panel diagnostic-report-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Diagnostic reports</p>
            <h2>Báo cáo kết quả xét nghiệm và hình ảnh</h2>
          </div>
          <span className="pill cyan">
            {isLoadingDiagnosticReports ? "đang tải" : `${diagnosticReports.length} báo cáo`}
          </span>
        </div>

        <div className="document-layout">
          <div className="diagnostic-report-cards">
            {diagnosticReports.map((diagnosticReport) => (
              <button
                className={
                  diagnosticReport.id === selectedDiagnosticReportId
                    ? "diagnostic-report-card selected"
                    : "diagnostic-report-card"
                }
                key={diagnosticReport.id}
                type="button"
                onClick={() => setSelectedDiagnosticReportId(diagnosticReport.id)}
              >
                <span>{formatDiagnosticReportCategory(diagnosticReport.category)}</span>
                <strong>{diagnosticReport.code.display}</strong>
                <small>
                  {formatDiagnosticReportStatus(diagnosticReport.status)} ·{" "}
                  {formatDateTime(diagnosticReport.issuedAt)}
                </small>
              </button>
            ))}
            {diagnosticReports.length === 0 ? (
              <p className="empty-state">
                Chưa có báo cáo kết quả. Khi LIS/RIS/PACS trả kết quả, hãy tạo DiagnosticReport để đóng vòng y lệnh.
              </p>
            ) : null}
          </div>

          <div className="diagnostic-report-summary">
            {selectedDiagnosticReport ? (
              <>
                <div className="document-meta">
                  <Info label="Báo cáo" value={selectedDiagnosticReport.code.display} />
                  <Info label="Mã báo cáo" value={`${selectedDiagnosticReport.code.system} · ${selectedDiagnosticReport.code.code}`} />
                  <Info label="Nhóm" value={formatDiagnosticReportCategory(selectedDiagnosticReport.category)} />
                  <Info label="Trạng thái" value={formatDiagnosticReportStatus(selectedDiagnosticReport.status)} />
                  <Info label="Y lệnh gốc" value={selectedDiagnosticReport.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Observation kết quả" value={`${selectedDiagnosticReport.resultObservationIds.length}`} />
                  <Info label="Khoa phát hành" value={selectedDiagnosticReport.performerOrganizationId ?? "Chưa gắn"} />
                  <Info label="Người diễn giải" value={selectedDiagnosticReport.resultsInterpreterPractitionerId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  {selectedDiagnosticReport.conclusion ??
                    "DiagnosticReport gom các Observation hoặc báo cáo dạng tệp để bên nhận hiểu đây là kết quả của một y lệnh ServiceRequest."}
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một báo cáo để xem siêu dữ liệu và xuất FHIR DiagnosticReport.</p>
            )}
          </div>
        </div>

        <form className="diagnostic-report-form" onSubmit={(event) => void handleCreateDiagnosticReport(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={diagnosticReportForm.encounterId}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Y lệnh gốc
            <select
              value={diagnosticReportForm.basedOnServiceRequestId}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  basedOnServiceRequestId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {serviceRequests.map((serviceRequest) => (
                <option key={serviceRequest.id} value={serviceRequest.id}>
                  {serviceRequest.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm báo cáo
            <select
              value={diagnosticReportForm.category}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  category: event.target.value as DiagnosticReportCategory
                })
              }
            >
              <option value="laboratory">Xét nghiệm</option>
              <option value="imaging">Chẩn đoán hình ảnh</option>
              <option value="pathology">Giải phẫu bệnh</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={diagnosticReportForm.codeSystem}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, codeSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã báo cáo
            <input
              value={diagnosticReportForm.code}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, code: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên báo cáo
            <input
              value={diagnosticReportForm.codeDisplay}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, codeDisplay: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm hiệu lực
            <input
              type="datetime-local"
              value={diagnosticReportForm.effectiveAt}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, effectiveAt: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm phát hành
            <input
              type="datetime-local"
              value={diagnosticReportForm.issuedAt}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, issuedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Khoa/phòng phát hành
            <input
              value={diagnosticReportForm.performerOrganizationId}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  performerOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Người diễn giải kết quả
            <input
              value={diagnosticReportForm.resultsInterpreterPractitionerId}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  resultsInterpreterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <div className="wide-field checkbox-list">
            <span>Observation kết quả</span>
            {observations.map((observation) => {
              const isChecked = diagnosticReportForm.resultObservationIds.includes(observation.id);

              return (
                <label className="check-option" key={observation.id}>
                  <input
                    checked={isChecked}
                    type="checkbox"
                    onChange={(event) => {
                      const nextIds = event.target.checked
                        ? [...diagnosticReportForm.resultObservationIds, observation.id]
                        : diagnosticReportForm.resultObservationIds.filter((id) => id !== observation.id);
                      setDiagnosticReportForm({
                        ...diagnosticReportForm,
                        resultObservationIds: nextIds
                      });
                    }}
                  />
                  <span>{observation.code.display} · {formatObservationValue(observation)}</span>
                </label>
              );
            })}
            {observations.length === 0 ? (
              <small>Chưa có Observation để gắn. Có thể dùng kết luận hoặc tệp báo cáo.</small>
            ) : null}
          </div>
          <label className="wide-field">
            Kết luận
            <input
              value={diagnosticReportForm.conclusion}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, conclusion: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Đường dẫn tệp báo cáo
            <input
              value={diagnosticReportForm.presentedFormUrl}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, presentedFormUrl: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tiêu đề tệp báo cáo
            <input
              value={diagnosticReportForm.presentedFormTitle}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, presentedFormTitle: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingDiagnosticReport}>
            {isSubmittingDiagnosticReport ? "Đang tạo..." : "Tạo báo cáo kết quả"}
          </button>
        </form>
      </article>
    );
  }

  function renderImagingStudyPanel(): ReactNode {
    return (
      <article className="panel imaging-study-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PACS / DICOM</p>
            <h2>Nghiên cứu hình ảnh y khoa</h2>
          </div>
          <span className="pill cyan">
            {isLoadingImagingStudies ? "đang tải" : `${imagingStudies.length} nghiên cứu`}
          </span>
        </div>

        <div className="document-layout">
          <div className="imaging-study-cards">
            {imagingStudies.map((imagingStudy) => (
              <button
                className={
                  imagingStudy.id === selectedImagingStudyId
                    ? "imaging-study-card selected"
                    : "imaging-study-card"
                }
                key={imagingStudy.id}
                type="button"
                onClick={() => setSelectedImagingStudyId(imagingStudy.id)}
              >
                <span>{formatImagingStudyStatus(imagingStudy.status)}</span>
                <strong>{imagingStudy.description ?? imagingStudy.studyInstanceUid}</strong>
                <small>
                  {imagingStudy.series[0]?.modality.display ?? "DICOM"} ·{" "}
                  {imagingStudy.startedAt ? formatDateTime(imagingStudy.startedAt) : "Chưa có thời điểm"}
                </small>
              </button>
            ))}
            {imagingStudies.length === 0 ? (
              <p className="empty-state">
                Chưa có FHIR ImagingStudy. Khi PACS/RIS có siêu dữ liệu DICOM, hãy tạo nghiên cứu hình ảnh để Bundle không chỉ có báo cáo PDF mà còn có chỉ mục ảnh máy đọc được.
              </p>
            ) : null}
          </div>

          <div className="imaging-study-summary">
            {selectedImagingStudy ? (
              <>
                <div className="document-meta">
                  <Info label="Mô tả" value={selectedImagingStudy.description ?? "Chưa có mô tả"} />
                  <Info label="Study UID" value={selectedImagingStudy.studyInstanceUid} />
                  <Info label="Accession" value={selectedImagingStudy.accessionNumber ?? "Chưa gắn"} />
                  <Info label="Trạng thái" value={formatImagingStudyStatus(selectedImagingStudy.status)} />
                  <Info label="Y lệnh gốc" value={selectedImagingStudy.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Báo cáo liên quan" value={selectedImagingStudy.diagnosticReportId ?? "Chưa gắn"} />
                  <Info label="Endpoint PACS" value={selectedImagingStudy.endpointId ?? "Chưa gắn"} />
                  <Info label="Số ảnh" value={`${selectedImagingStudy.numberOfInstances} ảnh / ${selectedImagingStudy.numberOfSeries} series`} />
                </div>
                <div className="reference-list">
                  {selectedImagingStudy.series.map((series) => (
                    <div key={series.uid}>
                      <strong>
                        Series {series.number ?? "-"} · {series.modality.display}
                      </strong>
                      <span>
                        UID {series.uid}; {series.numberOfInstances} ảnh
                        {series.bodySite ? `; vùng chụp ${series.bodySite.display}` : ""}.
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một nghiên cứu hình ảnh để xem siêu dữ liệu PACS/DICOM và xuất FHIR ImagingStudy.</p>
            )}
          </div>
        </div>

        <form className="imaging-study-form" onSubmit={(event) => void handleCreateImagingStudy(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={imagingStudyForm.encounterId}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Y lệnh gốc
            <select
              value={imagingStudyForm.basedOnServiceRequestId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  basedOnServiceRequestId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {serviceRequests.map((serviceRequest) => (
                <option key={serviceRequest.id} value={serviceRequest.id}>
                  {serviceRequest.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Báo cáo liên quan
            <select
              value={imagingStudyForm.diagnosticReportId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  diagnosticReportId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {diagnosticReports.map((diagnosticReport) => (
                <option key={diagnosticReport.id} value={diagnosticReport.id}>
                  {diagnosticReport.code.display}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            DICOM Study Instance UID
            <input
              value={imagingStudyForm.studyInstanceUid}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, studyInstanceUid: event.target.value })
              }
            />
          </label>
          <label>
            Accession number
            <input
              value={imagingStudyForm.accessionNumber}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, accessionNumber: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm bắt đầu
            <input
              type="datetime-local"
              value={imagingStudyForm.startedAt}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, startedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả nghiên cứu
            <input
              value={imagingStudyForm.description}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, description: event.target.value })
              }
            />
          </label>
          <label>
            Bác sĩ chỉ định
            <input
              value={imagingStudyForm.referrerPractitionerId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  referrerPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label>
            Bác sĩ đọc ảnh
            <input
              value={imagingStudyForm.interpreterPractitionerId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  interpreterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Endpoint PACS/DICOMweb
            <input
              value={imagingStudyForm.endpointId}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, endpointId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            DICOM Series Instance UID
            <input
              value={imagingStudyForm.seriesUid}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, seriesUid: event.target.value })
              }
            />
          </label>
          <label>
            Số thứ tự series
            <input
              value={imagingStudyForm.seriesNumber}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, seriesNumber: event.target.value })
              }
            />
          </label>
          <label>
            Số ảnh
            <input
              value={imagingStudyForm.numberOfInstances}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, numberOfInstances: event.target.value })
              }
            />
          </label>
          <label>
            Hệ mã modality
            <input
              value={imagingStudyForm.modalitySystem}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, modalitySystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã modality
            <input
              value={imagingStudyForm.modalityCode}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, modalityCode: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên modality
            <input
              value={imagingStudyForm.modalityDisplay}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, modalityDisplay: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả series
            <input
              value={imagingStudyForm.seriesDescription}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, seriesDescription: event.target.value })
              }
            />
          </label>
          <label>
            Hệ mã vùng chụp
            <input
              value={imagingStudyForm.bodySiteSystem}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, bodySiteSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã vùng chụp
            <input
              value={imagingStudyForm.bodySiteCode}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, bodySiteCode: event.target.value })
              }
            />
          </label>
          <label>
            Tên vùng chụp
            <input
              value={imagingStudyForm.bodySiteDisplay}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, bodySiteDisplay: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingImagingStudy}>
            {isSubmittingImagingStudy ? "Đang tạo..." : "Tạo ImagingStudy"}
          </button>
        </form>
      </article>
    );
  }

  function renderMedicationRequestPanel(): ReactNode {
    return (
      <article className="panel medication-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Medication requests</p>
            <h2>Chỉ định thuốc và đơn thuốc</h2>
          </div>
          <span className="pill cyan">
            {isLoadingMedicationRequests ? "đang tải" : `${medicationRequests.length} chỉ định`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {medicationRequests.map((medicationRequest) => (
              <button
                className={
                  medicationRequest.id === selectedMedicationRequestId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={medicationRequest.id}
                type="button"
                onClick={() => setSelectedMedicationRequestId(medicationRequest.id)}
              >
                <span>{formatMedicationRequestCategory(medicationRequest.category)}</span>
                <strong>{medicationRequest.medicationCode.display}</strong>
                <small>
                  {formatMedicationRequestStatus(medicationRequest.status)} ·{" "}
                  {formatDateTime(medicationRequest.authoredOn)}
                </small>
              </button>
            ))}
            {medicationRequests.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ định thuốc có cấu trúc. Hãy ghi nhận thuốc đầu tiên để Bundle có thêm MedicationRequest.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedMedicationRequest ? (
              <>
                <div className="document-meta">
                  <Info label="Thuốc" value={selectedMedicationRequest.medicationCode.display} />
                  <Info label="Mã thuốc" value={`${selectedMedicationRequest.medicationCode.system} · ${selectedMedicationRequest.medicationCode.code}`} />
                  <Info label="Trạng thái" value={formatMedicationRequestStatus(selectedMedicationRequest.status)} />
                  <Info label="Mục đích" value={formatMedicationRequestIntent(selectedMedicationRequest.intent)} />
                  <Info label="Ưu tiên" value={formatMedicationRequestPriority(selectedMedicationRequest.priority)} />
                  <Info label="Liều dùng" value={formatDosageInstruction(selectedMedicationRequest.dosageInstruction)} />
                  <Info label="Chẩn đoán liên quan" value={selectedMedicationRequest.reasonConditionId ?? "Chưa gắn"} />
                  <Info label="Người kê" value={selectedMedicationRequest.requesterPractitionerId} />
                </div>
                <p className="empty-state">
                  MedicationRequest thể hiện yêu cầu dùng thuốc ở dạng máy đọc được; trong luồng liên viện, nó giúp bên nhận thấy thuốc đang được chỉ định thay vì chỉ đọc trong tài liệu PDF.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ định thuốc để xem siêu dữ liệu và xuất FHIR MedicationRequest.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateMedicationRequest(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={medicationRequestForm.encounterId}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán liên quan
            <select
              value={medicationRequestForm.reasonConditionId}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, reasonConditionId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display} · {condition.code.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại chỉ định
            <select
              value={medicationRequestForm.category}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  category: event.target.value as MedicationRequestCategory
                })
              }
            >
              <option value="outpatient">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="community">Cộng đồng</option>
              <option value="discharge">Ra viện</option>
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              value={medicationRequestForm.priority}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  priority: event.target.value as MedicationRequestPriority
                })
              }
            >
              <option value="routine">Thường quy</option>
              <option value="urgent">Khẩn</option>
              <option value="asap">Càng sớm càng tốt</option>
              <option value="stat">Ngay lập tức</option>
            </select>
          </label>
          <label>
            Hệ mã thuốc
            <input
              value={medicationRequestForm.medicationSystem}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã thuốc
            <input
              value={medicationRequestForm.medicationCode}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationCode: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên thuốc
            <input
              value={medicationRequestForm.medicationDisplay}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationDisplay: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Hướng dẫn dùng
            <input
              value={medicationRequestForm.dosageText}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, dosageText: event.target.value })
              }
            />
          </label>
          <label>
            Đường dùng
            <input
              value={medicationRequestForm.route}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, route: event.target.value })
              }
            />
          </label>
          <label>
            Liều lượng
            <input
              type="number"
              step="any"
              value={medicationRequestForm.doseValue}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, doseValue: event.target.value })
              }
            />
          </label>
          <label>
            Đơn vị liều
            <input
              value={medicationRequestForm.doseUnit}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, doseUnit: event.target.value })
              }
            />
          </label>
          <label>
            Tần suất
            <input
              type="number"
              value={medicationRequestForm.frequency}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, frequency: event.target.value })
              }
            />
          </label>
          <label>
            Chu kỳ
            <input
              type="number"
              step="any"
              value={medicationRequestForm.period}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, period: event.target.value })
              }
            />
          </label>
          <label>
            Đơn vị chu kỳ
            <select
              value={medicationRequestForm.periodUnit}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  periodUnit: event.target.value as MedicationTimingUnit
                })
              }
            >
              <option value="h">Giờ</option>
              <option value="d">Ngày</option>
              <option value="wk">Tuần</option>
            </select>
          </label>
          <label>
            Thời điểm kê
            <input
              type="datetime-local"
              value={medicationRequestForm.authoredOn}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, authoredOn: event.target.value })
              }
            />
          </label>
          <label>
            Số ngày cấp
            <input
              type="number"
              value={medicationRequestForm.expectedSupplyDurationDays}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  expectedSupplyDurationDays: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Người kê
            <input
              value={medicationRequestForm.requesterPractitionerId}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  requesterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={medicationRequestForm.note}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, note: event.target.value })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={!selectedPatient || isSubmittingMedicationRequest}
          >
            {isSubmittingMedicationRequest ? "Đang ghi nhận..." : "Ghi nhận chỉ định thuốc"}
          </button>
        </form>
      </article>
    );
  }

  function renderMedicationDispensePanel(): ReactNode {
    return (
      <article className="panel medication-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">FHIR MedicationDispense</p>
            <h2>Cấp phát thuốc</h2>
          </div>
          <span className="pill cyan">
            {isLoadingMedicationDispenses
              ? "đang tải"
              : `${medicationDispenses.length} lần cấp`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {medicationDispenses.map((medicationDispense) => (
              <button
                className={
                  medicationDispense.id === selectedMedicationDispenseId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={medicationDispense.id}
                type="button"
                onClick={() => setSelectedMedicationDispenseId(medicationDispense.id)}
              >
                <span>{formatMedicationDispenseCategory(medicationDispense.category)}</span>
                <strong>{medicationDispense.medicationCode.display}</strong>
                <small>
                  {formatMedicationDispenseStatus(medicationDispense.status)} ·{" "}
                  {formatDateTime(
                    medicationDispense.whenHandedOver ??
                      medicationDispense.whenPrepared ??
                      medicationDispense.updatedAt
                  )}
                </small>
              </button>
            ))}
            {medicationDispenses.length === 0 ? (
              <p className="empty-state">
                Chưa có bản ghi cấp phát thuốc. Bước này nằm giữa kê đơn và dùng thuốc,
                giúp phân biệt “đã chỉ định” với “khoa dược/kho đã bàn giao thuốc”.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedMedicationDispense ? (
              <>
                <div className="document-meta">
                  <Info label="Thuốc" value={selectedMedicationDispense.medicationCode.display} />
                  <Info label="Trạng thái" value={formatMedicationDispenseStatus(selectedMedicationDispense.status)} />
                  <Info label="Loại cấp phát" value={formatMedicationDispenseCategory(selectedMedicationDispense.category)} />
                  <Info label="Số lượng" value={formatMedicationDispenseQuantity(selectedMedicationDispense.quantity)} />
                  <Info label="Số ngày cấp" value={formatMedicationDispenseQuantity(selectedMedicationDispense.daysSupply)} />
                  <Info label="Thời điểm" value={formatMedicationDispenseTime(selectedMedicationDispense)} />
                  <Info label="Gắn chỉ định" value={selectedMedicationDispense.medicationRequestId ?? "Chưa gắn"} />
                  <Info label="Người cấp phát" value={selectedMedicationDispense.dispenserPractitionerId ?? "Chưa gắn"} />
                  <Info label="Người nhận" value={selectedMedicationDispense.receiverPractitionerId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Tài nguyên FHIR MedicationDispense mô tả sự kiện cấp phát thuốc, thường do khoa dược
                  hoặc kho thuốc thực hiện. Các trường trên là siêu dữ liệu giúp hồ sơ liên viện
                  biết thuốc đã được cấp bao nhiêu, vào lúc nào và dựa trên chỉ định nào.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một lần cấp phát để xem siêu dữ liệu và xuất FHIR MedicationDispense.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateMedicationDispense(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={medicationDispenseForm.encounterId}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  encounterId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Gắn chỉ định thuốc (MedicationRequest)
            <select
              value={medicationDispenseForm.medicationRequestId}
              onChange={(event) => {
                const medicationRequest = medicationRequests.find(
                  (request) => request.id === event.target.value
                );
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationRequestId: event.target.value,
                  medicationSystem:
                    medicationRequest?.medicationCode.system ??
                    medicationDispenseForm.medicationSystem,
                  medicationCode:
                    medicationRequest?.medicationCode.code ??
                    medicationDispenseForm.medicationCode,
                  medicationDisplay:
                    medicationRequest?.medicationCode.display ??
                    medicationDispenseForm.medicationDisplay,
                  dosageText:
                    medicationRequest?.dosageInstruction.text ??
                    medicationDispenseForm.dosageText,
                  route:
                    medicationRequest?.dosageInstruction.route ??
                    medicationDispenseForm.route,
                  doseValue:
                    medicationRequest?.dosageInstruction.doseQuantity?.value.toString() ??
                    medicationDispenseForm.doseValue,
                  doseUnit:
                    medicationRequest?.dosageInstruction.doseQuantity?.unit ??
                    medicationDispenseForm.doseUnit,
                  frequency:
                    medicationRequest?.dosageInstruction.frequency?.toString() ??
                    medicationDispenseForm.frequency,
                  period:
                    medicationRequest?.dosageInstruction.period?.toString() ??
                    medicationDispenseForm.period,
                  periodUnit:
                    medicationRequest?.dosageInstruction.periodUnit ??
                    medicationDispenseForm.periodUnit,
                  daysSupplyValue:
                    medicationRequest?.expectedSupplyDurationDays?.toString() ??
                    medicationDispenseForm.daysSupplyValue
                });
              }}
            >
              <option value="">Không gắn</option>
              {medicationRequests.map((medicationRequest) => (
                <option key={medicationRequest.id} value={medicationRequest.id}>
                  {medicationRequest.medicationCode.display} · {formatDateTime(medicationRequest.authoredOn)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại cấp phát
            <select
              value={medicationDispenseForm.category}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  category: event.target.value as MedicationDispenseCategory
                })
              }
            >
              <option value="outpatient">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="community">Cộng đồng</option>
              <option value="discharge">Ra viện</option>
            </select>
          </label>
          <label className="wide-field">
            Tên thuốc
            <input
              value={medicationDispenseForm.medicationDisplay}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationDisplay: event.target.value
                })
              }
            />
          </label>
          <label>
            Hệ mã thuốc
            <input
              value={medicationDispenseForm.medicationSystem}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationSystem: event.target.value
                })
              }
            />
          </label>
          <label>
            Mã thuốc
            <input
              value={medicationDispenseForm.medicationCode}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationCode: event.target.value
                })
              }
            />
          </label>
          <label>
            Số lượng cấp
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.quantityValue}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  quantityValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị cấp
            <input
              value={medicationDispenseForm.quantityUnit}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  quantityUnit: event.target.value
                })
              }
            />
          </label>
          <label>
            Số ngày cấp
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.daysSupplyValue}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  daysSupplyValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Chuẩn bị thuốc
            <input
              type="datetime-local"
              value={medicationDispenseForm.whenPrepared}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  whenPrepared: event.target.value
                })
              }
            />
          </label>
          <label>
            Bàn giao thuốc
            <input
              type="datetime-local"
              value={medicationDispenseForm.whenHandedOver}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  whenHandedOver: event.target.value
                })
              }
            />
          </label>
          <label>
            Người cấp phát
            <input
              value={medicationDispenseForm.dispenserPractitionerId}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  dispenserPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label>
            Người nhận thuốc
            <input
              value={medicationDispenseForm.receiverPractitionerId}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  receiverPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Hướng dẫn sau cấp phát
            <input
              value={medicationDispenseForm.dosageText}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  dosageText: event.target.value
                })
              }
            />
          </label>
          <label>
            Đường dùng
            <input
              value={medicationDispenseForm.route}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  route: event.target.value
                })
              }
            />
          </label>
          <label>
            Liều
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.doseValue}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  doseValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị liều
            <input
              value={medicationDispenseForm.doseUnit}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  doseUnit: event.target.value
                })
              }
            />
          </label>
          <label>
            Tần suất
            <input
              type="number"
              value={medicationDispenseForm.frequency}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  frequency: event.target.value
                })
              }
            />
          </label>
          <label>
            Chu kỳ
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.period}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  period: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị chu kỳ
            <select
              value={medicationDispenseForm.periodUnit}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  periodUnit: event.target.value as MedicationTimingUnit
                })
              }
            >
              <option value="h">Giờ</option>
              <option value="d">Ngày</option>
              <option value="wk">Tuần</option>
            </select>
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={medicationDispenseForm.note}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  note: event.target.value
                })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={!selectedPatient || isSubmittingMedicationDispense}
          >
            {isSubmittingMedicationDispense
              ? "Đang ghi nhận..."
              : "Ghi nhận cấp phát thuốc"}
          </button>
        </form>
      </article>
    );
  }

  function renderMedicationAdministrationPanel(): ReactNode {
    return (
      <article className="panel medication-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Medication administrations</p>
            <h2>Dùng thuốc thực tế</h2>
          </div>
          <span className="pill cyan">
            {isLoadingMedicationAdministrations
              ? "đang tải"
              : `${medicationAdministrations.length} lần dùng`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {medicationAdministrations.map((medicationAdministration) => (
              <button
                className={
                  medicationAdministration.id === selectedMedicationAdministrationId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={medicationAdministration.id}
                type="button"
                onClick={() => setSelectedMedicationAdministrationId(medicationAdministration.id)}
              >
                <span>{formatMedicationAdministrationCategory(medicationAdministration.category)}</span>
                <strong>{medicationAdministration.medicationCode.display}</strong>
                <small>
                  {formatMedicationAdministrationStatus(medicationAdministration.status)} ·{" "}
                  {formatDateTime(
                    medicationAdministration.effectivePeriod.start ??
                      medicationAdministration.updatedAt
                  )}
                </small>
              </button>
            ))}
            {medicationAdministrations.length === 0 ? (
              <p className="empty-state">
                Chưa có bản ghi dùng thuốc thực tế. Hãy xác nhận sau khi có
                MedicationRequest để phân biệt “chỉ định” với “đã dùng”.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedMedicationAdministration ? (
              <>
                <div className="document-meta">
                  <Info label="Thuốc" value={selectedMedicationAdministration.medicationCode.display} />
                  <Info label="Trạng thái" value={formatMedicationAdministrationStatus(selectedMedicationAdministration.status)} />
                  <Info label="Bối cảnh" value={formatMedicationAdministrationCategory(selectedMedicationAdministration.category)} />
                  <Info label="Thời điểm" value={formatMedicationAdministrationPeriod(selectedMedicationAdministration.effectivePeriod)} />
                  <Info label="Liều thực tế" value={formatMedicationAdministrationDose(selectedMedicationAdministration.dosage)} />
                  <Info label="Gắn đơn thuốc" value={selectedMedicationAdministration.medicationRequestId ?? "Chưa gắn"} />
                  <Info label="Người xác nhận" value={formatMedicationAdministrationPerformers(selectedMedicationAdministration.performers)} />
                  <Info label="Chẩn đoán liên quan" value={selectedMedicationAdministration.reasonConditionId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  MedicationAdministration là sự kiện thuốc đã được dùng hoặc
                  được xác nhận dùng. Đây là phần giúp EMR đóng vòng điều trị:
                  bác sĩ kê, hệ thống lưu chỉ định, nhân sự y tế xác nhận dùng
                  và FHIR Bundle có thể chuyển sang bệnh viện khác.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một lần dùng thuốc để xem siêu dữ liệu và xuất FHIR MedicationAdministration.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateMedicationAdministration(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={medicationAdministrationForm.encounterId}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  encounterId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Gắn chỉ định thuốc (MedicationRequest)
            <select
              value={medicationAdministrationForm.medicationRequestId}
              onChange={(event) => {
                const medicationRequest = medicationRequests.find(
                  (request) => request.id === event.target.value
                );
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationRequestId: event.target.value,
                  reasonConditionId:
                    medicationRequest?.reasonConditionId ??
                    medicationAdministrationForm.reasonConditionId,
                  medicationSystem:
                    medicationRequest?.medicationCode.system ??
                    medicationAdministrationForm.medicationSystem,
                  medicationCode:
                    medicationRequest?.medicationCode.code ??
                    medicationAdministrationForm.medicationCode,
                  medicationDisplay:
                    medicationRequest?.medicationCode.display ??
                    medicationAdministrationForm.medicationDisplay,
                  dosageText:
                    medicationRequest?.dosageInstruction.text ??
                    medicationAdministrationForm.dosageText,
                  doseValue:
                    medicationRequest?.dosageInstruction.doseQuantity?.value.toString() ??
                    medicationAdministrationForm.doseValue,
                  doseUnit:
                    medicationRequest?.dosageInstruction.doseQuantity?.unit ??
                    medicationAdministrationForm.doseUnit
                });
              }}
            >
              <option value="">Không gắn</option>
              {medicationRequests.map((medicationRequest) => (
                <option key={medicationRequest.id} value={medicationRequest.id}>
                  {medicationRequest.medicationCode.display} · {formatDateTime(medicationRequest.authoredOn)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán liên quan
            <select
              value={medicationAdministrationForm.reasonConditionId}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  reasonConditionId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display} · {condition.code.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Bối cảnh dùng thuốc
            <select
              value={medicationAdministrationForm.category}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  category: event.target.value as MedicationAdministrationCategory
                })
              }
            >
              <option value="outpatient">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="community">Cộng đồng</option>
              <option value="patient-specified">Bệnh nhân tự khai</option>
            </select>
          </label>
          <label>
            Thời điểm dùng
            <input
              type="datetime-local"
              value={medicationAdministrationForm.effectiveStart}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  effectiveStart: event.target.value
                })
              }
            />
          </label>
          <label>
            Người/thiết bị xác nhận
            <input
              value={medicationAdministrationForm.performerActorId}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  performerActorId: event.target.value
                })
              }
            />
          </label>
          <label>
            Vai trò xác nhận
            <input
              value={medicationAdministrationForm.performerFunctionDisplay}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  performerFunctionDisplay: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Tên thuốc
            <input
              value={medicationAdministrationForm.medicationDisplay}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationDisplay: event.target.value
                })
              }
            />
          </label>
          <label>
            Hệ mã thuốc
            <input
              value={medicationAdministrationForm.medicationSystem}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationSystem: event.target.value
                })
              }
            />
          </label>
          <label>
            Mã thuốc
            <input
              value={medicationAdministrationForm.medicationCode}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationCode: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả liều thực tế
            <input
              value={medicationAdministrationForm.dosageText}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  dosageText: event.target.value
                })
              }
            />
          </label>
          <label>
            Liều
            <input
              type="number"
              step="any"
              value={medicationAdministrationForm.doseValue}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  doseValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị
            <input
              value={medicationAdministrationForm.doseUnit}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  doseUnit: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={medicationAdministrationForm.note}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  note: event.target.value
                })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={!selectedPatient || isSubmittingMedicationAdministration}
          >
            {isSubmittingMedicationAdministration
              ? "Đang ghi nhận..."
              : "Ghi nhận dùng thuốc"}
          </button>
        </form>
      </article>
    );
  }

  function renderDocumentPanel(): ReactNode {
    return (
      <article className="panel document-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Document center</p>
            <h2>Tài liệu bệnh án</h2>
          </div>
          <span className="pill cyan">{isLoadingDocuments ? "đang tải" : `${clinicalDocuments.length} tài liệu`}</span>
        </div>

        <div className="taxonomy-strip" aria-label="Phân loại tài liệu tham chiếu OpenEMR">
          {documentTaxonomy.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="document-layout">
          <div className="document-cards">
            {clinicalDocuments.map((document) => (
              <button
                className={document.id === selectedDocumentId ? "document-card selected" : "document-card"}
                key={document.id}
                type="button"
                onClick={() => setSelectedDocumentId(document.id)}
              >
                <span>{formatDocumentType(document.type)}</span>
                <strong>{document.title}</strong>
                <small>
                  {formatDocumentStatus(document.status)} ·{" "}
                  {document.encounterId ? `Encounter ${document.encounterId}` : "Chưa gắn encounter"}
                </small>
              </button>
            ))}
            {clinicalDocuments.length === 0 ? (
              <p className="empty-state">Bệnh nhân này chưa có tài liệu bệnh án.</p>
            ) : null}
          </div>

          <div className="document-summary">
            {selectedDocument ? (
              <>
                <div className="document-meta">
                  <Info label="Loại tài liệu" value={formatDocumentType(selectedDocument.type)} />
                  <Info label="Trạng thái" value={formatDocumentStatus(selectedDocument.status)} />
                  <Info label="Encounter" value={selectedDocument.encounterId ?? "Chưa gắn"} />
                  <Info label="Người tạo" value={selectedDocument.authorPractitionerId} />
                  <Info label="Định dạng" value={selectedDocument.attachmentContentType ?? "Chưa có"} />
                  <Info
                    label="Dung lượng"
                    value={
                      selectedDocument.attachmentSizeBytes !== undefined
                        ? `${selectedDocument.attachmentSizeBytes.toLocaleString("vi-VN")} byte`
                        : "Chưa có"
                    }
                  />
                  <Info
                    label="Hash SHA-1"
                    value={selectedDocument.attachmentHashSha1Base64 ?? "Chưa có"}
                  />
                </div>
                <code>{selectedDocument.storageUri}</code>
                <div className="action-row">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={selectedDocument.status !== "draft" || isSigningDocument}
                    onClick={() => void handleSignClinicalDocument(selectedDocument.id)}
                  >
                    {isSigningDocument ? "Đang ký..." : "Ký tài liệu nháp"}
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một tài liệu để xem siêu dữ liệu và thao tác ký.</p>
            )}
          </div>
        </div>

        <form className="document-form" onSubmit={(event) => void handleCreateClinicalDocument(event)}>
          <label>
            Loại tài liệu
            <select
              value={documentForm.type}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, type: event.target.value as ClinicalDocumentType })
              }
            >
              <option value="referral-letter">Giấy chuyển tuyến</option>
              <option value="discharge-summary">Tóm tắt ra viện</option>
              <option value="lab-report">Kết quả xét nghiệm</option>
              <option value="imaging-report">Kết quả chẩn đoán hình ảnh</option>
              <option value="admission-note">Phiếu nhập viện</option>
              <option value="consent-form">Phiếu đồng ý điều trị</option>
              <option value="advance-directive">Chỉ dẫn chăm sóc trước</option>
              <option value="ccda">CCDA</option>
              <option value="ccr">CCR</option>
              <option value="medical-record">Hồ sơ bệnh án</option>
              <option value="patient-information">Thông tin bệnh nhân</option>
            </select>
          </label>
          <label>
            Gắn với lượt khám
            <select
              value={documentForm.encounterId}
              onChange={(event) => setDocumentForm({ ...documentForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            Tiêu đề tài liệu
            <input
              value={documentForm.title}
              onChange={(event) => setDocumentForm({ ...documentForm, title: event.target.value })}
            />
          </label>
          <label className="wide-field">
            URI lưu trữ
            <input
              value={documentForm.storageUri}
              onChange={(event) => setDocumentForm({ ...documentForm, storageUri: event.target.value })}
            />
          </label>
          <label>
            Định dạng MIME
            <input
              value={documentForm.attachmentContentType}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentContentType: event.target.value })
              }
            />
          </label>
          <label>
            Dung lượng byte
            <input
              inputMode="numeric"
              min="0"
              type="number"
              value={documentForm.attachmentSizeBytes}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentSizeBytes: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Hash SHA-1 Base64
            <input
              value={documentForm.attachmentHashSha1Base64}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentHashSha1Base64: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm tạo tệp
            <input
              type="datetime-local"
              value={documentForm.attachmentCreatedAt}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentCreatedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Mã bác sĩ/người tạo
            <input
              value={documentForm.authorPractitionerId}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, authorPractitionerId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingDocument}>
            {isSubmittingDocument ? "Đang tạo..." : "Tạo tài liệu bệnh án"}
          </button>
        </form>
      </article>
    );
  }

  function renderGlobalAuditPanel(): ReactNode {
    const loginEventCount = globalAuditEvents.filter((event) =>
      event.action.startsWith("auth.login.")
    ).length;
    const deniedEventCount = globalAuditEvents.filter(
      (event) => event.action === "access.denied"
    ).length;
    const latestEvent = globalAuditEvents[0];

    return (
      <article className="panel audit-panel global-audit-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Vận hành bảo mật</p>
            <h2>Nhật ký bảo mật toàn hệ thống</h2>
            <p className="panel-note">
              Theo dõi đăng nhập, truy cập bị chặn và các bản ghi kiểm toán không gắn trực tiếp với
              một bệnh nhân cụ thể.
            </p>
          </div>
          <div className="panel-actions">
            <button
              className="ghost-button"
              type="button"
              disabled={isLoadingGlobalAuditEvents || !canReadAudit}
              onClick={() => void loadGlobalAuditEvents()}
            >
              {isLoadingGlobalAuditEvents
                ? "Đang tải..."
                : canReadAudit
                  ? "Tải nhật ký toàn hệ thống"
                  : "Cần quyền kiểm toán"}
            </button>
          </div>
        </div>

        <div className="security-audit-summary">
          <div>
            <span>Tổng bản ghi</span>
            <strong>{globalAuditEvents.length}</strong>
          </div>
          <div>
            <span>Đăng nhập</span>
            <strong>{loginEventCount}</strong>
          </div>
          <div>
            <span>Bị chặn</span>
            <strong>{deniedEventCount}</strong>
          </div>
          <div>
            <span>Mới nhất</span>
            <strong>{latestEvent ? formatDateTime(latestEvent.occurredAt) : "Chưa có"}</strong>
          </div>
        </div>

        <div className="audit-list">
          {globalAuditEvents.slice(0, 12).map((event) => (
            <div className="audit-item audit-item--global" key={event.id ?? `${event.occurredAt}:${event.action}`}>
              <div>
                <span>{formatDateTime(event.occurredAt)}</span>
                <strong>{formatAuditAction(event.action)}</strong>
              </div>
              <div>
                <span>Tác nhân</span>
                <strong>{event.actorId}</strong>
              </div>
              <div>
                <span>Tài nguyên</span>
                <strong>
                  {formatAuditResourceType(event.resourceType)} · {event.resourceId}
                </strong>
              </div>
              <div>
                <span>Phạm vi</span>
                <strong>{event.patientId ? `Bệnh nhân ${event.patientId}` : "Toàn hệ thống"}</strong>
              </div>
              <div>
                <span>Chi tiết</span>
                <strong>{formatAuditMetadataSummary(event)}</strong>
              </div>
            </div>
          ))}
          {globalAuditEvents.length === 0 ? (
            <p className="empty-state">
              {canReadAudit
                ? "Chưa có bản ghi kiểm toán toàn hệ thống. Hãy đăng nhập lại, thử truy cập bị chặn hoặc tải nhật ký theo bệnh nhân để phát sinh log."
                : "Nhật ký bảo mật toàn hệ thống chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  function renderAuditPanel(): ReactNode {
    return (
      <>
        <article className="panel audit-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Security trace</p>
              <h2>Nhật ký kiểm toán</h2>
            </div>
            <div className="panel-actions">
              <button
                className="ghost-button"
                type="button"
                disabled={!selectedPatient || isLoadingAuditEvents || !canReadAudit}
                onClick={() => selectedPatient && void loadAuditEvents(selectedPatient.id)}
              >
                {isLoadingAuditEvents ? "Đang tải..." : canReadAudit ? "Tải audit" : "Cần quyền kiểm toán"}
              </button>
              <button
                className="ghost-button"
                type="button"
                disabled={!selectedPatient || isVerifyingAuditIntegrity || !canReadAudit}
                onClick={() => selectedPatient && void verifyAuditIntegrity(selectedPatient.id)}
              >
                {isVerifyingAuditIntegrity ? "Đang xác minh..." : "Kiểm tra toàn vẹn"}
              </button>
              <button
                className="ghost-button"
                type="button"
                disabled={!selectedPatient || isExportingAuditFhir || !canReadAudit}
                onClick={() => selectedPatient && void loadAuditFhirBundle(selectedPatient.id)}
              >
                {isExportingAuditFhir ? "Đang xuất..." : "Xuất FHIR AuditEvent"}
              </button>
            </div>
          </div>

          {auditIntegrityReport ? (
            <div className={`integrity-card integrity-card--${auditIntegrityReport.status}`}>
              <div>
                <span>Trạng thái chuỗi băm</span>
                <strong>{formatAuditIntegrityStatus(auditIntegrityReport.status)}</strong>
              </div>
              <div>
                <span>Số bản ghi đã kiểm</span>
                <strong>
                  {auditIntegrityReport.sealedEvents}/{auditIntegrityReport.totalEvents}
                </strong>
              </div>
              <div>
                <span>Lần kiểm tra</span>
                <strong>{formatDateTime(auditIntegrityReport.checkedAt)}</strong>
              </div>
              <div>
                <span>Hash mới nhất</span>
                <strong className="hash-text">{auditIntegrityReport.latestHash ?? "Chưa có"}</strong>
              </div>
              {auditIntegrityReport.verified ? null : (
                <p>
                  Điểm cần kiểm tra: {auditIntegrityReport.brokenAtEventId ?? "không xác định"} ·{" "}
                  {formatAuditIntegrityReason(auditIntegrityReport.brokenReason)}
                </p>
              )}
            </div>
          ) : null}

          <div className="audit-list">
            {auditEvents.map((event) => (
              <div className="audit-item" key={event.id ?? `${event.occurredAt}:${event.action}`}>
                <div>
                  <span>{formatDateTime(event.occurredAt)}</span>
                  <strong>{formatAuditAction(event.action)}</strong>
                </div>
                <div>
                  <span>Actor</span>
                  <strong>{event.actorId}</strong>
                </div>
                <div>
                  <span>Tài nguyên</span>
                  <strong>
                    {formatAuditResourceType(event.resourceType)} · {event.resourceId}
                  </strong>
                </div>
                <div>
                  <span>Mục đích</span>
                  <strong>
                    {event.purposeOfUse ?? "Chưa khai báo"}
                    {typeof event.metadata.actorRole === "string" ? ` · ${event.metadata.actorRole}` : ""}
                  </strong>
                </div>
                <div>
                  <span>Toàn vẹn</span>
                  <strong>{event.integrityHash ? "Đã niêm phong" : "Chưa niêm phong"}</strong>
                </div>
              </div>
            ))}
            {auditEvents.length === 0 ? (
              <p className="empty-state">
                {canReadAudit
                  ? "Chưa có audit event cho bệnh nhân đang chọn. Hãy xem FHIR, mở lượt khám hoặc ký tài liệu để phát sinh log."
                  : "Nhật ký kiểm toán chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
              </p>
            ) : null}
          </div>
        </article>
        <FhirPanel title="FHIR AuditEvent Bundle JSON" badge="AuditEvent" value={auditFhirBundlePreview} />
      </>
    );
  }

  function renderCreatePatientPanel(): ReactNode {
    return (
      <article className="panel create-panel">
        <div>
          <p className="eyebrow">Intake</p>
          <h2>Tạo nhanh hồ sơ mới</h2>
        </div>

        <form className="patient-form" onSubmit={(event) => void handleCreatePatient(event)}>
          <label>
            Họ tên
            <input
              value={patientForm.fullName}
              onChange={(event) => setPatientForm({ ...patientForm, fullName: event.target.value })}
            />
          </label>
          <label>
            Số định danh
            <input
              value={patientForm.nationalId}
              onChange={(event) => setPatientForm({ ...patientForm, nationalId: event.target.value })}
            />
          </label>
          <label>
            Mã hồ sơ bệnh viện
            <input
              value={patientForm.hospitalMrn}
              onChange={(event) => setPatientForm({ ...patientForm, hospitalMrn: event.target.value })}
            />
          </label>
          <label>
            Ngày sinh
            <input
              type="date"
              value={patientForm.birthDate}
              onChange={(event) => setPatientForm({ ...patientForm, birthDate: event.target.value })}
            />
          </label>
          <label>
            Giới tính
            <select
              value={patientForm.gender}
              onChange={(event) => setPatientForm({ ...patientForm, gender: event.target.value as PatientGender })}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
              <option value="unknown">Chưa rõ</option>
            </select>
          </label>
          <label>
            Điện thoại
            <input
              value={patientForm.phone}
              onChange={(event) => setPatientForm({ ...patientForm, phone: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Địa chỉ
            <input
              value={patientForm.address}
              onChange={(event) => setPatientForm({ ...patientForm, address: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Cơ sở quản lý
            <input
              value={patientForm.managingOrganizationId}
              onChange={(event) =>
                setPatientForm({ ...patientForm, managingOrganizationId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmittingPatient}>
            {isSubmittingPatient ? "Đang tạo..." : "Tạo hồ sơ bệnh nhân"}
          </button>
        </form>
      </article>
    );
  }
}

function LandingPage({
  onDemo,
  onLogin
}: {
  readonly onDemo: () => void;
  readonly onLogin: () => void;
}) {
  return (
    <main className="marketing-shell">
      <nav className="marketing-nav" aria-label="Điều hướng giới thiệu">
        <strong>WiiiCare Nexus</strong>
        <div>
          <button className="ghost-button" type="button" onClick={onLogin}>
            Đăng nhập
          </button>
          <button className="primary-button" type="button" onClick={onDemo}>
            Vào phiên demo
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div>
          <p className="eyebrow">HoLiLiHu · The Wiii Lab</p>
          <h1>Nền tảng bệnh án điện tử mở cho liên thông y tế</h1>
          <p className="lede">
            WiiiCare Nexus mô phỏng lõi EMR hiện đại: hồ sơ bệnh nhân, Provider Directory, lượt khám, dị ứng, chẩn đoán,
            chỉ định dịch vụ, Task thực thi, Procedure đã thực hiện, chỉ số lâm sàng, báo cáo kết quả, chỉ định thuốc, cấp phát thuốc, dùng thuốc thực tế, tài liệu bệnh án, gói chuyển hồ sơ, audit trail và ánh xạ FHIR để chuẩn bị kết nối giữa các bệnh viện.
          </p>
          <div className="landing-actions">
            <button className="primary-button" type="button" onClick={onLogin}>
              Đăng nhập demo
            </button>
            <button className="ghost-button" type="button" onClick={onDemo}>
              Vào nhanh bằng tài khoản bác sĩ demo
            </button>
          </div>
        </div>
        <aside className="landing-card">
          <span>Product slice</span>
          <strong>Patient → Provider Directory → Encounter → AllergyIntolerance → Condition → ServiceRequest → Task → Procedure → Observation → DiagnosticReport → ImagingStudy → MedicationRequest → MedicationDispense → MedicationAdministration → Document → RecordTransfer → FHIR</strong>
          <small>Không còn là landing page đơn thuần; app có luồng vận hành sau đăng nhập.</small>
        </aside>
      </section>

      <section className="landing-grid">
        {[
          ["Patient Workspace", "Bàn làm việc theo bệnh nhân, giống nhịp vận hành EMR thật."],
          ["Document Center", "Quản lý CCR, CCDA, hồ sơ bệnh án, xét nghiệm và tài liệu chuyển tuyến."],
          ["Audit & RBAC", "Ghi log truy cập nhạy cảm và kiểm tra quyền theo vai trò demo."],
          ["Liên thông FHIR", "Xuất Patient, Provider Directory, Encounter, AllergyIntolerance, Condition, ServiceRequest, Task, Procedure, Observation, DiagnosticReport, ImagingStudy, MedicationRequest, MedicationDispense, MedicationAdministration, DocumentReference, Provenance và Task chuyển hồ sơ để chuẩn bị liên thông."]
        ].map(([title, description]) => (
          <article className="panel" key={title}>
            <p className="eyebrow">{title}</p>
            <h2>{title}</h2>
            <p className="empty-state">{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function LoginPage({
  error,
  form,
  onBack,
  onChange,
  onSubmit
}: {
  readonly error?: string;
  readonly form: LoginForm;
  readonly onBack: () => void;
  readonly onChange: (form: LoginForm) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <button className="ghost-button" type="button" onClick={onBack}>
          Quay lại landing
        </button>
        <div>
          <p className="eyebrow">Secure access</p>
          <h1>Đăng nhập WiiiCare Nexus</h1>
          <p className="lede">
            Đây là đăng nhập demo để trình bày luồng sản phẩm. Khi lên sản phẩm thật, lớp này cần
            thay bằng IAM/SSO, MFA, quản lý phiên và chính sách bảo mật đầy đủ.
          </p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Tài khoản
            <input
              value={form.username}
              onChange={(event) => onChange({ ...form, username: event.target.value })}
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={form.password}
              onChange={(event) => onChange({ ...form, password: event.target.value })}
            />
          </label>
          <label>
            Vai trò demo
            <select
              value={form.role}
              onChange={(event) => onChange(loginPresets[event.target.value as DemoRole])}
            >
              <option value="clinician">Bác sĩ / điều trị</option>
              <option value="nurse">Điều dưỡng / tiếp nhận</option>
              <option value="auditor">Kiểm toán</option>
              <option value="admin">Quản trị</option>
            </select>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit">
            Đăng nhập demo
          </button>
        </form>
      </section>
    </main>
  );
}

function AuthenticatedLayout({
  apiBaseUrl,
  children,
  currentRoute,
  onLogout,
  onNavigate,
  statusMessage,
  userName,
  userRole
}: {
  readonly apiBaseUrl: string;
  readonly children: ReactNode;
  readonly currentRoute: AppRoute;
  readonly onLogout: () => void;
  readonly onNavigate: (route: AppRoute) => void;
  readonly statusMessage: string;
  readonly userName: string;
  readonly userRole: DemoRole;
}) {
  return (
    <main className="app-layout">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span>WiiiCare</span>
          <strong>Nexus</strong>
        </div>
        <nav className="app-nav" aria-label="Điều hướng ứng dụng">
          {navigationItems.map((item) => (
            <button
              className={currentRoute === item.route ? "selected" : ""}
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
            >
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </button>
          ))}
        </nav>
        <button className="ghost-button logout-button" type="button" onClick={onLogout}>
          Đăng xuất
        </button>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div>
            <span>{apiBaseUrl}</span>
            <strong>{statusMessage}</strong>
          </div>
          <div className="user-chip">
            <span>{formatDemoRole(userRole)}</span>
            <strong>{userName}</strong>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

function PageHeader({
  description,
  eyebrow,
  title
}: {
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}) {
  return (
    <section className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lede">{description}</p>
    </section>
  );
}

function MetricCard({
  label,
  note,
  value
}: {
  readonly label: string;
  readonly note: string;
  readonly value: string;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function FhirPanel({
  title,
  badge,
  value
}: {
  readonly title: string;
  readonly badge: string;
  readonly value: unknown;
}) {
  return (
    <article className="panel fhir-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR facade</p>
          <h2>{title}</h2>
        </div>
        <span className="pill gold">{badge}</span>
      </div>
      <pre>{JSON.stringify(value ?? { note: "Chọn dữ liệu ở workspace để xuất FHIR." }, null, 2)}</pre>
    </article>
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDemoRole(role: DemoRole): string {
  const labels: Record<DemoRole, string> = {
    admin: "Quản trị",
    auditor: "Kiểm toán",
    clinician: "Bác sĩ điều trị",
    integration: "Gateway liên thông",
    nurse: "Điều dưỡng tiếp nhận"
  };

  return labels[role];
}

function formatGender(gender: PatientGender): string {
  const labels: Record<PatientGender, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
    unknown: "Chưa rõ"
  };

  return labels[gender];
}

function formatIdentifierType(type: PatientIdentifierType): string {
  const labels: Record<PatientIdentifierType, string> = {
    "national-id": "Định danh cá nhân",
    "insurance-id": "BHYT",
    "hospital-mrn": "MRN",
    "legacy-id": "Mã cũ"
  };

  return labels[type];
}

function formatEncounterClass(value: EncounterClass): string {
  const labels: Record<EncounterClass, string> = {
    ambulatory: "Ngoại trú",
    inpatient: "Nội trú",
    emergency: "Cấp cứu",
    virtual: "Khám từ xa"
  };

  return labels[value];
}

function formatEncounterStatus(status: EncounterStatus): string {
  const labels: Record<EncounterStatus, string> = {
    planned: "Đã hẹn",
    "in-progress": "Đang mở",
    finished: "Đã kết thúc",
    cancelled: "Đã hủy",
    "entered-in-error": "Nhập lỗi"
  };

  return labels[status];
}

function formatDocumentType(type: ClinicalDocumentType): string {
  const labels: Record<ClinicalDocumentType, string> = {
    "admission-note": "Phiếu nhập viện",
    "discharge-summary": "Tóm tắt ra viện",
    "lab-report": "Kết quả xét nghiệm",
    "imaging-report": "Kết quả chẩn đoán hình ảnh",
    "referral-letter": "Giấy chuyển tuyến",
    "consent-form": "Phiếu đồng ý điều trị",
    "advance-directive": "Chỉ dẫn chăm sóc trước",
    ccda: "CCDA",
    ccr: "CCR",
    "medical-record": "Hồ sơ bệnh án",
    "patient-information": "Thông tin bệnh nhân"
  };

  return labels[type];
}

function formatDocumentStatus(status: ClinicalDocumentStatus): string {
  const labels: Record<ClinicalDocumentStatus, string> = {
    draft: "Bản nháp",
    signed: "Đã ký",
    superseded: "Đã thay thế",
    "entered-in-error": "Nhập lỗi"
  };

  return labels[status];
}

function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    "auth.login.success": "Đăng nhập thành công",
    "auth.login.failure": "Đăng nhập thất bại",
    "access.denied": "Truy cập bị chặn",
    "patient.list": "Tải danh sách bệnh nhân",
    "patient.create": "Tạo hồ sơ bệnh nhân",
    "patient.read": "Xem hồ sơ bệnh nhân",
    "patient.fhir-export": "Xuất FHIR Patient",
    "patient.fhir-bundle-export": "Xuất FHIR Bundle hồ sơ",
    "patient.fhir-document-bundle-export": "Xuất FHIR document Bundle hồ sơ",
    "provider-directory.read": "Xem Provider Directory",
    "provider-directory.fhir-export": "Xuất FHIR Provider Directory",
    "record-transfer.list": "Tải gói chuyển hồ sơ",
    "record-transfer.create": "Tạo gói chuyển hồ sơ",
    "record-transfer.read": "Xem gói chuyển hồ sơ",
    "record-transfer.send": "Gửi gói chuyển hồ sơ",
    "record-transfer.fail": "Ghi nhận lỗi chuyển hồ sơ",
    "record-transfer.retry": "Thử gửi lại gói chuyển hồ sơ",
    "record-transfer.dead-letter": "Đưa gói chuyển hồ sơ vào hàng lỗi cuối",
    "record-transfer.receive": "Xác nhận nhận gói chuyển hồ sơ",
    "record-transfer.acknowledgement-callback": "Callback xác nhận nhận gói chuyển hồ sơ",
    "record-transfer.fhir-export": "Xuất FHIR Task chuyển hồ sơ",
    "encounter.list": "Tải danh sách lượt khám",
    "encounter.create": "Mở lượt khám",
    "encounter.read": "Xem lượt khám",
    "encounter.finish": "Kết thúc lượt khám",
    "encounter.fhir-export": "Xuất FHIR Encounter",
    "allergy-intolerance.list": "Tải dị ứng/cảnh báo",
    "allergy-intolerance.create": "Ghi nhận dị ứng/cảnh báo",
    "allergy-intolerance.read": "Xem dị ứng/cảnh báo",
    "allergy-intolerance.fhir-export": "Xuất FHIR AllergyIntolerance",
    "condition.list": "Tải chẩn đoán/vấn đề sức khỏe",
    "condition.create": "Ghi nhận chẩn đoán/vấn đề sức khỏe",
    "condition.read": "Xem chẩn đoán/vấn đề sức khỏe",
    "condition.fhir-export": "Xuất FHIR Condition",
    "medication-request.list": "Tải chỉ định thuốc",
    "medication-request.create": "Ghi nhận chỉ định thuốc",
    "medication-request.read": "Xem chỉ định thuốc",
    "medication-request.fhir-export": "Xuất FHIR MedicationRequest",
    "medication-dispense.list": "Tải cấp phát thuốc",
    "medication-dispense.create": "Ghi nhận cấp phát thuốc",
    "medication-dispense.read": "Xem cấp phát thuốc",
    "medication-dispense.fhir-export": "Xuất FHIR MedicationDispense",
    "medication-administration.list": "Tải lần dùng thuốc",
    "medication-administration.create": "Ghi nhận dùng thuốc thực tế",
    "medication-administration.read": "Xem lần dùng thuốc",
    "medication-administration.fhir-export": "Xuất FHIR MedicationAdministration",
    "observation.list": "Tải chỉ số lâm sàng",
    "observation.create": "Ghi nhận chỉ số lâm sàng",
    "observation.read": "Xem chỉ số lâm sàng",
    "observation.fhir-export": "Xuất FHIR Observation",
    "service-request.list": "Tải chỉ định dịch vụ",
    "service-request.create": "Tạo chỉ định dịch vụ",
    "service-request.read": "Xem chỉ định dịch vụ",
    "service-request.fhir-export": "Xuất FHIR ServiceRequest",
    "workflow-task.list": "Tải hàng đợi công việc",
    "workflow-task.create": "Tạo công việc thực thi",
    "workflow-task.read": "Xem công việc thực thi",
    "workflow-task.fhir-export": "Xuất FHIR Task",
    "procedure.list": "Tải thủ thuật/hoạt động",
    "procedure.create": "Ghi nhận thủ thuật/hoạt động",
    "procedure.read": "Xem thủ thuật/hoạt động",
    "procedure.fhir-export": "Xuất FHIR Procedure",
    "diagnostic-report.list": "Tải báo cáo kết quả",
    "diagnostic-report.create": "Tạo báo cáo kết quả",
    "diagnostic-report.read": "Xem báo cáo kết quả",
    "diagnostic-report.fhir-export": "Xuất FHIR DiagnosticReport",
    "imaging-study.list": "Tải nghiên cứu hình ảnh",
    "imaging-study.create": "Tạo nghiên cứu hình ảnh",
    "imaging-study.read": "Xem nghiên cứu hình ảnh",
    "imaging-study.fhir-export": "Xuất FHIR ImagingStudy",
    "clinical-document.list": "Tải tài liệu bệnh án",
    "clinical-document.create": "Tạo tài liệu bệnh án",
    "clinical-document.sign": "Ký tài liệu bệnh án",
    "clinical-document.fhir-export": "Xuất FHIR DocumentReference",
    "clinical-document.provenance-export": "Xuất FHIR Provenance tài liệu",
    "consent.list": "Tải đồng ý chia sẻ hồ sơ",
    "consent.create": "Tạo đồng ý chia sẻ hồ sơ",
    "consent.revoke": "Thu hồi đồng ý chia sẻ hồ sơ",
    "consent.fhir-export": "Xuất FHIR Consent",
    "audit-event.list": "Xem nhật ký kiểm toán",
    "audit-event.fhir-export": "Xuất FHIR AuditEvent",
    "audit-event.integrity-verify": "Kiểm tra toàn vẹn audit"
  };

  return labels[action];
}

function formatAuditMetadataSummary(event: AuditEvent): string {
  const reason = event.metadata.reason;
  const denialCode = event.metadata.denialCode;
  const deniedPermission = event.metadata.deniedPermission;
  const actorRole = event.metadata.actorRole ?? event.metadata.deniedActorRole;

  if (typeof reason === "string") {
    return [
      formatAuditReason(reason),
      typeof event.metadata.requestedRole === "string"
        ? `vai trò yêu cầu: ${event.metadata.requestedRole}`
        : undefined
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (typeof denialCode === "string") {
    return [
      formatAuditReason(denialCode),
      typeof deniedPermission === "string" ? deniedPermission : undefined
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (typeof actorRole === "string") {
    return `Vai trò: ${actorRole}`;
  }

  return event.purposeOfUse ?? "Đã ghi nhận";
}

function formatAuditReason(reason: string): string {
  const labels: Record<string, string> = {
    AUTH_RATE_LIMITED: "Vượt giới hạn đăng nhập",
    DEMO_AUTH_DISABLED: "Đăng nhập demo bị tắt",
    FORBIDDEN: "Không đủ quyền",
    INVALID_CREDENTIALS: "Sai thông tin đăng nhập",
    PATIENT_ACCESS_DENIED: "Ngoài phạm vi hồ sơ",
    ROLE_MISMATCH: "Sai vai trò đăng nhập",
    VALIDATION_ERROR: "Dữ liệu không hợp lệ"
  };

  return labels[reason] ?? reason;
}

function formatAuditIntegrityStatus(status: AuditIntegrityStatus): string {
  const labels: Record<AuditIntegrityStatus, string> = {
    broken: "Phát hiện sai lệch",
    unsealed: "Có bản ghi chưa niêm phong",
    verified: "Đã xác minh"
  };

  return labels[status];
}

function formatAuditIntegrityReason(reason: string | undefined): string {
  const labels: Record<string, string> = {
    EVENT_NOT_SEALED: "bản ghi chưa có chuỗi băm",
    INTEGRITY_HASH_MISMATCH: "hash chuỗi không khớp",
    PAYLOAD_HASH_MISMATCH: "nội dung audit đã thay đổi",
    PREVIOUS_HASH_MISMATCH: "liên kết với bản ghi trước không khớp"
  };

  return reason ? labels[reason] ?? reason : "chưa rõ nguyên nhân";
}

function formatAuditResourceType(resourceType: AuditResourceType): string {
  const labels: Record<AuditResourceType, string> = {
    Patient: "Bệnh nhân",
    ProviderDirectory: "Danh bạ cơ sở y tế",
    RecordTransfer: "Gói chuyển hồ sơ",
    Encounter: "Lượt khám",
    AllergyIntolerance: "Dị ứng/cảnh báo",
    Condition: "Chẩn đoán",
    MedicationRequest: "Chỉ định thuốc",
    MedicationDispense: "Cấp phát thuốc",
    MedicationAdministration: "Dùng thuốc thực tế",
    Observation: "Chỉ số lâm sàng",
    ServiceRequest: "Chỉ định dịch vụ",
    Task: "Công việc thực thi",
    Procedure: "Thủ thuật/hoạt động",
    DiagnosticReport: "Báo cáo kết quả",
    ImagingStudy: "Nghiên cứu hình ảnh",
    ClinicalDocument: "Tài liệu",
    Consent: "Consent",
    AuditEvent: "Audit"
  };

  return labels[resourceType];
}

function formatProviderEndpointConnectionType(type: ProviderEndpointConnectionType): string {
  const labels: Record<ProviderEndpointConnectionType, string> = {
    "dicom-wado-rs": "DICOMweb/WADO-RS",
    "direct-project": "Direct Project",
    "hl7-fhir-rest": "HL7 FHIR REST",
    "hl7v2-mllp": "HL7 v2 MLLP",
    "ihe-xds": "IHE XDS",
    other: "Khác"
  };

  return labels[type];
}

function formatConsentStatus(status: ConsentStatus): string {
  const labels: Record<ConsentStatus, string> = {
    active: "Đang hiệu lực",
    revoked: "Đã thu hồi",
    expired: "Hết hiệu lực"
  };

  return labels[status];
}

function formatRecordTransferStatus(status: RecordTransferStatus): string {
  const labels: Record<RecordTransferStatus, string> = {
    cancelled: "Đã hủy",
    completed: "Đã hoàn tất",
    "dead-lettered": "Hàng lỗi cuối",
    draft: "Bản nháp",
    failed: "Lỗi chuyển",
    "in-progress": "Đang xử lý",
    ready: "Sẵn sàng gửi",
    requested: "Đã yêu cầu"
  };

  return labels[status];
}

function formatRecordTransferDeliveryAttemptStatus(
  status: RecordTransferDeliveryAttemptStatus
): string {
  const labels: Record<RecordTransferDeliveryAttemptStatus, string> = {
    failed: "Gửi lỗi",
    queued: "Đang chờ gửi",
    succeeded: "Gửi thành công"
  };

  return labels[status];
}

function formatRecordTransferPriority(priority: RecordTransferPriority): string {
  const labels: Record<RecordTransferPriority, string> = {
    asap: "Càng sớm càng tốt",
    routine: "Thường quy",
    stat: "Cấp cứu",
    urgent: "Khẩn"
  };

  return labels[priority];
}

function formatRecordTransferRetryCount(retryCount: number | undefined): string {
  return `${retryCount ?? 0} lần`;
}

function formatRecordTransferBundleType(bundleType: RecordTransferBundleType): string {
  const labels: Record<RecordTransferBundleType, string> = {
    collection: "FHIR collection Bundle",
    document: "FHIR document Bundle"
  };

  return labels[bundleType];
}

function buildRecordTransferOperationalSummary(
  recordTransfer: RecordTransfer,
  attempts: readonly RecordTransferDeliveryAttempt[]
): RecordTransferOperationalSummary {
  const latestAttempt = getLatestRecordTransferAttempt(attempts);
  const failedAttemptCount = attempts.filter((attempt) => attempt.status === "failed").length;
  const lastHttpStatus = latestAttempt?.httpStatus
    ? `HTTP ${latestAttempt.httpStatus}`
    : "Chưa có";
  const nextRetry = recordTransfer.nextRetryAt
    ? formatDateTime(recordTransfer.nextRetryAt)
    : "Chưa hẹn";
  const technicalSignal = latestAttempt
    ? `Lần #${latestAttempt.attemptNumber}: ${formatRecordTransferDeliveryAttemptStatus(latestAttempt.status)}`
    : "Chưa có delivery attempt";
  const baseMetrics = {
    attemptCount: attempts.length,
    failedAttemptCount,
    lastHttpStatus,
    nextRetry,
    technicalSignal
  };

  if (recordTransfer.status === "completed") {
    return {
      ...baseMetrics,
      severity: "success",
      title: "Đã hoàn tất tiếp nhận",
      description: recordTransfer.receivedAt
        ? `Bên nhận đã xác nhận lúc ${formatDateTime(recordTransfer.receivedAt)}.`
        : "Bên nhận đã xác nhận gói chuyển hồ sơ.",
      nextAction:
        "Đối chiếu biên nhận tiếp nhận, audit trail và FHIR Task để đóng hồ sơ vận hành."
    };
  }

  if (recordTransfer.status === "dead-lettered") {
    return {
      ...baseMetrics,
      severity: "danger",
      title: "Cần can thiệp thủ công",
      description:
        "Gói chuyển đã vượt quá số lần thử tự động hoặc được đưa vào hàng lỗi cuối.",
      nextAction:
        "Kiểm tra endpoint FHIR, consent, mạng, chứng thư/gateway bên nhận rồi tạo quy trình xử lý lại có kiểm soát."
    };
  }

  if (recordTransfer.status === "failed") {
    const retryDue = recordTransfer.nextRetryAt
      ? Date.parse(recordTransfer.nextRetryAt) <= Date.now()
      : false;

    return {
      ...baseMetrics,
      severity: retryDue ? "warning" : "info",
      title: retryDue ? "Đã đến hạn gửi lại" : "Đang chờ lịch gửi lại",
      description:
        recordTransfer.failureReason ??
        "Worker hoặc người vận hành đã ghi nhận lỗi chuyển hồ sơ.",
      nextAction: retryDue
        ? "Đưa gói về hàng đợi gửi lại hoặc kiểm tra nguyên nhân trước khi retry."
        : "Theo dõi mốc retry; nếu lỗi do cấu hình endpoint thì sửa trước khi gửi lại."
    };
  }

  if (recordTransfer.status === "in-progress") {
    if (latestAttempt?.status === "queued") {
      return {
        ...baseMetrics,
        severity: "info",
        title: "Đang chờ delivery worker",
        description:
          "Gói đã được đánh dấu gửi và có delivery attempt trong outbox, nhưng chưa có kết quả POST Bundle.",
        nextAction:
          "Kiểm tra delivery worker có đang bật, hàng đợi có được xử lý và endpoint đích có sẵn sàng."
      };
    }

    if (latestAttempt?.status === "succeeded") {
      return {
        ...baseMetrics,
        severity: "success",
        title: "Đã gửi Bundle, chờ xác nhận nhận",
        description:
          "FHIR Bundle đã được endpoint đích phản hồi thành công; gói vẫn cần biên nhận hoặc mốc received để hoàn tất.",
        nextAction:
          "Chờ acknowledgement callback hoặc xác nhận tiếp nhận từ bệnh viện nhận."
      };
    }

    if (latestAttempt?.status === "failed") {
      return {
        ...baseMetrics,
        severity: "warning",
        title: "Lần gửi gần nhất bị lỗi",
        description: latestAttempt.errorMessage ?? "Endpoint đích chưa nhận thành công FHIR Bundle.",
        nextAction:
          "Xem lỗi của delivery attempt, sửa nguyên nhân và đưa gói vào lịch retry."
      };
    }

    return {
      ...baseMetrics,
      severity: "info",
      title: "Đã đánh dấu gửi",
      description:
        "Gói ở trạng thái đang xử lý nhưng chưa thấy delivery attempt tương ứng trên giao diện.",
      nextAction:
        "Tải lại lịch sử gửi; nếu vẫn trống, kiểm tra bước tạo outbox/delivery attempt."
    };
  }

  if (recordTransfer.status === "cancelled") {
    return {
      ...baseMetrics,
      severity: "warning",
      title: "Gói đã hủy",
      description: "Luồng chuyển hồ sơ này không còn được tiếp tục.",
      nextAction:
        "Nếu vẫn cần liên thông, tạo gói chuyển mới với consent và endpoint hợp lệ."
    };
  }

  return {
    ...baseMetrics,
    severity: "info",
    title:
      recordTransfer.status === "ready"
        ? "Sẵn sàng gửi"
        : "Chưa gửi sang hệ thống nhận",
    description:
      "Gói đã có consent và thông tin đơn vị nhận; chưa phát sinh POST Bundle ra endpoint FHIR.",
    nextAction:
      "Kiểm tra consent, endpoint FHIR của đơn vị nhận và bấm gửi khi đủ điều kiện vận hành."
  };
}

function getLatestRecordTransferAttempt(
  attempts: readonly RecordTransferDeliveryAttempt[]
): RecordTransferDeliveryAttempt | undefined {
  return attempts.reduce<RecordTransferDeliveryAttempt | undefined>((latest, attempt) => {
    if (!latest) {
      return attempt;
    }

    if (attempt.attemptNumber !== latest.attemptNumber) {
      return attempt.attemptNumber > latest.attemptNumber ? attempt : latest;
    }

    return Date.parse(attempt.updatedAt) > Date.parse(latest.updatedAt) ? attempt : latest;
  }, undefined);
}

function formatConsentCategory(category: ConsentCategory): string {
  const labels: Record<ConsentCategory, string> = {
    "record-sharing": "Chia sẻ hồ sơ"
  };

  return labels[category];
}

function formatAllergyType(type: AllergyType): string {
  const labels: Record<AllergyType, string> = {
    allergy: "Dị ứng",
    intolerance: "Không dung nạp"
  };

  return labels[type];
}

function formatAllergyCategory(category: AllergyCategory): string {
  const labels: Record<AllergyCategory, string> = {
    biologic: "Sinh phẩm",
    environment: "Môi trường",
    food: "Thực phẩm",
    medication: "Thuốc"
  };

  return labels[category];
}

function formatAllergyCriticality(criticality: AllergyCriticality | undefined): string {
  if (!criticality) {
    return "Chưa đánh giá";
  }

  const labels: Record<AllergyCriticality, string> = {
    high: "Nguy cơ cao",
    low: "Nguy cơ thấp",
    "unable-to-assess": "Chưa thể đánh giá"
  };

  return labels[criticality];
}

function formatAllergyClinicalStatus(status: AllergyClinicalStatus): string {
  const labels: Record<AllergyClinicalStatus, string> = {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    resolved: "Đã giải quyết"
  };

  return labels[status];
}

function formatAllergyVerificationStatus(status: AllergyVerificationStatus): string {
  const labels: Record<AllergyVerificationStatus, string> = {
    confirmed: "Đã xác nhận",
    "entered-in-error": "Nhập lỗi",
    refuted: "Đã loại trừ",
    unconfirmed: "Chưa xác nhận"
  };

  return labels[status];
}

function formatConditionCategory(category: ConditionCategory): string {
  const labels: Record<ConditionCategory, string> = {
    "encounter-diagnosis": "Chẩn đoán theo lượt khám",
    "problem-list-item": "Vấn đề sức khỏe dài hạn"
  };

  return labels[category];
}

function formatConditionClinicalStatus(status: ConditionClinicalStatus): string {
  const labels: Record<ConditionClinicalStatus, string> = {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    recurrence: "Tái phát",
    relapse: "Diễn tiến lại",
    remission: "Thuyên giảm",
    resolved: "Đã giải quyết"
  };

  return labels[status];
}

function formatConditionVerificationStatus(status: ConditionVerificationStatus): string {
  const labels: Record<ConditionVerificationStatus, string> = {
    confirmed: "Đã xác nhận",
    differential: "Chẩn đoán phân biệt",
    "entered-in-error": "Nhập lỗi",
    provisional: "Tạm thời",
    refuted: "Đã loại trừ",
    unconfirmed: "Chưa xác nhận"
  };

  return labels[status];
}

function formatConditionSeverity(severity: ConditionSeverity): string {
  const labels: Record<ConditionSeverity, string> = {
    mild: "Nhẹ",
    moderate: "Trung bình",
    severe: "Nặng"
  };

  return labels[severity];
}

function formatMedicationRequestCategory(category: MedicationRequestCategory): string {
  const labels: Record<MedicationRequestCategory, string> = {
    community: "Cộng đồng",
    discharge: "Ra viện",
    inpatient: "Nội trú",
    outpatient: "Ngoại trú"
  };

  return labels[category];
}

function formatMedicationRequestStatus(status: MedicationRequestStatus): string {
  const labels: Record<MedicationRequestStatus, string> = {
    active: "Đang hiệu lực",
    cancelled: "Đã hủy",
    completed: "Đã hoàn tất",
    draft: "Bản nháp",
    "entered-in-error": "Nhập lỗi",
    "on-hold": "Tạm giữ",
    stopped: "Đã dừng",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatMedicationRequestIntent(intent: MedicationRequestIntent): string {
  const labels: Record<MedicationRequestIntent, string> = {
    "filler-order": "Lệnh thực hiện",
    "instance-order": "Lệnh dùng cụ thể",
    option: "Tùy chọn",
    order: "Chỉ định",
    "original-order": "Chỉ định gốc",
    plan: "Kế hoạch",
    proposal: "Đề xuất",
    "reflex-order": "Chỉ định phản xạ"
  };

  return labels[intent];
}

function formatMedicationRequestPriority(priority: MedicationRequestPriority): string {
  const labels: Record<MedicationRequestPriority, string> = {
    asap: "Càng sớm càng tốt",
    routine: "Thường quy",
    stat: "Ngay lập tức",
    urgent: "Khẩn"
  };

  return labels[priority];
}

function formatDosageInstruction(dosageInstruction: DosageInstruction): string {
  const dose = dosageInstruction.doseQuantity
    ? `${dosageInstruction.doseQuantity.value} ${dosageInstruction.doseQuantity.unit}`
    : undefined;
  const timing =
    dosageInstruction.frequency && dosageInstruction.period && dosageInstruction.periodUnit
      ? `${dosageInstruction.frequency} lần/${dosageInstruction.period}${dosageInstruction.periodUnit}`
      : undefined;

  return [dosageInstruction.text, dose, timing].filter(Boolean).join(" · ");
}

function formatMedicationDispenseCategory(category: MedicationDispenseCategory): string {
  const labels: Record<MedicationDispenseCategory, string> = {
    community: "Cộng đồng",
    discharge: "Ra viện",
    inpatient: "Nội trú",
    outpatient: "Ngoại trú"
  };

  return labels[category];
}

function formatMedicationDispenseStatus(status: MedicationDispenseStatus): string {
  const labels: Record<MedicationDispenseStatus, string> = {
    cancelled: "Đã hủy",
    completed: "Đã cấp phát",
    declined: "Từ chối cấp phát",
    "entered-in-error": "Nhập lỗi",
    "in-progress": "Đang cấp phát",
    "on-hold": "Tạm giữ",
    preparation: "Đang chuẩn bị",
    stopped: "Đã dừng",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatMedicationDispenseQuantity(
  quantity: MedicationQuantity | undefined
): string {
  if (!quantity) {
    return "Chưa có";
  }

  return `${quantity.value} ${quantity.unit}`;
}

function formatMedicationDispenseTime(dispense: MedicationDispense): string {
  if (dispense.whenPrepared && dispense.whenHandedOver) {
    return `${formatDateTime(dispense.whenPrepared)} → ${formatDateTime(dispense.whenHandedOver)}`;
  }

  if (dispense.whenHandedOver) {
    return formatDateTime(dispense.whenHandedOver);
  }

  if (dispense.whenPrepared) {
    return `Chuẩn bị ${formatDateTime(dispense.whenPrepared)}`;
  }

  return "Chưa có";
}

function formatMedicationAdministrationCategory(
  category: MedicationAdministrationCategory
): string {
  const labels: Record<MedicationAdministrationCategory, string> = {
    community: "Cộng đồng",
    inpatient: "Nội trú",
    outpatient: "Ngoại trú",
    "patient-specified": "Bệnh nhân tự khai"
  };

  return labels[category];
}

function formatMedicationAdministrationStatus(
  status: MedicationAdministrationStatus
): string {
  const labels: Record<MedicationAdministrationStatus, string> = {
    completed: "Đã dùng",
    "entered-in-error": "Nhập lỗi",
    "in-progress": "Đang dùng",
    "not-done": "Không dùng",
    "on-hold": "Tạm giữ",
    stopped: "Đã dừng",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatMedicationAdministrationPeriod(
  period: MedicationAdministrationEffectivePeriod
): string {
  if (period.start && period.end) {
    return `${formatDateTime(period.start)} - ${formatDateTime(period.end)}`;
  }

  if (period.start) {
    return formatDateTime(period.start);
  }

  if (period.end) {
    return formatDateTime(period.end);
  }

  return "Chưa có";
}

function formatMedicationAdministrationDose(
  dosage: MedicationAdministrationDosage | undefined
): string {
  if (!dosage) {
    return "Chưa có";
  }

  const dose = dosage.doseQuantity
    ? `${dosage.doseQuantity.value} ${dosage.doseQuantity.unit}`
    : undefined;
  const route = dosage.route?.display;

  return [dosage.text, dose, route].filter(Boolean).join(" · ") || "Chưa có";
}

function formatMedicationAdministrationPerformers(
  performers: readonly MedicationAdministrationPerformer[]
): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      performer.function?.display
        ? `${performer.actorId} (${performer.function.display})`
        : performer.actorId
    )
    .join(", ");
}

function formatServiceRequestCategory(category: ServiceRequestCategory): string {
  const labels: Record<ServiceRequestCategory, string> = {
    consultation: "Hội chẩn/tư vấn",
    imaging: "Chẩn đoán hình ảnh",
    laboratory: "Xét nghiệm",
    procedure: "Thủ thuật",
    therapy: "Điều trị/phục hồi"
  };

  return labels[category];
}

function formatServiceRequestStatus(status: ServiceRequestStatus): string {
  const labels: Record<ServiceRequestStatus, string> = {
    active: "Đang hiệu lực",
    completed: "Đã hoàn tất",
    draft: "Bản nháp",
    "entered-in-error": "Nhập lỗi",
    "on-hold": "Tạm giữ",
    revoked: "Đã hủy",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatServiceRequestIntent(intent: ServiceRequestIntent): string {
  const labels: Record<ServiceRequestIntent, string> = {
    directive: "Chỉ thị",
    "filler-order": "Lệnh thực hiện",
    "instance-order": "Lệnh dùng cụ thể",
    option: "Tùy chọn",
    order: "Chỉ định",
    "original-order": "Chỉ định gốc",
    plan: "Kế hoạch",
    proposal: "Đề xuất",
    "reflex-order": "Chỉ định phản xạ"
  };

  return labels[intent];
}

function formatServiceRequestPriority(priority: ServiceRequestPriority): string {
  const labels: Record<ServiceRequestPriority, string> = {
    asap: "Càng sớm càng tốt",
    routine: "Thường quy",
    stat: "Ngay lập tức",
    urgent: "Khẩn"
  };

  return labels[priority];
}

function formatWorkflowTaskStatus(status: WorkflowTaskStatus): string {
  const labels: Record<WorkflowTaskStatus, string> = {
    accepted: "Đã nhận",
    cancelled: "Đã hủy",
    completed: "Hoàn tất",
    draft: "Bản nháp",
    "entered-in-error": "Nhập lỗi",
    failed: "Thất bại",
    "in-progress": "Đang thực hiện",
    "on-hold": "Tạm giữ",
    ready: "Sẵn sàng",
    received: "Đã tiếp nhận",
    rejected: "Từ chối",
    requested: "Đã yêu cầu"
  };

  return labels[status];
}

function formatWorkflowTaskReferences(references: readonly WorkflowTaskReference[]): string {
  if (references.length === 0) {
    return "Chưa gắn";
  }

  return references
    .map((reference) => `${reference.label ?? reference.resourceType}: ${reference.resourceType}/${reference.id}`)
    .join(" · ");
}

function formatProcedureStatus(status: ProcedureStatus): string {
  const labels: Record<ProcedureStatus, string> = {
    preparation: "Chuẩn bị",
    "in-progress": "Đang thực hiện",
    "not-done": "Không thực hiện",
    "on-hold": "Tạm giữ",
    stopped: "Đã dừng",
    completed: "Hoàn tất",
    "entered-in-error": "Nhập lỗi",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatProcedureCategory(category: ProcedureCategory): string {
  const labels: Record<ProcedureCategory, string> = {
    surgical: "Phẫu thuật",
    diagnostic: "Chẩn đoán",
    therapeutic: "Điều trị",
    counseling: "Tư vấn",
    rehabilitation: "Phục hồi chức năng",
    other: "Khác"
  };

  return labels[category];
}

function formatProcedurePerformers(performers: readonly ProcedurePerformer[]): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      [
        `${performer.actorType}/${performer.actorId}`,
        performer.function?.display,
        performer.onBehalfOfOrganizationId ? `thay mặt ${performer.onBehalfOfOrganizationId}` : undefined
      ]
        .filter(Boolean)
        .join(" · ")
    )
    .join(", ");
}

function formatProcedureReferences(references: readonly ProcedureReportReference[]): string {
  if (references.length === 0) {
    return "Chưa có";
  }

  return references.map((reference) => `${reference.resourceType}/${reference.id}`).join(", ");
}

function formatObservationCategory(category: ObservationCategory): string {
  const labels: Record<ObservationCategory, string> = {
    laboratory: "Xét nghiệm",
    "vital-signs": "Sinh hiệu"
  };

  return labels[category];
}

function formatObservationStatus(status: ObservationStatus): string {
  const labels: Record<ObservationStatus, string> = {
    registered: "Đã đăng ký",
    preliminary: "Sơ bộ",
    final: "Chính thức",
    amended: "Đã hiệu chỉnh",
    cancelled: "Đã hủy",
    "entered-in-error": "Nhập lỗi"
  };

  return labels[status];
}

function formatObservationValue(observation: Observation): string {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
  }

  return observation.valueText ?? "Chưa có giá trị";
}

function formatDiagnosticReportCategory(category: DiagnosticReportCategory): string {
  const labels: Record<DiagnosticReportCategory, string> = {
    imaging: "Chẩn đoán hình ảnh",
    laboratory: "Xét nghiệm",
    other: "Khác",
    pathology: "Giải phẫu bệnh"
  };

  return labels[category];
}

function formatDiagnosticReportStatus(status: DiagnosticReportStatus): string {
  const labels: Record<DiagnosticReportStatus, string> = {
    amended: "Đã hiệu chỉnh",
    appended: "Đã bổ sung",
    cancelled: "Đã hủy",
    corrected: "Đã sửa",
    "entered-in-error": "Nhập lỗi",
    final: "Chính thức",
    partial: "Một phần",
    preliminary: "Sơ bộ",
    registered: "Đã đăng ký",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatImagingStudyStatus(status: ImagingStudyStatus): string {
  const labels: Record<ImagingStudyStatus, string> = {
    available: "Sẵn sàng",
    cancelled: "Đã hủy",
    "entered-in-error": "Nhập lỗi",
    registered: "Đã đăng ký",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function toApiDateTime(value: string): string {
  return new Date(value).toISOString();
}
