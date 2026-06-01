import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import { formatImagingStudyStatus } from "./diagnosticResultFormatters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type {
  DiagnosticReport,
  ImagingStudy,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import type { ServiceRequest } from "../../types/careWorkflow.js";
import { ImagingStudyForm } from "./ImagingStudyForm.js";

type ImagingStudyPanelProps = {
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewImagingStudyForm;
  readonly imagingStudies: readonly ImagingStudy[];
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedImagingStudy?: ImagingStudy;
  readonly selectedImagingStudyId?: string;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateImagingStudy: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewImagingStudyForm) => void;
  readonly onSelectImagingStudy: (imagingStudyId: string) => void;
};

export function ImagingStudyPanel({
  diagnosticReports,
  encounters,
  form,
  imagingStudies,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  selectedImagingStudy,
  selectedImagingStudyId,
  serviceRequests,
  onCreateImagingStudy,
  onFormChange,
  onSelectImagingStudy
}: ImagingStudyPanelProps) {
  return (
    <article className="panel imaging-study-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PACS / DICOM</p>
          <h2>Nghiên cứu hình ảnh y khoa</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${imagingStudies.length} nghiên cứu`}
        </span>
      </div>

      <div className="document-layout">
        <div className="imaging-study-cards">
          {imagingStudies.map((imagingStudy) => (
            <button
              className={
                imagingStudy.id === selectedImagingStudyId
                  ? "imaging-study-card selected"
                  : "imaging-study-card"
              }
              key={imagingStudy.id}
              type="button"
              onClick={() => onSelectImagingStudy(imagingStudy.id)}
            >
              <span>{formatImagingStudyStatus(imagingStudy.status)}</span>
              <strong>{imagingStudy.description ?? imagingStudy.studyInstanceUid}</strong>
              <small>
                {imagingStudy.series[0]?.modality.display ?? "DICOM"} ·{" "}
                {imagingStudy.startedAt ? formatDateTime(imagingStudy.startedAt) : "Chưa có thời điểm"}
              </small>
            </button>
          ))}
          {imagingStudies.length === 0 ? (
            <p className="empty-state">
              Chưa có FHIR ImagingStudy. Khi PACS/RIS có siêu dữ liệu DICOM, hãy tạo nghiên cứu hình ảnh để Bundle không chỉ có báo cáo PDF mà còn có chỉ mục ảnh máy đọc được.
            </p>
          ) : null}
        </div>

        <div className="imaging-study-summary">
          {selectedImagingStudy ? (
            <>
              <div className="document-meta">
                <Info label="Mô tả" value={selectedImagingStudy.description ?? "Chưa có mô tả"} />
                <Info label="Study UID" value={selectedImagingStudy.studyInstanceUid} />
                <Info label="Accession" value={selectedImagingStudy.accessionNumber ?? "Chưa gắn"} />
                <Info label="Trạng thái" value={formatImagingStudyStatus(selectedImagingStudy.status)} />
                <Info label="Y lệnh gốc" value={selectedImagingStudy.basedOnServiceRequestId ?? "Chưa gắn"} />
                <Info label="Báo cáo liên quan" value={selectedImagingStudy.diagnosticReportId ?? "Chưa gắn"} />
                <Info label="Endpoint PACS" value={selectedImagingStudy.endpointId ?? "Chưa gắn"} />
                <Info
                  label="Số ảnh"
                  value={`${selectedImagingStudy.numberOfInstances} ảnh / ${selectedImagingStudy.numberOfSeries} series`}
                />
              </div>
              <div className="reference-list">
                {selectedImagingStudy.series.map((series) => (
                  <div key={series.uid}>
                    <strong>
                      Series {series.number ?? "-"} · {series.modality.display}
                    </strong>
                    <span>
                      UID {series.uid}; {series.numberOfInstances} ảnh
                      {series.bodySite ? `; vùng chụp ${series.bodySite.display}` : ""}.
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-state">Chọn một nghiên cứu hình ảnh để xem siêu dữ liệu PACS/DICOM và xuất FHIR ImagingStudy.</p>
          )}
        </div>
      </div>

      <ImagingStudyForm
        diagnosticReports={diagnosticReports}
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        serviceRequests={serviceRequests}
        onCreateImagingStudy={onCreateImagingStudy}
        onFormChange={onFormChange}
      />
    </article>
  );
}
