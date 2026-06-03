import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";
import type { Encounter } from "../../types/encounters.js";

type AllergyIntoleranceContextFieldsProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewAllergyIntoleranceForm;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
};

export function AllergyIntoleranceContextFields({
  encounters,
  form,
  onFormChange
}: AllergyIntoleranceContextFieldsProps) {
  return (
    <label>
      Gắn với lượt khám
      <select
        value={form.encounterId}
        onChange={(event) => onFormChange({ ...form, encounterId: event.target.value })}
      >
        <option value="">Không gắn</option>
        {encounters.map((encounter) => (
          <option key={encounter.id} value={encounter.id}>
            {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
          </option>
        ))}
      </select>
    </label>
  );
}
