import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatConditionCategory,
  formatConditionClinicalStatus,
  formatConditionSeverity,
  formatConditionVerificationStatus,
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type {
  Condition,
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionSeverity,
  ConditionVerificationStatus,
  Encounter,
  NewConditionForm
} from "../../types/clinical.js";

type ConditionPanelProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewConditionForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedCondition?: Condition;
  readonly selectedConditionId?: string;
  readonly onCreateCondition: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewConditionForm) => void;
  readonly onSelectCondition: (conditionId: string) => void;
};

export function ConditionPanel({
  conditions,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  selectedCondition,
  selectedConditionId,
  onCreateCondition,
  onFormChange,
  onSelectCondition
}: ConditionPanelProps) {
  return (
    <article className="panel condition-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Conditions</p>
          <h2>Chẩn đoán và vấn đề sức khỏe</h2>
        </div>
        <span className="pill cyan">{isLoading ? "đang tải" : `${conditions.length} chẩn đoán`}</span>
      </div>

      <div className="document-layout">
        <div className="condition-cards">
          {conditions.map((condition) => (
            <button
              className={condition.id === selectedConditionId ? "condition-card selected" : "condition-card"}
              key={condition.id}
              type="button"
              onClick={() => onSelectCondition(condition.id)}
            >
              <span>{formatConditionCategory(condition.category)}</span>
              <strong>{condition.code.display}</strong>
              <small>
                {formatConditionClinicalStatus(condition.clinicalStatus)} ·{" "}
                {formatDateTime(condition.recordedAt)}
              </small>
            </button>
          ))}
          {conditions.length === 0 ? (
            <p className="empty-state">
              Bệnh nhân này chưa có chẩn đoán có cấu trúc. Hãy ghi nhận vấn đề sức khỏe đầu tiên.
            </p>
          ) : null}
        </div>

        <div className="condition-summary">
          {selectedCondition ? (
            <>
              <div className="document-meta">
                <Info label="Nhóm" value={formatConditionCategory(selectedCondition.category)} />
                <Info label="Lâm sàng" value={formatConditionClinicalStatus(selectedCondition.clinicalStatus)} />
                <Info label="Xác minh" value={formatConditionVerificationStatus(selectedCondition.verificationStatus)} />
                <Info label="Mã chuẩn" value={`${selectedCondition.code.system} · ${selectedCondition.code.code}`} />
                <Info
                  label="Mức độ"
                  value={selectedCondition.severity ? formatConditionSeverity(selectedCondition.severity) : "Chưa gắn"}
                />
                <Info label="Encounter" value={selectedCondition.encounterId ?? "Chưa gắn"} />
              </div>
              <p className="empty-state">
                Condition giúp bên nhận hiểu chẩn đoán/vấn đề sức khỏe ở dạng có cấu trúc, thay vì chỉ đọc thủ công trong file PDF.
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một chẩn đoán để xem siêu dữ liệu và xuất FHIR Condition.</p>
          )}
        </div>
      </div>

      <form className="condition-form" onSubmit={(event) => void onCreateCondition(event)}>
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
          Loại chẩn đoán
          <select
            value={form.category}
            onChange={(event) => onFormChange({ ...form, category: event.target.value as ConditionCategory })}
          >
            <option value="encounter-diagnosis">Chẩn đoán theo lượt khám</option>
            <option value="problem-list-item">Vấn đề sức khỏe dài hạn</option>
          </select>
        </label>
        <label>
          Trạng thái lâm sàng
          <select
            value={form.clinicalStatus}
            onChange={(event) =>
              onFormChange({ ...form, clinicalStatus: event.target.value as ConditionClinicalStatus })
            }
          >
            <option value="active">Đang hoạt động</option>
            <option value="recurrence">Tái phát</option>
            <option value="relapse">Diễn tiến lại</option>
            <option value="inactive">Không hoạt động</option>
            <option value="remission">Thuyên giảm</option>
            <option value="resolved">Đã giải quyết</option>
          </select>
        </label>
        <label>
          Trạng thái xác minh
          <select
            value={form.verificationStatus}
            onChange={(event) =>
              onFormChange({ ...form, verificationStatus: event.target.value as ConditionVerificationStatus })
            }
          >
            <option value="confirmed">Đã xác nhận</option>
            <option value="provisional">Tạm thời</option>
            <option value="differential">Chẩn đoán phân biệt</option>
            <option value="unconfirmed">Chưa xác nhận</option>
            <option value="refuted">Đã loại trừ</option>
            <option value="entered-in-error">Nhập lỗi</option>
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
          Mã chẩn đoán
          <input value={form.code} onChange={(event) => onFormChange({ ...form, code: event.target.value })} />
        </label>
        <label className="wide-field">
          Tên chẩn đoán
          <input
            value={form.codeDisplay}
            onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
          />
        </label>
        <label>
          Mức độ
          <select
            value={form.severity}
            onChange={(event) => onFormChange({ ...form, severity: event.target.value as "" | ConditionSeverity })}
          >
            <option value="">Chưa gắn</option>
            <option value="mild">Nhẹ</option>
            <option value="moderate">Trung bình</option>
            <option value="severe">Nặng</option>
          </select>
        </label>
        <label>
          Thời điểm khởi phát
          <input
            type="datetime-local"
            value={form.onsetAt}
            onChange={(event) => onFormChange({ ...form, onsetAt: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Nhân sự ghi nhận
          <input
            value={form.recorderPractitionerId}
            onChange={(event) => onFormChange({ ...form, recorderPractitionerId: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Ghi chú
          <input value={form.note} onChange={(event) => onFormChange({ ...form, note: event.target.value })} />
        </label>
        <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
          {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận chẩn đoán"}
        </button>
      </form>
    </article>
  );
}
