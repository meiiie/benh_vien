import type { NewDiagnosticReportForm } from "../../types/diagnosticResults.js";

type DiagnosticReportPerformerFieldsProps = {
  readonly form: NewDiagnosticReportForm;
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
};

export function DiagnosticReportPerformerFields({
  form,
  onFormChange
}: DiagnosticReportPerformerFieldsProps) {
  return (
    <>
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
    </>
  );
}
