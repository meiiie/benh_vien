import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";

type AllergyIntoleranceCodeFieldsProps = {
  readonly form: NewAllergyIntoleranceForm;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
};

export function AllergyIntoleranceCodeFields({
  form,
  onFormChange
}: AllergyIntoleranceCodeFieldsProps) {
  return (
    <>
      <label>
        Hệ mã tác nhân
        <input
          value={form.codeSystem}
          onChange={(event) => onFormChange({ ...form, codeSystem: event.target.value })}
        />
      </label>
      <label>
        Mã tác nhân
        <input
          value={form.code}
          onChange={(event) => onFormChange({ ...form, code: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên tác nhân
        <input
          value={form.codeDisplay}
          onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
        />
      </label>
    </>
  );
}
