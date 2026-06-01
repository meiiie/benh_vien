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

export type ProcedureReportReferenceResourceType =
  | "DiagnosticReport"
  | "DocumentReference"
  | "Composition";

export const procedureStatuses = new Set<ProcedureStatus>([
  "preparation",
  "in-progress",
  "not-done",
  "on-hold",
  "stopped",
  "completed",
  "entered-in-error",
  "unknown"
]);

export const procedureCategories = new Set<ProcedureCategory>([
  "surgical",
  "diagnostic",
  "therapeutic",
  "counseling",
  "rehabilitation",
  "other"
]);

export const procedurePerformerActorTypes = new Set<ProcedurePerformerActorType>([
  "Practitioner",
  "PractitionerRole",
  "Organization"
]);

export const procedureReportReferenceResourceTypes =
  new Set<ProcedureReportReferenceResourceType>([
    "DiagnosticReport",
    "DocumentReference",
    "Composition"
  ]);

export type ProcedureCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ProcedurePerformer = {
  readonly actorType: ProcedurePerformerActorType;
  readonly actorId: string;
  readonly function?: ProcedureCoding;
  readonly onBehalfOfOrganizationId?: string;
};

export type ProcedurePerformedPeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type ProcedureReportReference = {
  readonly resourceType: ProcedureReportReferenceResourceType;
  readonly id: string;
};

export type ProcedureSnapshot = {
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

export type CreateProcedureInput = Omit<ProcedureSnapshot, "createdAt" | "updatedAt">;
