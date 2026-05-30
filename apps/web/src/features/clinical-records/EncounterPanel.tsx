import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatEncounterClass,
  formatEncounterStatus
} from "../../lib/clinicalFormatters.js";
import type { Encounter, EncounterClass, NewEncounterForm } from "../../types/clinical.js";

type EncounterPanelCounts = {
  readonly allergyIntolerances: number;
  readonly conditions: number;
  readonly serviceRequests: number;
  readonly workflowTasks: number;
  readonly procedures: number;
  readonly observations: number;
  readonly diagnosticReports: number;
  readonly imagingStudies: number;
  readonly medicationRequests: number;
  readonly medicationDispenses: number;
  readonly medicationAdministrations: number;
  readonly documents: number;
};

type EncounterPanelProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewEncounterForm;
  readonly isFinishing: boolean;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedEncounter?: Encounter;
  readonly selectedEncounterCounts: EncounterPanelCounts;
  readonly selectedEncounterId?: string;
  readonly onCreateEncounter: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFinishEncounter: (encounterId: string) => Promise<void> | void;
  readonly onFormChange: (form: NewEncounterForm) => void;
  readonly onSelectEncounter: (encounterId: string) => void;
};

export function EncounterPanel({
  encounters,
  form,
  isFinishing,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  selectedEncounter,
  selectedEncounterCounts,
  selectedEncounterId,
  onCreateEncounter,
  onFinishEncounter,
  onFormChange,
  onSelectEncounter
}: EncounterPanelProps) {
  return (
    <article className="panel encounter-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Encounter timeline</p>
          <h2>Lượt khám và đợt điều trị</h2>
        </div>
        <span className="pill cyan">{isLoading ? "đang tải" : `${encounters.length} lượt`}</span>
      </div>

      <div className="encounter-layout">
        <div className="timeline">
          {encounters.map((encounter) => (
            <button
              className={encounter.id === selectedEncounterId ? "timeline-item selected" : "timeline-item"}
              key={encounter.id}
              type="button"
              onClick={() => onSelectEncounter(encounter.id)}
            >
              <span>{formatDateTime(encounter.startedAt)}</span>
              <strong>{encounter.serviceType}</strong>
              <small>
                {formatEncounterClass(encounter.class)} · {formatEncounterStatus(encounter.status)}
              </small>
            </button>
          ))}
          {encounters.length === 0 ? (
            <p className="empty-state">Chưa có lượt khám nào cho bệnh nhân này.</p>
          ) : null}
        </div>

        <div className="encounter-summary">
          {selectedEncounter ? (
            <>
              <div className="document-meta">
                <Info label="Lý do khám" value={selectedEncounter.reasonText} />
                <Info label="Khoa/phòng" value={selectedEncounter.departmentId ?? "Chưa gắn"} />
                <Info label="Nhân sự phụ trách" value={selectedEncounter.attendingPractitionerId} />
                <Info label="Dị ứng gắn lượt khám" value={`${selectedEncounterCounts.allergyIntolerances}`} />
                <Info label="Chẩn đoán gắn lượt khám" value={`${selectedEncounterCounts.conditions}`} />
                <Info label="Chỉ định dịch vụ gắn lượt khám" value={`${selectedEncounterCounts.serviceRequests}`} />
                <Info label="Công việc thực thi gắn lượt khám" value={`${selectedEncounterCounts.workflowTasks}`} />
                <Info label="Thủ thuật/hoạt động gắn lượt khám" value={`${selectedEncounterCounts.procedures}`} />
                <Info label="Chỉ số gắn lượt khám" value={`${selectedEncounterCounts.observations}`} />
                <Info label="Báo cáo kết quả gắn lượt khám" value={`${selectedEncounterCounts.diagnosticReports}`} />
                <Info label="Ảnh y khoa gắn lượt khám" value={`${selectedEncounterCounts.imagingStudies}`} />
                <Info label="Thuốc gắn lượt khám" value={`${selectedEncounterCounts.medicationRequests}`} />
                <Info label="Cấp phát thuốc gắn lượt khám" value={`${selectedEncounterCounts.medicationDispenses}`} />
                <Info
                  label="Dùng thuốc gắn lượt khám"
                  value={`${selectedEncounterCounts.medicationAdministrations}`}
                />
                <Info label="Tài liệu gắn lượt khám" value={`${selectedEncounterCounts.documents}`} />
              </div>
              <div className="action-row">
                <button
                  className="primary-button"
                  type="button"
                  disabled={isWriteDisabled || selectedEncounter.status !== "in-progress" || isFinishing}
                  onClick={() => void onFinishEncounter(selectedEncounter.id)}
                >
                  {isFinishing ? "Đang kết thúc..." : "Kết thúc lượt khám"}
                </button>
              </div>
            </>
          ) : (
            <p className="empty-state">Chọn một lượt khám để xem chi tiết và xuất FHIR Encounter.</p>
          )}
        </div>
      </div>

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
    </article>
  );
}
