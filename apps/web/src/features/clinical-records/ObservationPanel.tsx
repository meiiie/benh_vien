import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatObservationCategory,
  formatObservationStatus,
  formatObservationValue
} from "./diagnosticResultFormatters.js";
import {
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  NewObservationForm,
  Observation
} from "../../types/observations.js";
import { ObservationForm } from "./ObservationForm.js";

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

      <ObservationForm
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateObservation={onCreateObservation}
        onFormChange={onFormChange}
      />
    </article>
  );
}
