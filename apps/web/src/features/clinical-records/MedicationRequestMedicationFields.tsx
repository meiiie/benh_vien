import type { NewMedicationRequestForm } from "../../types/medications.js";
import { MedicationRequestDosageTimingFields } from "./MedicationRequestDosageTimingFields.js";
import { MedicationRequestDrugCodeFields } from "./MedicationRequestDrugCodeFields.js";

type MedicationRequestMedicationFieldsProps = {
  readonly form: NewMedicationRequestForm;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestMedicationFields({
  form,
  onFormChange
}: MedicationRequestMedicationFieldsProps) {
  return (
    <>
      <MedicationRequestDrugCodeFields form={form} onFormChange={onFormChange} />
      <MedicationRequestDosageTimingFields
        form={form}
        onFormChange={onFormChange}
      />
    </>
  );
}
