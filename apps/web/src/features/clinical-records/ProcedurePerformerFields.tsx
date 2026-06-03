import type { NewProcedureForm } from "../../types/careWorkflow.js";

type ProcedurePerformerFieldsProps = {
  readonly form: NewProcedureForm;
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedurePerformerFields({
  form,
  onFormChange
}: ProcedurePerformerFieldsProps) {
  return (
    <>
      <label>
        Người/đơn vị thực hiện
        <input
          value={form.performerActorId}
          onChange={(event) => onFormChange({ ...form, performerActorId: event.target.value })}
        />
      </label>
      <label>
        Đại diện khoa/phòng
        <input
          value={form.onBehalfOfOrganizationId}
          onChange={(event) =>
            onFormChange({ ...form, onBehalfOfOrganizationId: event.target.value })
          }
        />
      </label>
      <label>
        Chức năng thực hiện
        <input
          value={form.performerFunctionDisplay}
          onChange={(event) =>
            onFormChange({ ...form, performerFunctionDisplay: event.target.value })
          }
        />
      </label>
      <label>
        Người ghi nhận
        <input
          value={form.recorderPractitionerId}
          onChange={(event) =>
            onFormChange({ ...form, recorderPractitionerId: event.target.value })
          }
        />
      </label>
    </>
  );
}
