import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { ServiceRequest } from "../../types/careWorkflow.js";
import type {
  DiagnosticReport,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";

type ImagingStudyFormProps = {
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewImagingStudyForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateImagingStudy: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewImagingStudyForm) => void;
};

export function ImagingStudyForm({
  diagnosticReports,
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  serviceRequests,
  onCreateImagingStudy,
  onFormChange
}: ImagingStudyFormProps) {
  return (
    <form className="imaging-study-form" onSubmit={(event) => void onCreateImagingStudy(event)}>
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
        Báo cáo liên quan
        <select
          value={form.diagnosticReportId}
          onChange={(event) =>
            onFormChange({
              ...form,
              diagnosticReportId: event.target.value
            })
          }
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
        DICOM Study Instance UID
        <input
          value={form.studyInstanceUid}
          onChange={(event) => onFormChange({ ...form, studyInstanceUid: event.target.value })}
        />
      </label>
      <label>
        Accession number
        <input
          value={form.accessionNumber}
          onChange={(event) => onFormChange({ ...form, accessionNumber: event.target.value })}
        />
      </label>
      <label>
        Thời điểm bắt đầu
        <input
          type="datetime-local"
          value={form.startedAt}
          onChange={(event) => onFormChange({ ...form, startedAt: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Mô tả nghiên cứu
        <input
          value={form.description}
          onChange={(event) => onFormChange({ ...form, description: event.target.value })}
        />
      </label>
      <label>
        Bác sĩ chỉ định
        <input
          value={form.referrerPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              referrerPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label>
        Bác sĩ đọc ảnh
        <input
          value={form.interpreterPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              interpreterPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Endpoint PACS/DICOMweb
        <input
          value={form.endpointId}
          onChange={(event) => onFormChange({ ...form, endpointId: event.target.value })}
        />
      </label>
      <label className="wide-field">
        DICOM Series Instance UID
        <input
          value={form.seriesUid}
          onChange={(event) => onFormChange({ ...form, seriesUid: event.target.value })}
        />
      </label>
      <label>
        Số thứ tự series
        <input
          value={form.seriesNumber}
          onChange={(event) => onFormChange({ ...form, seriesNumber: event.target.value })}
        />
      </label>
      <label>
        Số ảnh
        <input
          value={form.numberOfInstances}
          onChange={(event) => onFormChange({ ...form, numberOfInstances: event.target.value })}
        />
      </label>
      <label>
        Hệ mã modality
        <input
          value={form.modalitySystem}
          onChange={(event) => onFormChange({ ...form, modalitySystem: event.target.value })}
        />
      </label>
      <label>
        Mã modality
        <input
          value={form.modalityCode}
          onChange={(event) => onFormChange({ ...form, modalityCode: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên modality
        <input
          value={form.modalityDisplay}
          onChange={(event) => onFormChange({ ...form, modalityDisplay: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Mô tả series
        <input
          value={form.seriesDescription}
          onChange={(event) => onFormChange({ ...form, seriesDescription: event.target.value })}
        />
      </label>
      <label>
        Hệ mã vùng chụp
        <input
          value={form.bodySiteSystem}
          onChange={(event) => onFormChange({ ...form, bodySiteSystem: event.target.value })}
        />
      </label>
      <label>
        Mã vùng chụp
        <input
          value={form.bodySiteCode}
          onChange={(event) => onFormChange({ ...form, bodySiteCode: event.target.value })}
        />
      </label>
      <label>
        Tên vùng chụp
        <input
          value={form.bodySiteDisplay}
          onChange={(event) => onFormChange({ ...form, bodySiteDisplay: event.target.value })}
        />
      </label>
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo ImagingStudy"}
      </button>
    </form>
  );
}
