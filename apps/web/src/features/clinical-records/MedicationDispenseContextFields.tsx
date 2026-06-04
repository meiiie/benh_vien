import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationDispenseCategory,
  MedicationRequest,
  NewMedicationDispenseForm
} from "../../types/medications.js";

type MedicationDispenseContextFieldsProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationDispenseForm;
  readonly medicationRequests: readonly MedicationRequest[];
  readonly onFormChange: (form: NewMedicationDispenseForm) => void;
};

export function MedicationDispenseContextFields({
  encounters,
  form,
  medicationRequests,
  onFormChange
}: MedicationDispenseContextFieldsProps) {
  const applyMedicationRequest = (medicationRequestId: string) => {
    const medicationRequest = medicationRequests.find(
      (request) => request.id === medicationRequestId
    );

    onFormChange({
      ...form,
      medicationRequestId,
      medicationSystem:
        medicationRequest?.medicationCode.system ?? form.medicationSystem,
      medicationCode:
        medicationRequest?.medicationCode.code ?? form.medicationCode,
      medicationDisplay:
        medicationRequest?.medicationCode.display ?? form.medicationDisplay,
      dosageText: medicationRequest?.dosageInstruction.text ?? form.dosageText,
      route: medicationRequest?.dosageInstruction.route ?? form.route,
      doseValue:
        medicationRequest?.dosageInstruction.doseQuantity?.value.toString() ??
        form.doseValue,
      doseUnit:
        medicationRequest?.dosageInstruction.doseQuantity?.unit ??
        form.doseUnit,
      frequency:
        medicationRequest?.dosageInstruction.frequency?.toString() ??
        form.frequency,
      period:
        medicationRequest?.dosageInstruction.period?.toString() ?? form.period,
      periodUnit:
        medicationRequest?.dosageInstruction.periodUnit ?? form.periodUnit,
      daysSupplyValue:
        medicationRequest?.expectedSupplyDurationDays?.toString() ??
        form.daysSupplyValue
    });
  };

  return (
    <>
      <label>
        Gắn với lượt khám
        <select
          value={form.encounterId}
          onChange={(event) =>
            onFormChange({
              ...form,
              encounterId: event.target.value
            })
          }
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
        Gắn chỉ định thuốc (MedicationRequest)
        <select
          value={form.medicationRequestId}
          onChange={(event) => applyMedicationRequest(event.target.value)}
        >
          <option value="">Không gắn</option>
          {medicationRequests.map((medicationRequest) => (
            <option key={medicationRequest.id} value={medicationRequest.id}>
              {medicationRequest.medicationCode.display} ·{" "}
              {formatDateTime(medicationRequest.authoredOn)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Loại cấp phát
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({
              ...form,
              category: event.target.value as MedicationDispenseCategory
            })
          }
        >
          <option value="outpatient">Ngoại trú</option>
          <option value="inpatient">Nội trú</option>
          <option value="community">Cộng đồng</option>
          <option value="discharge">Ra viện</option>
        </select>
      </label>
    </>
  );
}
