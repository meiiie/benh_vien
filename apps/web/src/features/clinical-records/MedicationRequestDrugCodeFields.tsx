import type { NewMedicationRequestForm } from "../../types/medications.js";

type MedicationRequestDrugCodeFieldsProps = {
  readonly form: NewMedicationRequestForm;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestDrugCodeFields({
  form,
  onFormChange
}: MedicationRequestDrugCodeFieldsProps) {
  return (
    <>
      <label>
        Hệ mã thuốc
        <input
          value={form.medicationSystem}
          onChange={(event) =>
            onFormChange({ ...form, medicationSystem: event.target.value })
          }
        />
      </label>
      <label>
        Mã thuốc
        <input
          value={form.medicationCode}
          onChange={(event) =>
            onFormChange({ ...form, medicationCode: event.target.value })
          }
        />
      </label>
      <label className="wide-field">
        Tên thuốc
        <input
          value={form.medicationDisplay}
          onChange={(event) =>
            onFormChange({ ...form, medicationDisplay: event.target.value })
          }
        />
      </label>
    </>
  );
}
