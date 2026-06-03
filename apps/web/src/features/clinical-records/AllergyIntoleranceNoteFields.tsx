import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";

type AllergyIntoleranceNoteFieldsProps = {
  readonly form: NewAllergyIntoleranceForm;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
};

export function AllergyIntoleranceNoteFields({
  form,
  onFormChange
}: AllergyIntoleranceNoteFieldsProps) {
  return (
    <>
      <label className="wide-field">
        Mô tả phản ứng
        <input
          value={form.reactionDescription}
          onChange={(event) =>
            onFormChange({ ...form, reactionDescription: event.target.value })
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
