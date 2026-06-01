import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDiagnosticReportCategory,
  formatDiagnosticReportStatus
} from "./diagnosticResultFormatters.js";
import {
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type {
  DiagnosticReport,
  NewDiagnosticReportForm,
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import type { Observation } from "../../types/observations.js";
import type {
  ServiceRequest
} from "../../types/careWorkflow.js";
import { DiagnosticReportForm } from "./DiagnosticReportForm.js";

type DiagnosticReportPanelProps = {
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewDiagnosticReportForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly observations: readonly Observation[];
  readonly selectedDiagnosticReport?: DiagnosticReport;
  readonly selectedDiagnosticReportId?: string;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateDiagnosticReport: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
  readonly onSelectDiagnosticReport: (diagnosticReportId: string) => void;
};

export function DiagnosticReportPanel({
  diagnosticReports,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  observations,
  selectedDiagnosticReport,
  selectedDiagnosticReportId,
  serviceRequests,
  onCreateDiagnosticReport,
  onFormChange,
  onSelectDiagnosticReport
}: DiagnosticReportPanelProps) {
  return (
    <article className="panel diagnostic-report-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Diagnostic reports</p>
          <h2>Báo cáo kết quả xét nghiệm và hình ảnh</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${diagnosticReports.length} báo cáo`}
        </span>
      </div>

      <div className="document-layout">
        <div className="diagnostic-report-cards">
          {diagnosticReports.map((diagnosticReport) => (
            <button
              className={
                diagnosticReport.id === selectedDiagnosticReportId
                  ? "diagnostic-report-card selected"
                  : "diagnostic-report-card"
              }
              key={diagnosticReport.id}
              type="button"
              onClick={() => onSelectDiagnosticReport(diagnosticReport.id)}
            >
              <span>{formatDiagnosticReportCategory(diagnosticReport.category)}</span>
              <strong>{diagnosticReport.code.display}</strong>
              <small>
                {formatDiagnosticReportStatus(diagnosticReport.status)} ·{" "}
                {formatDateTime(diagnosticReport.issuedAt)}
              </small>
            </button>
          ))}
          {diagnosticReports.length === 0 ? (
            <p className="empty-state">
              Chưa có báo cáo kết quả. Khi LIS/RIS/PACS trả kết quả, hãy tạo DiagnosticReport để đóng vòng y lệnh.
            </p>
          ) : null}
        </div>

        <div className="diagnostic-report-summary">
          {selectedDiagnosticReport ? (
            <>
              <div className="document-meta">
                <Info label="Báo cáo" value={selectedDiagnosticReport.code.display} />
                <Info
                  label="Mã báo cáo"
                  value={`${selectedDiagnosticReport.code.system} · ${selectedDiagnosticReport.code.code}`}
                />
                <Info label="Nhóm" value={formatDiagnosticReportCategory(selectedDiagnosticReport.category)} />
                <Info label="Trạng thái" value={formatDiagnosticReportStatus(selectedDiagnosticReport.status)} />
                <Info label="Y lệnh gốc" value={selectedDiagnosticReport.basedOnServiceRequestId ?? "Chưa gắn"} />
                <Info label="Observation kết quả" value={`${selectedDiagnosticReport.resultObservationIds.length}`} />
                <Info label="Khoa phát hành" value={selectedDiagnosticReport.performerOrganizationId ?? "Chưa gắn"} />
                <Info label="Người diễn giải" value={selectedDiagnosticReport.resultsInterpreterPractitionerId ?? "Chưa gắn"} />
              </div>
              <p className="empty-state">
                {selectedDiagnosticReport.conclusion ??
                  "DiagnosticReport gom các Observation hoặc báo cáo dạng tệp để bên nhận hiểu đây là kết quả của một y lệnh ServiceRequest."}
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một báo cáo để xem siêu dữ liệu và xuất FHIR DiagnosticReport.</p>
          )}
        </div>
      </div>

      <DiagnosticReportForm
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        observations={observations}
        serviceRequests={serviceRequests}
        onCreateDiagnosticReport={onCreateDiagnosticReport}
        onFormChange={onFormChange}
      />
    </article>
  );
}
