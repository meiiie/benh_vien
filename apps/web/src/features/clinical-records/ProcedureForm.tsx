import type { FormEvent } from "react";
import type {
  NewProcedureForm,
  ProcedureCategory,
  ProcedureStatus,
  ServiceRequest
} from "../../types/careWorkflow.js";
import type { Condition } from "../../types/conditions.js";
import type { DiagnosticReport } from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";

type ProcedureFormProps = {
  readonly conditions: readonly Condition[];
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewProcedureForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateProcedure: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedureForm({
  conditions,
  diagnosticReports,
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  serviceRequests,
  onCreateProcedure,
  onFormChange
}: ProcedureFormProps) {
  return (
    <form className="service-form" onSubmit={(event) => void onCreateProcedure(event)}>
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
            onFormChange({ ...form, basedOnServiceRequestId: event.target.value })
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
        Chẩn đoán/lý do
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
        Nhóm Procedure
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({ ...form, category: event.target.value as ProcedureCategory })
          }
        >
          <option value="diagnostic">Chẩn đoán</option>
          <option value="therapeutic">Điều trị</option>
          <option value="surgical">Phẫu thuật</option>
          <option value="counseling">Tư vấn</option>
          <option value="rehabilitation">Phục hồi chức năng</option>
          <option value="other">Khác</option>
        </select>
      </label>
      <label>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) =>
            onFormChange({ ...form, status: event.target.value as ProcedureStatus })
          }
        >
          <option value="completed">Hoàn tất</option>
          <option value="in-progress">Đang thực hiện</option>
          <option value="preparation">Chuẩn bị</option>
          <option value="not-done">Không thực hiện</option>
          <option value="on-hold">Tạm giữ</option>
          <option value="stopped">Đã dừng</option>
          <option value="unknown">Chưa rõ</option>
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
        Mã Procedure
        <input
          value={form.code}
          onChange={(event) => onFormChange({ ...form, code: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên Procedure
        <input
          value={form.codeDisplay}
          onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
        />
      </label>
      <label>
        Bắt đầu
        <input
          type="datetime-local"
          value={form.performedStart}
          onChange={(event) => onFormChange({ ...form, performedStart: event.target.value })}
        />
      </label>
      <label>
        Kết thúc
        <input
          type="datetime-local"
          value={form.performedEnd}
          onChange={(event) => onFormChange({ ...form, performedEnd: event.target.value })}
        />
      </label>
      <label>
        Người/đơn vị thực hiện
        <input
          value={form.performerActorId}
          onChange={(event) => onFormChange({ ...form, performerActorId: event.target.value })}
        />
      </label>
      <label>
        Đại diện khoa/phòng
        <input
          value={form.onBehalfOfOrganizationId}
          onChange={(event) =>
            onFormChange({ ...form, onBehalfOfOrganizationId: event.target.value })
          }
        />
      </label>
      <label>
        Chức năng thực hiện
        <input
          value={form.performerFunctionDisplay}
          onChange={(event) =>
            onFormChange({ ...form, performerFunctionDisplay: event.target.value })
          }
        />
      </label>
      <label>
        Người ghi nhận
        <input
          value={form.recorderPractitionerId}
          onChange={(event) =>
            onFormChange({ ...form, recorderPractitionerId: event.target.value })
          }
        />
      </label>
      <label>
        Vị trí/cơ quan
        <input
          value={form.bodySiteDisplay}
          onChange={(event) => onFormChange({ ...form, bodySiteDisplay: event.target.value })}
        />
      </label>
      <label>
        Kết quả
        <input
          value={form.outcomeDisplay}
          onChange={(event) => onFormChange({ ...form, outcomeDisplay: event.target.value })}
        />
      </label>
      <label>
        Báo cáo liên quan
        <select
          value={form.reportReferenceId}
          onChange={(event) => onFormChange({ ...form, reportReferenceId: event.target.value })}
        >
          <option value="">Không gắn</option>
          {diagnosticReports.map((diagnosticReport) => (
            <option key={diagnosticReport.id} value={diagnosticReport.id}>
              {diagnosticReport.code.display}
            </option>
          ))}
        </select>
      </label>
      <label className="wide-field">
        Ghi chú
        <textarea
          value={form.note}
          onChange={(event) => onFormChange({ ...form, note: event.target.value })}
        />
      </label>
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận Procedure"}
      </button>
    </form>
  );
}
