import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";

type AllergyIntoleranceRecordFieldsProps = {
  readonly form: NewAllergyIntoleranceForm;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
};

export function AllergyIntoleranceRecordFields({
  form,
  onFormChange
}: AllergyIntoleranceRecordFieldsProps) {
  return (
    <>
      <label>
        Thời điểm ghi nhận
        <input
          type="datetime-local"
          value={form.recordedAt}
          onChange={(event) => onFormChange({ ...form, recordedAt: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Người ghi nhận
        <input
          value={form.recorderPractitionerId}
          onChange={(event) =>
            onFormChange({ ...form, recorderPractitionerId: event.target.value })
          }
        />
      </label>
    </>
  );
}
