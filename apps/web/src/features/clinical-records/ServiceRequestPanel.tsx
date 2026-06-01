import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatServiceRequestCategory,
  formatServiceRequestIntent,
  formatServiceRequestPriority,
  formatServiceRequestStatus
} from "./careWorkflowFormatters.js";
import {
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type {
  Condition,
} from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  NewServiceRequestForm,
  ServiceRequest
} from "../../types/careWorkflow.js";
import { ServiceRequestForm } from "./ServiceRequestForm.js";

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

      <ServiceRequestForm
        conditions={conditions}
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateServiceRequest={onCreateServiceRequest}
        onFormChange={onFormChange}
      />
    </article>
  );
}
