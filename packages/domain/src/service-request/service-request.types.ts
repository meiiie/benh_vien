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

export type ServiceRequestCategory =
  | "laboratory"
  | "imaging"
  | "procedure"
  | "consultation"
  | "therapy";

export type ServiceRequestPriority = "routine" | "urgent" | "asap" | "stat";

export const serviceRequestStatuses = new Set<ServiceRequestStatus>([
  "draft",
  "active",
  "on-hold",
  "revoked",
  "completed",
  "entered-in-error",
  "unknown"
]);

export const serviceRequestIntents = new Set<ServiceRequestIntent>([
  "proposal",
  "plan",
  "directive",
  "order",
  "original-order",
  "reflex-order",
  "filler-order",
  "instance-order",
  "option"
]);

export const serviceRequestCategories = new Set<ServiceRequestCategory>([
  "laboratory",
  "imaging",
  "procedure",
  "consultation",
  "therapy"
]);

export const serviceRequestPriorities = new Set<ServiceRequestPriority>([
  "routine",
  "urgent",
  "asap",
  "stat"
]);

export type ServiceRequestCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ServiceRequestSnapshot = {
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

export type CreateServiceRequestInput = Omit<
  ServiceRequestSnapshot,
  "status" | "intent" | "priority" | "authoredOn" | "createdAt" | "updatedAt"
> & {
  readonly status?: ServiceRequestStatus;
  readonly intent?: ServiceRequestIntent;
  readonly priority?: ServiceRequestPriority;
  readonly authoredOn?: string;
};
