import type { NewMedicationAdministrationForm } from "../../types/medications.js";

type MedicationAdministrationDosageFieldsProps = {
  readonly form: NewMedicationAdministrationForm;
  readonly onFormChange: (form: NewMedicationAdministrationForm) => void;
};

export function MedicationAdministrationDosageFields({
  form,
  onFormChange
}: MedicationAdministrationDosageFieldsProps) {
  return (
    <>
      <label className="wide-field">
        Tên thuốc
        <input
          value={form.medicationDisplay}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationDisplay: event.target.value
            })
          }
        />
      </label>
      <label>
        Hệ mã thuốc
        <input
          value={form.medicationSystem}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationSystem: event.target.value
            })
          }
        />
      </label>
      <label>
        Mã thuốc
        <input
          value={form.medicationCode}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationCode: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Mô tả liều thực tế
        <input
          value={form.dosageText}
          onChange={(event) =>
            onFormChange({
              ...form,
              dosageText: event.target.value
            })
          }
        />
      </label>
      <label>
        Liều
        <input
          type="number"
          step="any"
          value={form.doseValue}
          onChange={(event) =>
            onFormChange({
              ...form,
              doseValue: event.target.value
            })
          }
        />
      </label>
      <label>
        Đơn vị
        <input
          value={form.doseUnit}
          onChange={(event) =>
            onFormChange({
              ...form,
              doseUnit: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Ghi chú
        <input
          value={form.note}
          onChange={(event) =>
            onFormChange({
              ...form,
              note: event.target.value
            })
          }
        />
      </label>
    </>
  );
}
