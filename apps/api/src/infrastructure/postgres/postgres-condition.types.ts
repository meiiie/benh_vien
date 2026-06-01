import type {
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionCode,
  ConditionSeverity,
  ConditionVerificationStatus
} from "@benh-vien-so/domain";

export type ConditionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  clinical_status: ConditionClinicalStatus;
  verification_status: ConditionVerificationStatus;
  category: ConditionCategory;
  code: ConditionCode | string;
  severity: ConditionSeverity | null;
  onset_at: Date | string | null;
  recorded_at: Date | string;
  recorder_practitioner_id: string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
