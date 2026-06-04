import type { NewDiagnosticReportForm } from "../../types/diagnosticResults.js";

type DiagnosticReportConclusionFieldsProps = {
  readonly form: NewDiagnosticReportForm;
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
};

export function DiagnosticReportConclusionFields({
  form,
  onFormChange
}: DiagnosticReportConclusionFieldsProps) {
  return (
    <>
      <label className="wide-field">
        Kết luận
        <input
          value={form.conclusion}
          onChange={(event) => onFormChange({ ...form, conclusion: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Đường dẫn tệp báo cáo
        <input
          value={form.presentedFormUrl}
          onChange={(event) => onFormChange({ ...form, presentedFormUrl: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tiêu đề tệp báo cáo
        <input
          value={form.presentedFormTitle}
          onChange={(event) => onFormChange({ ...form, presentedFormTitle: event.target.value })}
        />
      </label>
    </>
  );
}
