import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { ServiceRequest } from "../../types/careWorkflow.js";
import type {
  DiagnosticReport,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";

type ImagingStudyContextFieldsProps = {
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewImagingStudyForm;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onFormChange: (form: NewImagingStudyForm) => void;
};

export function ImagingStudyContextFields({
  diagnosticReports,
  encounters,
  form,
  serviceRequests,
  onFormChange
}: ImagingStudyContextFieldsProps) {
  return (
    <>
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
    </>
  );
}
