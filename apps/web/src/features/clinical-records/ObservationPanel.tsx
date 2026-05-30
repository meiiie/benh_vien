import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatObservationCategory,
  formatObservationStatus,
  formatObservationValue
} from "../../lib/clinicalFormatters.js";
import type {
  Encounter,
  NewObservationForm,
  Observation,
  ObservationCategory
} from "../../types/clinical.js";

type ObservationPanelProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewObservationForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly observations: readonly Observation[];
  readonly selectedObservation?: Observation;
  readonly selectedObservationId?: string;
  readonly onCreateObservation: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewObservationForm) => void;
  readonly onSelectObservation: (observationId: string) => void;
};

export function ObservationPanel({
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  observations,
  selectedObservation,
  selectedObservationId,
  onCreateObservation,
  onFormChange,
  onSelectObservation
}: ObservationPanelProps) {
  return (
    <article className="panel observation-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Clinical observations</p>
          <h2>Chỉ số lâm sàng và xét nghiệm</h2>
        </div>
        <span className="pill cyan">{isLoading ? "đang tải" : `${observations.length} chỉ số`}</span>
      </div>

      <div className="document-layout">
        <div className="observation-cards">
          {observations.map((observation) => (
            <button
              className={observation.id === selectedObservationId ? "observation-card selected" : "observation-card"}
              key={observation.id}
              type="button"
              onClick={() => onSelectObservation(observation.id)}
            >
              <span>{formatObservationCategory(observation.category)}</span>
              <strong>{observation.code.display}</strong>
              <small>
                {formatObservationValue(observation)} · {formatDateTime(observation.effectiveAt)}
              </small>
            </button>
          ))}
          {observations.length === 0 ? (
            <p className="empty-state">
              Bệnh nhân này chưa có chỉ số có cấu trúc. Hãy ghi nhận sinh hiệu hoặc kết quả xét nghiệm đầu tiên.
            </p>
          ) : null}
        </div>

        <div className="observation-summary">
          {selectedObservation ? (
            <>
              <div className="document-meta">
                <Info label="Nhóm" value={formatObservationCategory(selectedObservation.category)} />
                <Info label="Trạng thái" value={formatObservationStatus(selectedObservation.status)} />
                <Info label="Mã chuẩn" value={`${selectedObservation.code.system} · ${selectedObservation.code.code}`} />
                <Info label="Giá trị" value={formatObservationValue(selectedObservation)} />
                <Info label="Encounter" value={selectedObservation.encounterId ?? "Chưa gắn"} />
                <Info label="Người ghi nhận" value={selectedObservation.performerPractitionerId ?? "Chưa gắn"} />
              </div>
              <p className="empty-state">
                Observation là dữ liệu lâm sàng có cấu trúc; khi xuất Bundle sẽ đi cùng Patient, Encounter và
                DocumentReference để bên nhận có thể xử lý máy đọc được.
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một chỉ số để xem siêu dữ liệu và xuất FHIR Observation.</p>
          )}
        </div>
      </div>

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
            onChange={(event) =>
              onFormChange({ ...form, category: event.target.value as ObservationCategory })
            }
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
            onChange={(event) =>
              onFormChange({ ...form, performerPractitionerId: event.target.value })
            }
          />
        </label>
        <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
          {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận chỉ số"}
        </button>
      </form>
    </article>
  );
}
