import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCode,
  AllergyCriticality,
  AllergyReaction,
  AllergyType,
  AllergyVerificationStatus
} from "@benh-vien-so/domain";

export type AllergyIntoleranceRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  clinical_status: AllergyClinicalStatus;
  verification_status: AllergyVerificationStatus;
  type: AllergyType;
  category: AllergyCategory;
  criticality: AllergyCriticality | null;
  code: AllergyCode | string;
  reaction: AllergyReaction | string | null;
  recorded_at: Date | string;
  recorder_practitioner_id: string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
