import type {
  MedicationRequestCategory,
  MedicationRequestPriority,
  NewMedicationRequestForm
} from "../../types/medications.js";

type MedicationRequestClassificationFieldsProps = {
  readonly form: NewMedicationRequestForm;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestClassificationFields({
  form,
  onFormChange
}: MedicationRequestClassificationFieldsProps) {
  return (
    <>
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
