import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type { NewMedicationRequestForm } from "../../types/medications.js";
import { MedicationRequestClassificationFields } from "./MedicationRequestClassificationFields.js";
import { MedicationRequestReferenceFields } from "./MedicationRequestReferenceFields.js";

type MedicationRequestContextFieldsProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationRequestForm;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestContextFields({
  conditions,
  encounters,
  form,
  onFormChange
}: MedicationRequestContextFieldsProps) {
  return (
    <>
      <MedicationRequestReferenceFields
        conditions={conditions}
        encounters={encounters}
        form={form}
        onFormChange={onFormChange}
      />
      <MedicationRequestClassificationFields
        form={form}
        onFormChange={onFormChange}
      />
    </>
  );
}
