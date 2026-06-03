import type { NewProcedureForm } from "../../types/careWorkflow.js";
import type { DiagnosticReport } from "../../types/diagnosticResults.js";

type ProcedureOutcomeFieldsProps = {
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly form: NewProcedureForm;
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedureOutcomeFields({
  diagnosticReports,
  form,
  onFormChange
}: ProcedureOutcomeFieldsProps) {
  return (
    <>
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
    </>
  );
}
