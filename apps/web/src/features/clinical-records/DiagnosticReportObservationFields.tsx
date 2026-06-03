import type { NewDiagnosticReportForm } from "../../types/diagnosticResults.js";
import type { Observation } from "../../types/observations.js";
import { formatObservationValue } from "./diagnosticResultFormatters.js";

type DiagnosticReportObservationFieldsProps = {
  readonly form: NewDiagnosticReportForm;
  readonly observations: readonly Observation[];
  readonly onFormChange: (form: NewDiagnosticReportForm) => void;
};

export function DiagnosticReportObservationFields({
  form,
  observations,
  onFormChange
}: DiagnosticReportObservationFieldsProps) {
  return (
    <div className="wide-field checkbox-list">
      <span>Observation kết quả</span>
      {observations.map((observation) => {
        const isChecked = form.resultObservationIds.includes(observation.id);

        return (
          <label className="check-option" key={observation.id}>
            <input
              checked={isChecked}
              type="checkbox"
              onChange={(event) => {
                const nextIds = event.target.checked
                  ? [...form.resultObservationIds, observation.id]
                  : form.resultObservationIds.filter((id) => id !== observation.id);
                onFormChange({
                  ...form,
                  resultObservationIds: nextIds
                });
              }}
            />
            <span>
              {observation.code.display} · {formatObservationValue(observation)}
            </span>
          </label>
        );
      })}
      {observations.length === 0 ? (
        <small>
          Chưa có Observation để gắn. Có thể dùng kết luận hoặc tệp báo cáo.
        </small>
      ) : null}
    </div>
  );
}
