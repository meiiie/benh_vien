import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type { NewMedicationRequestForm } from "../../types/medications.js";

type MedicationRequestReferenceFieldsProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationRequestForm;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestReferenceFields({
  conditions,
  encounters,
  form,
  onFormChange
}: MedicationRequestReferenceFieldsProps) {
  return (
    <>
      <label>
        Gắn với lượt khám
        <select
          value={form.encounterId}
          onChange={(event) =>
            onFormChange({ ...form, encounterId: event.target.value })
          }
        >
          <option value="">Không gắn</option>
          {encounters.map((encounter) => (
            <option key={encounter.id} value={encounter.id}>
              {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Chẩn đoán liên quan
        <select
          value={form.reasonConditionId}
          onChange={(event) =>
            onFormChange({ ...form, reasonConditionId: event.target.value })
          }
        >
          <option value="">Không gắn</option>
          {conditions.map((condition) => (
            <option key={condition.id} value={condition.id}>
              {condition.code.display} · {condition.code.code}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
