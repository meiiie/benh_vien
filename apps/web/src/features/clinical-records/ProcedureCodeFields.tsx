import type { NewProcedureForm } from "../../types/careWorkflow.js";

type ProcedureCodeFieldsProps = {
  readonly form: NewProcedureForm;
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedureCodeFields({
  form,
  onFormChange
}: ProcedureCodeFieldsProps) {
  return (
    <>
      <label>
        Hệ mã
        <input
          value={form.codeSystem}
          onChange={(event) => onFormChange({ ...form, codeSystem: event.target.value })}
        />
      </label>
      <label>
        Mã Procedure
        <input
          value={form.code}
          onChange={(event) => onFormChange({ ...form, code: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên Procedure
        <input
          value={form.codeDisplay}
          onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
        />
      </label>
    </>
  );
}
