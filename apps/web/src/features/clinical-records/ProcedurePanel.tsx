import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatProcedureCategory,
  formatProcedurePerformers,
  formatProcedureReferences,
  formatProcedureStatus
} from "../../lib/clinicalFormatters.js";
import type {
  Condition,
  DiagnosticReport,
  Encounter,
  NewProcedureForm,
  Procedure,
  ProcedureCategory,
  ProcedureStatus,
  ServiceRequest
} from "../../types/clinical.js";

type ProcedurePanelProps = {
  readonly conditions: readonly Condition[];
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewProcedureForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly procedures: readonly Procedure[];
  readonly selectedProcedure?: Procedure;
  readonly selectedProcedureId?: string;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateProcedure: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewProcedureForm) => void;
  readonly onSelectProcedure: (procedureId: string) => void;
};

export function ProcedurePanel({
  conditions,
  diagnosticReports,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  procedures,
  selectedProcedure,
  selectedProcedureId,
  serviceRequests,
  onCreateProcedure,
  onFormChange,
  onSelectProcedure
}: ProcedurePanelProps) {
  return (
    <article className="panel service-request-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Clinical procedures</p>
          <h2>Thủ thuật và hoạt động đã thực hiện</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${procedures.length} bản ghi`}
        </span>
      </div>

      <div className="document-layout">
        <div className="service-cards">
          {procedures.map((procedure) => (
            <button
              className={procedure.id === selectedProcedureId ? "service-card selected" : "service-card"}
              key={procedure.id}
              type="button"
              onClick={() => onSelectProcedure(procedure.id)}
            >
              <span>{formatProcedureCategory(procedure.category)}</span>
              <strong>{procedure.code.display}</strong>
              <small>
                {formatProcedureStatus(procedure.status)} ·{" "}
                {procedure.performedPeriod?.start
                  ? formatDateTime(procedure.performedPeriod.start)
                  : formatDateTime(procedure.updatedAt)}
              </small>
            </button>
          ))}
          {procedures.length === 0 ? (
            <p className="empty-state">
              Chưa có Procedure cho bệnh nhân này. Procedure ghi lại hành động y tế đã thực hiện, còn ServiceRequest là y lệnh và Task là hàng đợi xử lý.
            </p>
          ) : null}
        </div>

        <div className="service-summary">
          {selectedProcedure ? (
            <>
              <div className="document-meta">
                <Info label="Hoạt động" value={selectedProcedure.code.display} />
                <Info
                  label="Mã chuẩn"
                  value={`${selectedProcedure.code.system} · ${selectedProcedure.code.code}`}
                />
                <Info label="Nhóm" value={formatProcedureCategory(selectedProcedure.category)} />
                <Info label="Trạng thái FHIR" value={formatProcedureStatus(selectedProcedure.status)} />
                <Info label="Y lệnh gốc" value={selectedProcedure.basedOnServiceRequestId ?? "Chưa gắn"} />
                <Info label="Chẩn đoán/lý do" value={selectedProcedure.reasonConditionId ?? "Chưa gắn"} />
                <Info
                  label="Bắt đầu"
                  value={
                    selectedProcedure.performedPeriod?.start
                      ? formatDateTime(selectedProcedure.performedPeriod.start)
                      : "Chưa gắn"
                  }
                />
                <Info
                  label="Kết thúc"
                  value={
                    selectedProcedure.performedPeriod?.end
                      ? formatDateTime(selectedProcedure.performedPeriod.end)
                      : "Chưa gắn"
                  }
                />
                <Info label="Người ghi nhận" value={selectedProcedure.recorderPractitionerId ?? "Chưa gắn"} />
                <Info label="Người xác nhận" value={selectedProcedure.asserterPractitionerId ?? "Chưa gắn"} />
                <Info label="Vị trí/cơ quan" value={selectedProcedure.bodySite?.display ?? "Chưa gắn"} />
                <Info label="Kết quả thủ thuật" value={selectedProcedure.outcome?.display ?? "Chưa gắn"} />
              </div>
              <div className="reference-list compact-list">
                <div>
                  <strong>Người/đơn vị thực hiện</strong>
                  <span>{formatProcedurePerformers(selectedProcedure.performers)}</span>
                </div>
                <div>
                  <strong>Báo cáo liên quan</strong>
                  <span>{formatProcedureReferences(selectedProcedure.reportReferences)}</span>
                </div>
              </div>
              <p className="empty-state">
                Procedure là lớp “đã làm gì cho người bệnh”: ví dụ chụp X-quang, thủ thuật, tư vấn hoặc phục hồi chức năng. Nó giúp Bundle không chỉ có y lệnh và kết quả, mà còn có dấu vết lâm sàng của hành động đã diễn ra.
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một thủ thuật/thao tác y khoa để xem siêu dữ liệu và xuất FHIR Procedure.</p>
          )}
        </div>
      </div>

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
    </article>
  );
}
