import type { DemoRole } from "../auth/demoLogin.js";

export type AppRoute =
  | "landing"
  | "login"
  | "dashboard"
  | "workspace"
  | "documents"
  | "audit"
  | "interop"
  | "settings";
export type PatientIdentifierType = "national-id" | "insurance-id" | "hospital-mrn" | "legacy-id";
export type PatientGender = "male" | "female" | "other" | "unknown";
export type EncounterClass = "ambulatory" | "inpatient" | "emergency" | "virtual";
export type EncounterStatus = "planned" | "in-progress" | "finished" | "cancelled" | "entered-in-error";
export type ClinicalDocumentType =
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
export type ClinicalDocumentStatus = "draft" | "signed" | "superseded" | "entered-in-error";
export type ConditionClinicalStatus =
  | "active"
  | "recurrence"
  | "relapse"
  | "inactive"
  | "remission"
  | "resolved";
export type ConditionVerificationStatus =
  | "unconfirmed"
  | "provisional"
  | "differential"
  | "confirmed"
  | "refuted"
  | "entered-in-error";
export type ConditionCategory = "problem-list-item" | "encounter-diagnosis";
export type ConditionSeverity = "mild" | "moderate" | "severe";
export type AllergyClinicalStatus = "active" | "inactive" | "resolved";
export type AllergyVerificationStatus = "unconfirmed" | "confirmed" | "refuted" | "entered-in-error";
export type AllergyType = "allergy" | "intolerance";
export type AllergyCategory = "food" | "medication" | "environment" | "biologic";
export type AllergyCriticality = "low" | "high" | "unable-to-assess";
export type AllergyReactionSeverity = "mild" | "moderate" | "severe";
export type ObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "cancelled"
  | "entered-in-error";
export type ObservationCategory = "vital-signs" | "laboratory";
export type MedicationRequestStatus =
  | "active"
  | "on-hold"
  | "cancelled"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "draft"
  | "unknown";
export type MedicationRequestIntent =
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
export type MedicationRequestCategory = "inpatient" | "outpatient" | "community" | "discharge";
export type MedicationRequestPriority = "routine" | "urgent" | "asap" | "stat";
export type MedicationTimingUnit = "h" | "d" | "wk";
export type MedicationDispenseStatus =
  | "preparation"
  | "in-progress"
  | "cancelled"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "declined"
  | "unknown";
export type MedicationDispenseCategory = "inpatient" | "outpatient" | "community" | "discharge";
export type MedicationAdministrationStatus =
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "unknown";
export type MedicationAdministrationCategory =
  | "inpatient"
  | "outpatient"
  | "community"
  | "patient-specified";
export type MedicationAdministrationPerformerActorType =
  | "Practitioner"
  | "PractitionerRole"
  | "Patient"
  | "RelatedPerson"
  | "Device";
export type ServiceRequestStatus =
  | "draft"
  | "active"
  | "on-hold"
  | "revoked"
  | "completed"
  | "entered-in-error"
  | "unknown";
export type ServiceRequestIntent =
  | "proposal"
  | "plan"
  | "directive"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
export type ServiceRequestCategory = "laboratory" | "imaging" | "procedure" | "consultation" | "therapy";
export type ServiceRequestPriority = "routine" | "urgent" | "asap" | "stat";
export type WorkflowTaskStatus =
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
export type WorkflowTaskIntent =
  | "unknown"
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
export type WorkflowTaskPriority = "routine" | "urgent" | "asap" | "stat";
export type WorkflowTaskReferenceResourceType =
  | "ServiceRequest"
  | "Observation"
  | "DiagnosticReport"
  | "ImagingStudy"
  | "DocumentReference";
export type ProcedureStatus =
  | "preparation"
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "stopped"
  | "completed"
  | "entered-in-error"
  | "unknown";
export type ProcedureCategory =
  | "surgical"
  | "diagnostic"
  | "therapeutic"
  | "counseling"
  | "rehabilitation"
  | "other";
export type ProcedurePerformerActorType = "Practitioner" | "PractitionerRole" | "Organization";
export type ProcedureReportReferenceResourceType = "DiagnosticReport" | "DocumentReference" | "Composition";
export type DiagnosticReportStatus =
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
export type DiagnosticReportCategory = "laboratory" | "imaging" | "pathology" | "other";
export type ImagingStudyStatus =
  | "registered"
  | "available"
  | "cancelled"
  | "entered-in-error"
  | "unknown";
