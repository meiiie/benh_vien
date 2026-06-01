import type {
  MedicationAdministrationPerformerActorType,
  NewMedicationAdministrationForm
} from "../../types/medications.js";

type MedicationAdministrationPerformerFieldsProps = {
  readonly form: NewMedicationAdministrationForm;
  readonly onFormChange: (form: NewMedicationAdministrationForm) => void;
};

export function MedicationAdministrationPerformerFields({
  form,
  onFormChange
}: MedicationAdministrationPerformerFieldsProps) {
  return (
    <>
      <label>
        Thời điểm dùng
        <input
          type="datetime-local"
          value={form.effectiveStart}
          onChange={(event) =>
            onFormChange({
              ...form,
              effectiveStart: event.target.value
            })
          }
        />
      </label>
      <label>
        Loại tác nhân xác nhận
        <select
          value={form.performerActorType}
          onChange={(event) =>
            onFormChange({
              ...form,
              performerActorType: event.target
                .value as MedicationAdministrationPerformerActorType
            })
          }
        >
          <option value="Practitioner">Nhân viên y tế</option>
          <option value="PractitionerRole">Vai trò nhân viên y tế</option>
          <option value="Patient">Người bệnh</option>
          <option value="RelatedPerson">Người liên quan</option>
          <option value="Device">Thiết bị</option>
        </select>
      </label>
      <label>
        Người/thiết bị xác nhận
        <input
          value={form.performerActorId}
          onChange={(event) =>
            onFormChange({
              ...form,
              performerActorId: event.target.value
            })
          }
        />
      </label>
      <label>
        Vai trò xác nhận
        <input
          value={form.performerFunctionDisplay}
          onChange={(event) =>
            onFormChange({
              ...form,
              performerFunctionDisplay: event.target.value
            })
          }
        />
      </label>
    </>
  );
}
