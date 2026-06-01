export type AllergyClinicalStatus = "active" | "inactive" | "resolved";
export type AllergyVerificationStatus = "unconfirmed" | "confirmed" | "refuted" | "entered-in-error";
export type AllergyType = "allergy" | "intolerance";
export type AllergyCategory = "food" | "medication" | "environment" | "biologic";
export type AllergyCriticality = "low" | "high" | "unable-to-assess";
export type AllergyReactionSeverity = "mild" | "moderate" | "severe";

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

export type AllergyIntolerancesResponse = {
  readonly items: readonly AllergyIntolerance[];
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
