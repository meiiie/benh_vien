import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type {
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionSeverity,
  ConditionVerificationStatus,
  NewConditionForm
} from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";

type ConditionFormProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewConditionForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateCondition: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewConditionForm) => void;
};

export function ConditionForm({
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateCondition,
  onFormChange
}: ConditionFormProps) {
  return (
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
  );
}
