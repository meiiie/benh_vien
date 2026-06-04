import type {
  MedicationAdministrationCategory,
  MedicationAdministrationDosage,
  MedicationAdministrationEffectivePeriod,
  MedicationAdministrationPerformer,
  MedicationAdministrationStatus,
  MedicationCode
} from "@benh-vien-so/domain";

export type MedicationAdministrationRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  medication_request_id: string | null;
  reason_condition_id: string | null;
  status: MedicationAdministrationStatus;
  status_reason: MedicationCode | string | null;
  category: MedicationAdministrationCategory;
  medication_code: MedicationCode | string;
  effective_period: MedicationAdministrationEffectivePeriod | string;
  performers: MedicationAdministrationPerformer[] | string;
  dosage: MedicationAdministrationDosage | string | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
