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

export type ServiceRequestsResponse = {
  readonly items: readonly ServiceRequest[];
};

export type WorkflowTasksResponse = {
  readonly items: readonly WorkflowTask[];
};

export type ProceduresResponse = {
  readonly items: readonly Procedure[];
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
