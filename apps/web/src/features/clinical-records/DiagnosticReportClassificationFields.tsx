import type {
  DiagnosticReportCategory,
  NewDiagnosticReportForm
} from "../../types/diagnosticResults.js";

type DiagnosticReportClassificationFieldsProps = {
  readonly form: NewDiagnosticReportForm;
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
};

export function DiagnosticReportClassificationFields({
  form,
  onFormChange
}: DiagnosticReportClassificationFieldsProps) {
  return (
    <>
      <label>
        Nhóm báo cáo
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({
              ...form,
              category: event.target.value as DiagnosticReportCategory
            })
          }
        >
          <option value="laboratory">Xét nghiệm</option>
          <option value="imaging">Chẩn đoán hình ảnh</option>
          <option value="pathology">Giải phẫu bệnh</option>
          <option value="other">Khác</option>
        </select>
      </label>
      <label>
        Hệ mã
        <input
          value={form.codeSystem}
          onChange={(event) => onFormChange({ ...form, codeSystem: event.target.value })}
        />
      </label>
      <label>
        Mã báo cáo
        <input
          value={form.code}
          onChange={(event) => onFormChange({ ...form, code: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên báo cáo
        <input
          value={form.codeDisplay}
          onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
        />
      </label>
    </>
  );
}
