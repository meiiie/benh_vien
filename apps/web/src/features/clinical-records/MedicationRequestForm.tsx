import type { FormEvent } from "react";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type { NewMedicationRequestForm } from "../../types/medications.js";
import { MedicationRequestContextFields } from "./MedicationRequestContextFields.js";
import { MedicationRequestMedicationFields } from "./MedicationRequestMedicationFields.js";
import { MedicationRequestPrescriptionFields } from "./MedicationRequestPrescriptionFields.js";

type MedicationRequestFormProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationRequestForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateMedicationRequest: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestForm({
  conditions,
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateMedicationRequest,
  onFormChange
}: MedicationRequestFormProps) {
  return (
    <form
      className="medication-form"
      onSubmit={(event) => void onCreateMedicationRequest(event)}
    >
      <MedicationRequestContextFields
        conditions={conditions}
        encounters={encounters}
        form={form}
        onFormChange={onFormChange}
      />
      <MedicationRequestMedicationFields form={form} onFormChange={onFormChange} />
      <MedicationRequestPrescriptionFields
        form={form}
        onFormChange={onFormChange}
      />
      <button
        className="primary-button"
        type="submit"
        disabled={isWriteDisabled || isSubmitting}
      >
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận chỉ định thuốc"}
      </button>
    </form>
  );
}
