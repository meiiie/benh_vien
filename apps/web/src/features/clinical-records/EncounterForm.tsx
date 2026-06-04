import type { FormEvent } from "react";
import type {
  EncounterClass,
  NewEncounterForm
} from "../../types/encounters.js";

type EncounterFormProps = {
  readonly form: NewEncounterForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateEncounter: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewEncounterForm) => void;
};

export function EncounterForm({
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateEncounter,
  onFormChange
}: EncounterFormProps) {
  return (
    <form className="encounter-form" onSubmit={(event) => void onCreateEncounter(event)}>
      <label>
        Loại lượt khám
        <select
          value={form.class}
          onChange={(event) => onFormChange({ ...form, class: event.target.value as EncounterClass })}
        >
          <option value="ambulatory">Ngoại trú</option>
          <option value="inpatient">Nội trú</option>
          <option value="emergency">Cấp cứu</option>
          <option value="virtual">Khám từ xa</option>
        </select>
      </label>
      <label>
        Dịch vụ/khoa khám
        <input
          value={form.serviceType}
          onChange={(event) => onFormChange({ ...form, serviceType: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Lý do khám
        <input
          value={form.reasonText}
          onChange={(event) => onFormChange({ ...form, reasonText: event.target.value })}
        />
      </label>
      <label>
        Khoa/phòng
        <input
          value={form.departmentId}
          onChange={(event) => onFormChange({ ...form, departmentId: event.target.value })}
        />
      </label>
      <label>
        Nhân sự phụ trách
        <input
          value={form.attendingPractitionerId}
          onChange={(event) => onFormChange({ ...form, attendingPractitionerId: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Thời điểm bắt đầu
        <input
          type="datetime-local"
          value={form.startedAt}
          onChange={(event) => onFormChange({ ...form, startedAt: event.target.value })}
        />
      </label>
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang mở..." : "Mở lượt khám"}
      </button>
    </form>
  );
}
