import type {
  DosageInstruction,
  MedicationCode,
  MedicationRequestCategory,
  MedicationRequestIntent,
  MedicationRequestPriority,
  MedicationRequestStatus
} from "@benh-vien-so/domain";

export type MedicationRequestRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  reason_condition_id: string | null;
  status: MedicationRequestStatus;
  intent: MedicationRequestIntent;
  category: MedicationRequestCategory;
  priority: MedicationRequestPriority;
  medication_code: MedicationCode | string;
  dosage_instruction: DosageInstruction | string;
  authored_on: Date | string;
  requester_practitioner_id: string;
  expected_supply_duration_days: number | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
