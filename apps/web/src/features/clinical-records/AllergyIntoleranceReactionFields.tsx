import type {
  AllergyReactionSeverity,
  NewAllergyIntoleranceForm
} from "../../types/allergies.js";

type AllergyIntoleranceReactionFieldsProps = {
  readonly form: NewAllergyIntoleranceForm;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
};

export function AllergyIntoleranceReactionFields({
  form,
  onFormChange
}: AllergyIntoleranceReactionFieldsProps) {
  return (
    <>
      <label>
        Mã biểu hiện
        <input
          value={form.manifestationCode}
          onChange={(event) => onFormChange({ ...form, manifestationCode: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Biểu hiện phản ứng
        <input
          value={form.manifestationDisplay}
          onChange={(event) =>
            onFormChange({ ...form, manifestationDisplay: event.target.value })
          }
        />
      </label>
      <label>
        Mức độ phản ứng
        <select
          value={form.reactionSeverity}
          onChange={(event) =>
            onFormChange({
              ...form,
              reactionSeverity: event.target.value as "" | AllergyReactionSeverity
            })
          }
        >
          <option value="">Chưa ghi</option>
          <option value="mild">Nhẹ</option>
          <option value="moderate">Trung bình</option>
          <option value="severe">Nặng</option>
        </select>
      </label>
    </>
  );
}
