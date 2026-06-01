import type { NewMedicationRequestForm } from "../../types/medications.js";

type MedicationRequestPrescriptionFieldsProps = {
  readonly form: NewMedicationRequestForm;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestPrescriptionFields({
  form,
  onFormChange
}: MedicationRequestPrescriptionFieldsProps) {
  return (
    <>
      <label>
        Thời điểm kê
        <input
          type="datetime-local"
          value={form.authoredOn}
          onChange={(event) =>
            onFormChange({ ...form, authoredOn: event.target.value })
          }
        />
      </label>
      <label>
        Số ngày cấp
        <input
          type="number"
          value={form.expectedSupplyDurationDays}
          onChange={(event) =>
            onFormChange({
              ...form,
              expectedSupplyDurationDays: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Người kê
        <input
          value={form.requesterPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              requesterPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Ghi chú
        <input
          value={form.note}
          onChange={(event) => onFormChange({ ...form, note: event.target.value })}
        />
      </label>
    </>
  );
}
