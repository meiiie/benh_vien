import type {
  ObservationCategory,
  ObservationCode,
  ObservationQuantity,
  ObservationStatus
} from "@benh-vien-so/domain";

export type ObservationRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  status: ObservationStatus;
  category: ObservationCategory;
  code: ObservationCode | string;
  effective_at: Date | string;
  value_quantity: ObservationQuantity | string | null;
  value_text: string | null;
  performer_practitioner_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};
