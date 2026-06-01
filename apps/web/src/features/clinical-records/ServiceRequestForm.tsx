import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type {
  NewServiceRequestForm,
  ServiceRequestCategory,
  ServiceRequestPriority
} from "../../types/careWorkflow.js";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";

type ServiceRequestFormProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewServiceRequestForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateServiceRequest: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewServiceRequestForm) => void;
};

export function ServiceRequestForm({
  conditions,
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateServiceRequest,
  onFormChange
}: ServiceRequestFormProps) {
  return (
    <form className="service-form" onSubmit={(event) => void onCreateServiceRequest(event)}>
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
        Chẩn đoán liên quan
        <select
          value={form.reasonConditionId}
          onChange={(event) => onFormChange({ ...form, reasonConditionId: event.target.value })}
        >
          <option value="">Không gắn</option>
          {conditions.map((condition) => (
            <option key={condition.id} value={condition.id}>
              {condition.code.display}
            </option>
          ))}
        </select>
      </label>
      <label>
        Nhóm dịch vụ
        <select
          value={form.category}
          onChange={(event) => onFormChange({ ...form, category: event.target.value as ServiceRequestCategory })}
        >
          <option value="laboratory">Xét nghiệm</option>
          <option value="imaging">Chẩn đoán hình ảnh</option>
          <option value="procedure">Thủ thuật</option>
          <option value="consultation">Hội chẩn/tư vấn</option>
          <option value="therapy">Điều trị/phục hồi</option>
        </select>
      </label>
      <label>
        Ưu tiên
        <select
          value={form.priority}
          onChange={(event) => onFormChange({ ...form, priority: event.target.value as ServiceRequestPriority })}
        >
          <option value="routine">Thông thường</option>
          <option value="urgent">Khẩn</option>
          <option value="asap">Càng sớm càng tốt</option>
          <option value="stat">Cấp cứu ngay</option>
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
        Mã dịch vụ
        <input value={form.code} onChange={(event) => onFormChange({ ...form, code: event.target.value })} />
      </label>
      <label className="wide-field">
        Tên dịch vụ
        <input
          value={form.codeDisplay}
          onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
        />
      </label>
      <label>
        Thời điểm chỉ định
        <input
          type="datetime-local"
          value={form.authoredOn}
          onChange={(event) => onFormChange({ ...form, authoredOn: event.target.value })}
        />
      </label>
      <label>
        Dự kiến thực hiện
        <input
          type="datetime-local"
          value={form.occurrenceAt}
          onChange={(event) => onFormChange({ ...form, occurrenceAt: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Người chỉ định
        <input
          value={form.requesterPractitionerId}
          onChange={(event) => onFormChange({ ...form, requesterPractitionerId: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Khoa/phòng thực hiện
        <input
          value={form.performerOrganizationId}
          onChange={(event) => onFormChange({ ...form, performerOrganizationId: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Hướng dẫn cho người bệnh
        <input
          value={form.patientInstruction}
          onChange={(event) => onFormChange({ ...form, patientInstruction: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Ghi chú
        <input value={form.note} onChange={(event) => onFormChange({ ...form, note: event.target.value })} />
      </label>
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo chỉ định dịch vụ"}
      </button>
    </form>
  );
}
