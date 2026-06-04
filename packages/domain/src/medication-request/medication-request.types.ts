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

export const medicationRequestStatuses = new Set<MedicationRequestStatus>([
  "active",
  "on-hold",
  "cancelled",
  "completed",
  "entered-in-error",
  "stopped",
  "draft",
  "unknown"
]);

export const medicationRequestIntents = new Set<MedicationRequestIntent>([
  "proposal",
  "plan",
  "order",
  "original-order",
  "reflex-order",
  "filler-order",
  "instance-order",
  "option"
]);

export const medicationRequestCategories = new Set<MedicationRequestCategory>([
  "inpatient",
  "outpatient",
  "community",
  "discharge"
]);

export const medicationRequestPriorities = new Set<MedicationRequestPriority>([
  "routine",
  "urgent",
  "asap",
  "stat"
]);

export const medicationTimingUnits = new Set<MedicationTimingUnit>(["h", "d", "wk"]);

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

export type MedicationRequestSnapshot = {
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

export type CreateMedicationRequestInput = Omit<
  MedicationRequestSnapshot,
  "status" | "intent" | "priority" | "authoredOn" | "createdAt" | "updatedAt"
> & {
  readonly status?: MedicationRequestStatus;
  readonly intent?: MedicationRequestIntent;
  readonly priority?: MedicationRequestPriority;
  readonly authoredOn?: string;
};
