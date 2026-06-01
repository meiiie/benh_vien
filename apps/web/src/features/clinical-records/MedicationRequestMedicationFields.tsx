import type {
  MedicationTimingUnit,
  NewMedicationRequestForm
} from "../../types/medications.js";

type MedicationRequestMedicationFieldsProps = {
  readonly form: NewMedicationRequestForm;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
};

export function MedicationRequestMedicationFields({
  form,
  onFormChange
}: MedicationRequestMedicationFieldsProps) {
  return (
    <>
      <label>
        Hệ mã thuốc
        <input
          value={form.medicationSystem}
          onChange={(event) =>
            onFormChange({ ...form, medicationSystem: event.target.value })
          }
        />
      </label>
      <label>
        Mã thuốc
        <input
          value={form.medicationCode}
          onChange={(event) =>
            onFormChange({ ...form, medicationCode: event.target.value })
          }
        />
      </label>
      <label className="wide-field">
        Tên thuốc
        <input
          value={form.medicationDisplay}
          onChange={(event) =>
            onFormChange({ ...form, medicationDisplay: event.target.value })
          }
        />
      </label>
      <label className="wide-field">
        Hướng dẫn dùng
        <input
          value={form.dosageText}
          onChange={(event) =>
            onFormChange({ ...form, dosageText: event.target.value })
          }
        />
      </label>
      <label>
        Đường dùng
        <input
          value={form.route}
          onChange={(event) =>
            onFormChange({ ...form, route: event.target.value })
          }
        />
      </label>
      <label>
        Liều lượng
        <input
          type="number"
          step="any"
          value={form.doseValue}
          onChange={(event) =>
            onFormChange({ ...form, doseValue: event.target.value })
          }
        />
      </label>
      <label>
        Đơn vị liều
        <input
          value={form.doseUnit}
          onChange={(event) =>
            onFormChange({ ...form, doseUnit: event.target.value })
          }
        />
      </label>
      <label>
        Tần suất
        <input
          type="number"
          value={form.frequency}
          onChange={(event) =>
            onFormChange({ ...form, frequency: event.target.value })
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
            onFormChange({ ...form, period: event.target.value })
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
    </>
  );
}
