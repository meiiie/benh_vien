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

export type ConditionCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
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

export type ConditionsResponse = {
  readonly items: readonly Condition[];
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
