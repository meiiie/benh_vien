import type { FormEvent } from "react";
import type { ServiceRequest } from "../../types/careWorkflow.js";
import type { NewDiagnosticReportForm } from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import type { Observation } from "../../types/observations.js";
import { DiagnosticReportClassificationFields } from "./DiagnosticReportClassificationFields.js";
import { DiagnosticReportConclusionFields } from "./DiagnosticReportConclusionFields.js";
import { DiagnosticReportContextFields } from "./DiagnosticReportContextFields.js";
import { DiagnosticReportObservationFields } from "./DiagnosticReportObservationFields.js";
import { DiagnosticReportPerformerFields } from "./DiagnosticReportPerformerFields.js";
import { DiagnosticReportTimingFields } from "./DiagnosticReportTimingFields.js";

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
    <form
      className="diagnostic-report-form"
      onSubmit={(event) => void onCreateDiagnosticReport(event)}
    >
      <DiagnosticReportContextFields
        encounters={encounters}
        form={form}
        serviceRequests={serviceRequests}
        onFormChange={onFormChange}
      />
      <DiagnosticReportClassificationFields form={form} onFormChange={onFormChange} />
      <DiagnosticReportTimingFields form={form} onFormChange={onFormChange} />
      <DiagnosticReportPerformerFields form={form} onFormChange={onFormChange} />
      <DiagnosticReportObservationFields
        form={form}
        observations={observations}
        onFormChange={onFormChange}
      />
      <DiagnosticReportConclusionFields form={form} onFormChange={onFormChange} />
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo báo cáo kết quả"}
      </button>
    </form>
  );
}
