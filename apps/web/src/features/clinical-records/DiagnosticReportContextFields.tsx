import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { ServiceRequest } from "../../types/careWorkflow.js";
import type { NewDiagnosticReportForm } from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";

type DiagnosticReportContextFieldsProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewDiagnosticReportForm;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
};

export function DiagnosticReportContextFields({
  encounters,
  form,
  serviceRequests,
  onFormChange
}: DiagnosticReportContextFieldsProps) {
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
    </>
  );
}
