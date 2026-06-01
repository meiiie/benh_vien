import type { FormEvent } from "react";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationRequest,
  NewMedicationAdministrationForm
} from "../../types/medications.js";
import { MedicationAdministrationContextFields } from "./MedicationAdministrationContextFields.js";
import { MedicationAdministrationDosageFields } from "./MedicationAdministrationDosageFields.js";
import { MedicationAdministrationPerformerFields } from "./MedicationAdministrationPerformerFields.js";

type MedicationAdministrationFormProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationAdministrationForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationRequests: readonly MedicationRequest[];
  readonly onCreateMedicationAdministration: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationAdministrationForm) => void;
};

export function MedicationAdministrationForm({
  conditions,
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  medicationRequests,
  onCreateMedicationAdministration,
  onFormChange
}: MedicationAdministrationFormProps) {
  return (
    <form
      className="medication-form"
      onSubmit={(event) => void onCreateMedicationAdministration(event)}
    >
      <MedicationAdministrationContextFields
        conditions={conditions}
        encounters={encounters}
        form={form}
        medicationRequests={medicationRequests}
        onFormChange={onFormChange}
      />
      <MedicationAdministrationPerformerFields
        form={form}
        onFormChange={onFormChange}
      />
      <MedicationAdministrationDosageFields
        form={form}
        onFormChange={onFormChange}
      />
      <button
        className="primary-button"
        type="submit"
        disabled={isWriteDisabled || isSubmitting}
      >
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận dùng thuốc"}
      </button>
    </form>
  );
}
