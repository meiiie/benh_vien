import type { DemoRole } from "../auth/demoLogin.js";

export * from "./allergies.js";
export * from "./audit.js";
export * from "./clinicalDocuments.js";
export * from "./consents.js";
export * from "./conditions.js";
export * from "./encounters.js";
export * from "./providerDirectory.js";
export * from "./patientRegistry.js";
export * from "./recordTransfers.js";

export type AppRoute =
  | "landing"
  | "login"
  | "dashboard"
  | "workspace"
  | "documents"
  | "audit"
  | "interop"
  | "settings";
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

export type ObservationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
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
