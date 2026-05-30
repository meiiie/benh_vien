import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatServiceRequestCategory,
  formatServiceRequestIntent,
  formatServiceRequestPriority,
  formatServiceRequestStatus
} from "../../lib/clinicalFormatters.js";
import type {
  Condition,
  Encounter,
  NewServiceRequestForm,
  ServiceRequest,
  ServiceRequestCategory,
  ServiceRequestPriority
} from "../../types/clinical.js";

type ServiceRequestPanelProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewServiceRequestForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedServiceRequest?: ServiceRequest;
  readonly selectedServiceRequestId?: string;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateServiceRequest: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewServiceRequestForm) => void;
  readonly onSelectServiceRequest: (serviceRequestId: string) => void;
};

export function ServiceRequestPanel({
  conditions,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  selectedServiceRequest,
  selectedServiceRequestId,
  serviceRequests,
  onCreateServiceRequest,
  onFormChange,
  onSelectServiceRequest
}: ServiceRequestPanelProps) {
  return (
    <article className="panel service-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Service requests</p>
          <h2>Chỉ định xét nghiệm, hình ảnh và dịch vụ</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${serviceRequests.length} chỉ định`}
        </span>
      </div>

      <div className="document-layout">
        <div className="service-cards">
          {serviceRequests.map((serviceRequest) => (
            <button
              className={serviceRequest.id === selectedServiceRequestId ? "service-card selected" : "service-card"}
              key={serviceRequest.id}
              type="button"
              onClick={() => onSelectServiceRequest(serviceRequest.id)}
            >
              <span>{formatServiceRequestCategory(serviceRequest.category)}</span>
              <strong>{serviceRequest.code.display}</strong>
              <small>
                {formatServiceRequestPriority(serviceRequest.priority)} ·{" "}
                {formatDateTime(serviceRequest.authoredOn)}
              </small>
            </button>
          ))}
          {serviceRequests.length === 0 ? (
            <p className="empty-state">
              Bệnh nhân này chưa có chỉ định dịch vụ. Hãy tạo ServiceRequest để nối luồng EMR với LIS/PACS.
            </p>
          ) : null}
        </div>

        <div className="service-summary">
          {selectedServiceRequest ? (
            <>
              <div className="document-meta">
                <Info label="Dịch vụ" value={selectedServiceRequest.code.display} />
                <Info
                  label="Mã dịch vụ"
                  value={`${selectedServiceRequest.code.system} · ${selectedServiceRequest.code.code}`}
                />
                <Info label="Nhóm" value={formatServiceRequestCategory(selectedServiceRequest.category)} />
                <Info label="Trạng thái" value={formatServiceRequestStatus(selectedServiceRequest.status)} />
                <Info label="Mục đích" value={formatServiceRequestIntent(selectedServiceRequest.intent)} />
                <Info label="Ưu tiên" value={formatServiceRequestPriority(selectedServiceRequest.priority)} />
                <Info label="Khoa thực hiện" value={selectedServiceRequest.performerOrganizationId ?? "Chưa gắn"} />
                <Info
                  label="Dự kiến thực hiện"
                  value={
                    selectedServiceRequest.occurrenceAt
                      ? formatDateTime(selectedServiceRequest.occurrenceAt)
                      : "Chưa gắn"
                  }
                />
                <Info label="Chẩn đoán liên quan" value={selectedServiceRequest.reasonConditionId ?? "Chưa gắn"} />
                <Info label="Người chỉ định" value={selectedServiceRequest.requesterPractitionerId} />
              </div>
              <p className="empty-state">
                ServiceRequest là y lệnh dịch vụ máy đọc được: xét nghiệm đi sang LIS, chẩn đoán hình ảnh đi sang PACS/RIS, còn kết quả về sau có thể gom bằng Observation hoặc DiagnosticReport.
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một chỉ định dịch vụ để xem siêu dữ liệu và xuất FHIR ServiceRequest.</p>
          )}
        </div>
      </div>

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
    </article>
  );
}
