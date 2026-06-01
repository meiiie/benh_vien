import type {
  DosageInstruction,
  MedicationCode,
  MedicationDispenseCategory,
  MedicationDispenseStatus,
  MedicationQuantity
} from "@benh-vien-so/domain";

export type MedicationDispenseRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  medication_request_id: string | null;
  status: MedicationDispenseStatus;
  status_reason: MedicationCode | string | null;
  category: MedicationDispenseCategory;
  medication_code: MedicationCode | string;
  quantity: MedicationQuantity | string | null;
  days_supply: MedicationQuantity | string | null;
  when_prepared: Date | string | null;
  when_handed_over: Date | string | null;
  dispenser_practitioner_id: string | null;
  destination_location_id: string | null;
  receiver_practitioner_id: string | null;
  dosage_instruction: DosageInstruction | string | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
