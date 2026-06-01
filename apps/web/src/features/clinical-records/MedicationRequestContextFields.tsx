import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationRequestCategory,
  MedicationRequestPriority,
  NewMedicationRequestForm
} from "../../types/medications.js";

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
      <label>
        Loại chỉ định
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({
              ...form,
              category: event.target.value as MedicationRequestCategory
            })
          }
        >
          <option value="outpatient">Ngoại trú</option>
          <option value="inpatient">Nội trú</option>
          <option value="community">Cộng đồng</option>
          <option value="discharge">Ra viện</option>
        </select>
      </label>
      <label>
        Ưu tiên
        <select
          value={form.priority}
          onChange={(event) =>
            onFormChange({
              ...form,
              priority: event.target.value as MedicationRequestPriority
            })
          }
        >
          <option value="routine">Thường quy</option>
          <option value="urgent">Khẩn</option>
          <option value="asap">Càng sớm càng tốt</option>
          <option value="stat">Ngay lập tức</option>
        </select>
      </label>
    </>
  );
}
