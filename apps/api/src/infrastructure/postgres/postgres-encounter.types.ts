import type { EncounterClass, EncounterStatus } from "@benh-vien-so/domain";

export type EncounterRow = {
  id: string;
  patient_id: string;
  status: EncounterStatus;
  encounter_class: EncounterClass;
  service_type: string;
  reason_text: string;
  department_id: string | null;
  attending_practitioner_id: string;
  started_at: Date | string;
  ended_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
