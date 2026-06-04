import type { NewMedicationDispenseForm } from "../../types/medications.js";

type MedicationDispenseSupplyFieldsProps = {
  readonly form: NewMedicationDispenseForm;
  readonly onFormChange: (form: NewMedicationDispenseForm) => void;
};

export function MedicationDispenseSupplyFields({
  form,
  onFormChange
}: MedicationDispenseSupplyFieldsProps) {
  return (
    <>
      <label className="wide-field">
        Tên thuốc
        <input
          value={form.medicationDisplay}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationDisplay: event.target.value
            })
          }
        />
      </label>
      <label>
        Hệ mã thuốc
        <input
          value={form.medicationSystem}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationSystem: event.target.value
            })
          }
        />
      </label>
      <label>
        Mã thuốc
        <input
          value={form.medicationCode}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationCode: event.target.value
            })
          }
        />
      </label>
      <label>
        Số lượng cấp
        <input
          type="number"
          step="any"
          value={form.quantityValue}
          onChange={(event) =>
            onFormChange({
              ...form,
              quantityValue: event.target.value
            })
          }
        />
      </label>
      <label>
        Đơn vị cấp
        <input
          value={form.quantityUnit}
          onChange={(event) =>
            onFormChange({
              ...form,
              quantityUnit: event.target.value
            })
          }
        />
      </label>
      <label>
        Số ngày cấp
        <input
          type="number"
          step="any"
          value={form.daysSupplyValue}
          onChange={(event) =>
            onFormChange({
              ...form,
              daysSupplyValue: event.target.value
            })
          }
        />
      </label>
      <label>
        Chuẩn bị thuốc
        <input
          type="datetime-local"
          value={form.whenPrepared}
          onChange={(event) =>
            onFormChange({
              ...form,
              whenPrepared: event.target.value
            })
          }
        />
      </label>
      <label>
        Bàn giao thuốc
        <input
          type="datetime-local"
          value={form.whenHandedOver}
          onChange={(event) =>
            onFormChange({
              ...form,
              whenHandedOver: event.target.value
            })
          }
        />
      </label>
      <label>
        Người cấp phát
        <input
          value={form.dispenserPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              dispenserPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label>
        Người nhận thuốc
        <input
          value={form.receiverPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              receiverPractitionerId: event.target.value
            })
          }
        />
      </label>
    </>
  );
}
