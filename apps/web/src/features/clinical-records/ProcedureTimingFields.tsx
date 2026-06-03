import type { NewProcedureForm } from "../../types/careWorkflow.js";

type ProcedureTimingFieldsProps = {
  readonly form: NewProcedureForm;
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedureTimingFields({ form, onFormChange }: ProcedureTimingFieldsProps) {
  return (
    <>
      <label>
        Bắt đầu
        <input
          type="datetime-local"
          value={form.performedStart}
          onChange={(event) => onFormChange({ ...form, performedStart: event.target.value })}
        />
      </label>
      <label>
        Kết thúc
        <input
          type="datetime-local"
          value={form.performedEnd}
          onChange={(event) => onFormChange({ ...form, performedEnd: event.target.value })}
        />
      </label>
    </>
  );
}
