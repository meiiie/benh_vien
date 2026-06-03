import type {
  NewProcedureForm,
  ServiceRequest
} from "../../types/careWorkflow.js";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";

type ProcedureContextFieldsProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewProcedureForm;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedureContextFields({
  conditions,
  encounters,
  form,
  serviceRequests,
  onFormChange
}: ProcedureContextFieldsProps) {
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
            onFormChange({ ...form, basedOnServiceRequestId: event.target.value })
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
      <label>
        Chẩn đoán/lý do
        <select
          value={form.reasonConditionId}
          onChange={(event) => onFormChange({ ...form, reasonConditionId: event.target.value })}
        >
          <option value="">Không gắn</option>
          {conditions.map((condition) => (
            <option key={condition.id} value={condition.id}>
              {condition.code.display}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