export type PurposeOfUse = "TREATMENT" | "AUDIT" | "OPERATIONS";
export type ConsentStatus = "active" | "revoked" | "expired";
export type ConsentCategory = "record-sharing";
export type RecordTransferStatus =
  | "draft"
  | "requested"
  | "ready"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "failed"
  | "dead-lettered";
export type RecordTransferPriority = "routine" | "urgent" | "asap" | "stat";
export type RecordTransferBundleType = "collection" | "document";
export type RecordTransferDeliveryAttemptStatus = "queued" | "succeeded" | "failed";
export type ProviderOrganizationType =
  | "hospital"
  | "department"
  | "laboratory"
  | "imaging"
  | "payer"
  | "government"
  | "other";
export type ProviderEndpointConnectionType =
  | "hl7-fhir-rest"
  | "dicom-wado-rs"
  | "hl7v2-mllp"
  | "direct-project"
  | "ihe-xds"
  | "other";

export type ProviderIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type?: string;
};

export type ProviderTelecom = {
  readonly system: "phone" | "email" | "url";
  readonly value: string;
  readonly use?: "work" | "mobile" | "home";
};

export type ProviderCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ProviderOrganization = {
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

export type ProviderPractitioner = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly fullName: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly qualification?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderEndpoint = {
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

export type ProviderPractitionerRole = {
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

export type ProviderDirectory = {
  readonly organizations: readonly ProviderOrganization[];
  readonly practitioners: readonly ProviderPractitioner[];
  readonly practitionerRoles: readonly ProviderPractitionerRole[];
  readonly endpoints: readonly ProviderEndpoint[];
  readonly generatedAt: string;
};

export type PatientIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type: PatientIdentifierType;
};

export type Patient = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender: PatientGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
  readonly status: "active" | "merged" | "inactive";
  readonly mergedIntoPatientId?: string;
  readonly mergedAt?: string;
  readonly mergedByActorId?: string;
  readonly mergeReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PatientStatusFilter = "all" | Patient["status"];

export type Encounter = {
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

export type ClinicalDocument = {
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

export type ObservationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ConditionCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type AllergyCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type AllergyReaction = {
  readonly manifestation: AllergyCode;
  readonly severity?: AllergyReactionSeverity;
  readonly description?: string;
};

export type AllergyIntolerance = {
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

export type Condition = {
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

export type ObservationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

export type Observation = {
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

export type MedicationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type MedicationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

export type DosageInstruction = {
  readonly text: string;
  readonly route?: string;
  readonly doseQuantity?: MedicationQuantity;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: MedicationTimingUnit;
};

export type MedicationRequest = {
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

export type MedicationDispense = {
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

export type MedicationAdministrationPerformer = {
  readonly actorType: MedicationAdministrationPerformerActorType;
  readonly actorId: string;
  readonly function?: MedicationCode;
};

export type MedicationAdministrationEffectivePeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type MedicationAdministrationDosage = {
  readonly text?: string;
  readonly route?: MedicationCode;
  readonly doseQuantity?: MedicationQuantity;
};

export type MedicationAdministration = {
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

export type ServiceRequestCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ServiceRequest = {
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

export type WorkflowTaskCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type WorkflowTaskBusinessStatus = {
  readonly code: string;
  readonly display: string;
};

export type WorkflowTaskReference = {
  readonly resourceType: WorkflowTaskReferenceResourceType;
  readonly id: string;
  readonly label?: string;
};

export type WorkflowTaskExecutionPeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type WorkflowTask = {
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

export type ProcedureCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ProcedurePerformedPeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type ProcedurePerformer = {
  readonly actorType: ProcedurePerformerActorType;
  readonly actorId: string;
  readonly function?: ProcedureCoding;
  readonly onBehalfOfOrganizationId?: string;
};

export type ProcedureReportReference = {
  readonly resourceType: ProcedureReportReferenceResourceType;
  readonly id: string;
};

export type Procedure = {
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

export type DiagnosticReportCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type DiagnosticReport = {
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

export type ImagingStudyCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ImagingStudySeries = {
  readonly uid: string;
  readonly number?: number;
  readonly modality: ImagingStudyCoding;
  readonly description?: string;
  readonly numberOfInstances: number;
  readonly bodySite?: ImagingStudyCoding;
  readonly startedAt?: string;
};

export type ImagingStudy = {
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

export type Consent = {
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

export type RecordTransfer = {
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

export type RecordTransferDeliveryAttempt = {
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

export type RecordTransferOperationalSeverity = "info" | "success" | "warning" | "danger";

export type RecordTransferOperationalSummary = {
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

export type ApiRuntimeInfo = {
  readonly service: string;
  readonly product: string;
  readonly version: string;
  readonly repository?: string;
  readonly nodeEnv?: string;
  readonly publicApiBaseUrl: string;
  readonly httpBodyLimitBytes?: number;
  readonly checkedAt: string;
  readonly operationalDiagnostics: {
    readonly available: boolean;
    readonly reason?: string;
  };
  readonly features: {
    readonly apiDocsEnabled: boolean | null;
    readonly recordTransferDeliveryAttempts: boolean;
    readonly recordTransferDeliveryWorkerEnabled: boolean | null;
    readonly recordTransferRetryWorkerEnabled: boolean | null;
  };
};

export type PatientsResponse = {
  readonly items: readonly Patient[];
};

export type EncountersResponse = {
  readonly items: readonly Encounter[];
};

export type ClinicalDocumentsResponse = {
  readonly items: readonly ClinicalDocument[];
};

export type ConditionsResponse = {
  readonly items: readonly Condition[];
};

export type AllergyIntolerancesResponse = {
  readonly items: readonly AllergyIntolerance[];
};

export type ObservationsResponse = {
  readonly items: readonly Observation[];
};

export type MedicationRequestsResponse = {
  readonly items: readonly MedicationRequest[];
};

export type MedicationDispensesResponse = {
  readonly items: readonly MedicationDispense[];
};

export type MedicationAdministrationsResponse = {
  readonly items: readonly MedicationAdministration[];
};

export type ServiceRequestsResponse = {
  readonly items: readonly ServiceRequest[];
};

export type WorkflowTasksResponse = {
  readonly items: readonly WorkflowTask[];
};

export type ProceduresResponse = {
  readonly items: readonly Procedure[];
};

export type DiagnosticReportsResponse = {
  readonly items: readonly DiagnosticReport[];
};

export type ImagingStudiesResponse = {
  readonly items: readonly ImagingStudy[];
};

export type AuditEventsResponse = {
  readonly items: readonly AuditEvent[];
};

export type AuditIntegrityReportResponse = AuditIntegrityReport;

export type ConsentsResponse = {
  readonly items: readonly Consent[];
};

export type RecordTransfersResponse = {
  readonly items: readonly RecordTransfer[];
};

export type RecordTransferDeliveryAttemptsResponse = {
  readonly items: readonly RecordTransferDeliveryAttempt[];
};

export type NewPatientForm = {
  fullName: string;
  birthDate: string;
  gender: PatientGender;
  nationalId: string;
  hospitalMrn: string;
  phone: string;
  address: string;
  managingOrganizationId: string;
};

export type PatientMergeForm = {
  targetPatientId: string;
  reason: string;
  confirmationText: string;
};

export type NewRecordTransferForm = {
  priority: RecordTransferPriority;
  bundleType: RecordTransferBundleType;
  sourceOrganizationId: string;
  recipientOrganizationId: string;
  consentReference: string;
  reason: string;
  note: string;
};

export type GatewayAcknowledgementForm = {
  recordTransferId: string;
  recipientOrganizationId: string;
  acknowledgementReference: string;
  receivedAt: string;
  receivedByActorId: string;
  targetEndpointId: string;
  deliveryIdempotencyKey: string;
  note: string;
};

export type NewEncounterForm = {
  class: EncounterClass;
  serviceType: string;
  reasonText: string;
  departmentId: string;
  attendingPractitionerId: string;
  startedAt: string;
};

export type NewClinicalDocumentForm = {
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

export type NewConditionForm = {
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

export type NewAllergyIntoleranceForm = {
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

export type NewObservationForm = {
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

export type NewMedicationRequestForm = {
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

export type NewMedicationDispenseForm = {
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

export type NewMedicationAdministrationForm = {
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

export type NewServiceRequestForm = {
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

export type NewProcedureForm = {
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

export type NewDiagnosticReportForm = {
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

export type NewImagingStudyForm = {
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

export type AuthSession = {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly actor: {
    readonly actorId: string;
    readonly displayName: string;
    readonly role: DemoRole;
  };
};
