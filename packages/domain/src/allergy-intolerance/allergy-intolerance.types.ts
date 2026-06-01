export type AllergyClinicalStatus = "active" | "inactive" | "resolved";
export type AllergyVerificationStatus =
  | "unconfirmed"
  | "confirmed"
  | "refuted"
  | "entered-in-error";
export type AllergyType = "allergy" | "intolerance";
export type AllergyCategory = "food" | "medication" | "environment" | "biologic";
export type AllergyCriticality = "low" | "high" | "unable-to-assess";
export type AllergyReactionSeverity = "mild" | "moderate" | "severe";

export const allergyClinicalStatuses = new Set<AllergyClinicalStatus>([
  "active",
  "inactive",
  "resolved"
]);
export const allergyVerificationStatuses = new Set<AllergyVerificationStatus>([
  "unconfirmed",
  "confirmed",
  "refuted",
  "entered-in-error"
]);
export const allergyTypes = new Set<AllergyType>(["allergy", "intolerance"]);
export const allergyCategories = new Set<AllergyCategory>([
  "food",
  "medication",
  "environment",
  "biologic"
]);
export const allergyCriticalities = new Set<AllergyCriticality>([
  "low",
  "high",
  "unable-to-assess"
]);
export const allergyReactionSeverities = new Set<AllergyReactionSeverity>([
  "mild",
  "moderate",
  "severe"
]);

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

export type AllergyIntoleranceSnapshot = {
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

export type CreateAllergyIntoleranceInput = Omit<
  AllergyIntoleranceSnapshot,
  "clinicalStatus" | "verificationStatus" | "recordedAt" | "createdAt" | "updatedAt"
> & {
  readonly clinicalStatus?: AllergyClinicalStatus;
  readonly verificationStatus?: AllergyVerificationStatus;
  readonly recordedAt?: string;
};
