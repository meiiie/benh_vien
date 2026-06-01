import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { ServiceRequest } from "../../types/careWorkflow.js";
import type {
  DiagnosticReportCategory,
  NewDiagnosticReportForm
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import type { Observation } from "../../types/observations.js";
import { formatObservationValue } from "./diagnosticResultFormatters.js";

type DiagnosticReportFormProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewDiagnosticReportForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly observations: readonly Observation[];
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateDiagnosticReport: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
};

export function DiagnosticReportForm({
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  observations,
  serviceRequests,
  onCreateDiagnosticReport,
  onFormChange
}: DiagnosticReportFormProps) {
  return (
    <form className="diagnostic-report-form" onSubmit={(event) => void onCreateDiagnosticReport(event)}>
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
        Y lệnh gốc
        <select
          value={form.basedOnServiceRequestId}
          onChange={(event) =>
            onFormChange({
              ...form,
              basedOnServiceRequestId: event.target.value
            })
          }
        >
          <option value="">Không gắn</option>
          {serviceRequests.map((serviceRequest) => (
            <option key={serviceRequest.id} value={serviceRequest.id}>
              {serviceRequest.code.display}
            </option>
          ))}
        </select>
      </label>
      <label>
        Nhóm báo cáo
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({
              ...form,
              category: event.target.value as DiagnosticReportCategory
            })
          }
        >
          <option value="laboratory">Xét nghiệm</option>
          <option value="imaging">Chẩn đoán hình ảnh</option>
          <option value="pathology">Giải phẫu bệnh</option>
          <option value="other">Khác</option>
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
        Mã báo cáo
        <input
          value={form.code}
          onChange={(event) => onFormChange({ ...form, code: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên báo cáo
        <input
          value={form.codeDisplay}
          onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
        />
      </label>
      <label>
        Thời điểm hiệu lực
        <input
          type="datetime-local"
          value={form.effectiveAt}
          onChange={(event) => onFormChange({ ...form, effectiveAt: event.target.value })}
        />
      </label>
      <label>
        Thời điểm phát hành
        <input
          type="datetime-local"
          value={form.issuedAt}
          onChange={(event) => onFormChange({ ...form, issuedAt: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Khoa/phòng phát hành
        <input
          value={form.performerOrganizationId}
          onChange={(event) =>
            onFormChange({
              ...form,
              performerOrganizationId: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Người diễn giải kết quả
        <input
          value={form.resultsInterpreterPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              resultsInterpreterPractitionerId: event.target.value
            })
          }
        />
      </label>
      <div className="wide-field checkbox-list">
        <span>Observation kết quả</span>
        {observations.map((observation) => {
          const isChecked = form.resultObservationIds.includes(observation.id);

          return (
            <label className="check-option" key={observation.id}>
              <input
                checked={isChecked}
                type="checkbox"
                onChange={(event) => {
                  const nextIds = event.target.checked
                    ? [...form.resultObservationIds, observation.id]
                    : form.resultObservationIds.filter((id) => id !== observation.id);
                  onFormChange({
                    ...form,
                    resultObservationIds: nextIds
                  });
                }}
              />
              <span>{observation.code.display} · {formatObservationValue(observation)}</span>
            </label>
          );
        })}
        {observations.length === 0 ? (
          <small>Chưa có Observation để gắn. Có thể dùng kết luận hoặc tệp báo cáo.</small>
        ) : null}
      </div>
      <label className="wide-field">
        Kết luận
        <input
          value={form.conclusion}
          onChange={(event) => onFormChange({ ...form, conclusion: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Đường dẫn tệp báo cáo
        <input
          value={form.presentedFormUrl}
          onChange={(event) => onFormChange({ ...form, presentedFormUrl: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tiêu đề tệp báo cáo
        <input
          value={form.presentedFormTitle}
          onChange={(event) => onFormChange({ ...form, presentedFormTitle: event.target.value })}
        />
      </label>
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo báo cáo kết quả"}
      </button>
    </form>
  );
}
