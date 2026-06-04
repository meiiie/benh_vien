import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatProcedureCategory,
  formatProcedurePerformers,
  formatProcedureReferences,
  formatProcedureStatus
} from "./careWorkflowFormatters.js";
import {
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type {
  NewProcedureForm,
  Procedure,
  ServiceRequest
} from "../../types/careWorkflow.js";
import type { Condition } from "../../types/conditions.js";
import type { DiagnosticReport } from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import { ProcedureForm } from "./ProcedureForm.js";

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

      <ProcedureForm
        conditions={conditions}
        diagnosticReports={diagnosticReports}
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        serviceRequests={serviceRequests}
        onCreateProcedure={onCreateProcedure}
        onFormChange={onFormChange}
      />
    </article>
  );
}
