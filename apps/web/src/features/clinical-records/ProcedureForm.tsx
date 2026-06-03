import type { FormEvent } from "react";
import type { NewProcedureForm, ServiceRequest } from "../../types/careWorkflow.js";
import type { Condition } from "../../types/conditions.js";
import type { DiagnosticReport } from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import { ProcedureClassificationFields } from "./ProcedureClassificationFields.js";
import { ProcedureCodeFields } from "./ProcedureCodeFields.js";
import { ProcedureContextFields } from "./ProcedureContextFields.js";
import { ProcedureOutcomeFields } from "./ProcedureOutcomeFields.js";
import { ProcedurePerformerFields } from "./ProcedurePerformerFields.js";
import { ProcedureTimingFields } from "./ProcedureTimingFields.js";

type ProcedureFormProps = {
  readonly conditions: readonly Condition[];
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewProcedureForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateProcedure: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedureForm({
  conditions,
  diagnosticReports,
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  serviceRequests,
  onCreateProcedure,
  onFormChange
}: ProcedureFormProps) {
  return (
    <form className="service-form" onSubmit={(event) => void onCreateProcedure(event)}>
      <ProcedureContextFields
        conditions={conditions}
        encounters={encounters}
        form={form}
        serviceRequests={serviceRequests}
        onFormChange={onFormChange}
      />
      <ProcedureClassificationFields form={form} onFormChange={onFormChange} />
      <ProcedureCodeFields form={form} onFormChange={onFormChange} />
      <ProcedureTimingFields form={form} onFormChange={onFormChange} />
      <ProcedurePerformerFields form={form} onFormChange={onFormChange} />
      <ProcedureOutcomeFields
        diagnosticReports={diagnosticReports}
        form={form}
        onFormChange={onFormChange}
      />
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận Procedure"}
      </button>
    </form>
  );
}
