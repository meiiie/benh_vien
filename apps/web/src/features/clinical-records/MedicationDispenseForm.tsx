import type { FormEvent } from "react";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationRequest,
  NewMedicationDispenseForm
} from "../../types/medications.js";
import { MedicationDispenseContextFields } from "./MedicationDispenseContextFields.js";
import { MedicationDispenseDosageFields } from "./MedicationDispenseDosageFields.js";
import { MedicationDispenseSupplyFields } from "./MedicationDispenseSupplyFields.js";

type MedicationDispenseFormProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationDispenseForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationRequests: readonly MedicationRequest[];
  readonly onCreateMedicationDispense: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationDispenseForm) => void;
};

export function MedicationDispenseForm({
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  medicationRequests,
  onCreateMedicationDispense,
  onFormChange
}: MedicationDispenseFormProps) {
  return (
    <form
      className="medication-form"
      onSubmit={(event) => void onCreateMedicationDispense(event)}
    >
      <MedicationDispenseContextFields
        encounters={encounters}
        form={form}
        medicationRequests={medicationRequests}
        onFormChange={onFormChange}
      />
      <MedicationDispenseSupplyFields form={form} onFormChange={onFormChange} />
      <MedicationDispenseDosageFields form={form} onFormChange={onFormChange} />
      <button
        className="primary-button"
        type="submit"
        disabled={isWriteDisabled || isSubmitting}
      >
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận cấp phát thuốc"}
      </button>
    </form>
  );
}
