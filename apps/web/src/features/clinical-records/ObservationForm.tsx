import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  NewObservationForm,
  ObservationCategory
} from "../../types/observations.js";

type ObservationFormProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewObservationForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateObservation: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewObservationForm) => void;
};

export function ObservationForm({
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateObservation,
  onFormChange
}: ObservationFormProps) {
  return (
    <form className="observation-form" onSubmit={(event) => void onCreateObservation(event)}>
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
      <label>
        Nhóm chỉ số
        <select
          value={form.category}
          onChange={(event) => onFormChange({ ...form, category: event.target.value as ObservationCategory })}
        >
          <option value="laboratory">Xét nghiệm</option>
          <option value="vital-signs">Sinh hiệu</option>
        </select>
      </label>
      <label>
        Hệ mã
        <input
          value={form.codeSystem}
          onChange={(event) => onFormChange({ ...form, codeSystem: event.target.value })}
        />
      </label>
      <label>
        Mã chỉ số
        <input
          value={form.code}
          onChange={(event) => onFormChange({ ...form, code: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên chỉ số
        <input
          value={form.codeDisplay}
          onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
        />
      </label>
      <label>
        Giá trị
        <input
          type="number"
          step="any"
          value={form.value}
          onChange={(event) => onFormChange({ ...form, value: event.target.value })}
        />
      </label>
      <label>
        Đơn vị
        <input
          value={form.unit}
          onChange={(event) => onFormChange({ ...form, unit: event.target.value })}
        />
      </label>
      <label>
        Hệ đơn vị
        <input
          value={form.unitSystem}
          onChange={(event) => onFormChange({ ...form, unitSystem: event.target.value })}
        />
      </label>
      <label>
        Mã đơn vị
        <input
          value={form.unitCode}
          onChange={(event) => onFormChange({ ...form, unitCode: event.target.value })}
        />
      </label>
      <label>
        Thời điểm ghi nhận
        <input
          type="datetime-local"
          value={form.effectiveAt}
          onChange={(event) => onFormChange({ ...form, effectiveAt: event.target.value })}
        />
      </label>
      <label>
        Nhân sự ghi nhận
        <input
          value={form.performerPractitionerId}
          onChange={(event) => onFormChange({ ...form, performerPractitionerId: event.target.value })}
        />
      </label>
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận chỉ số"}
      </button>
    </form>
  );
}
