import type {
  MedicationTimingUnit,
  NewMedicationDispenseForm
} from "../../types/medications.js";

type MedicationDispenseDosageFieldsProps = {
  readonly form: NewMedicationDispenseForm;
  readonly onFormChange: (form: NewMedicationDispenseForm) => void;
};

export function MedicationDispenseDosageFields({
  form,
  onFormChange
}: MedicationDispenseDosageFieldsProps) {
  return (
    <>
      <label className="wide-field">
        Hướng dẫn sau cấp phát
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
        Đường dùng
        <input
          value={form.route}
          onChange={(event) =>
            onFormChange({
              ...form,
              route: event.target.value
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
        Đơn vị liều
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
      <label>
        Tần suất
        <input
          type="number"
          value={form.frequency}
          onChange={(event) =>
            onFormChange({
              ...form,
              frequency: event.target.value
            })
          }
        />
      </label>
      <label>
        Chu kỳ
        <input
          type="number"
          step="any"
          value={form.period}
          onChange={(event) =>
            onFormChange({
              ...form,
              period: event.target.value
            })
          }
        />
      </label>
      <label>
        Đơn vị chu kỳ
        <select
          value={form.periodUnit}
          onChange={(event) =>
            onFormChange({
              ...form,
              periodUnit: event.target.value as MedicationTimingUnit
            })
          }
        >
          <option value="h">Giờ</option>
          <option value="d">Ngày</option>
          <option value="wk">Tuần</option>
        </select>
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
