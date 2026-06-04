import type { NewDiagnosticReportForm } from "../../types/diagnosticResults.js";

type DiagnosticReportTimingFieldsProps = {
  readonly form: NewDiagnosticReportForm;
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
};

export function DiagnosticReportTimingFields({
  form,
  onFormChange
}: DiagnosticReportTimingFieldsProps) {
  return (
    <>
      <label>
        Thời điểm hiệu lực
        <input
          type="datetime-local"
          value={form.effectiveAt}
          onChange={(event) => onFormChange({ ...form, effectiveAt: event.target.value })}
        />
      </label>
      <label>
        Thời điểm phát hành
        <input
          type="datetime-local"
          value={form.issuedAt}
          onChange={(event) => onFormChange({ ...form, issuedAt: event.target.value })}
        />
      </label>
    </>
  );
}
