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

export const conditionClinicalStatuses = new Set<ConditionClinicalStatus>([
  "active",
  "recurrence",
  "relapse",
  "inactive",
  "remission",
  "resolved"
]);

export const conditionVerificationStatuses = new Set<ConditionVerificationStatus>([
  "unconfirmed",
  "provisional",
  "differential",
  "confirmed",
  "refuted",
  "entered-in-error"
]);

export const conditionCategories = new Set<ConditionCategory>([
  "problem-list-item",
  "encounter-diagnosis"
]);

export const conditionSeverities = new Set<ConditionSeverity>([
  "mild",
  "moderate",
  "severe"
]);

export type ConditionCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ConditionSnapshot = {
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

export type CreateConditionInput = Omit<
  ConditionSnapshot,
  "clinicalStatus" | "verificationStatus" | "recordedAt" | "createdAt" | "updatedAt"
> & {
  readonly clinicalStatus?: ConditionClinicalStatus;
  readonly verificationStatus?: ConditionVerificationStatus;
  readonly recordedAt?: string;
};
