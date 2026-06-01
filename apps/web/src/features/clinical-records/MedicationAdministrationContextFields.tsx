import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationAdministrationCategory,
  MedicationRequest,
  NewMedicationAdministrationForm
} from "../../types/medications.js";

type MedicationAdministrationContextFieldsProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationAdministrationForm;
  readonly medicationRequests: readonly MedicationRequest[];
  readonly onFormChange: (form: NewMedicationAdministrationForm) => void;
};

export function MedicationAdministrationContextFields({
  conditions,
  encounters,
  form,
  medicationRequests,
  onFormChange
}: MedicationAdministrationContextFieldsProps) {
  const applyMedicationRequest = (medicationRequestId: string) => {
    const medicationRequest = medicationRequests.find(
      (request) => request.id === medicationRequestId
    );

    onFormChange({
      ...form,
      medicationRequestId,
      reasonConditionId:
        medicationRequest?.reasonConditionId ?? form.reasonConditionId,
      medicationSystem:
        medicationRequest?.medicationCode.system ?? form.medicationSystem,
      medicationCode:
        medicationRequest?.medicationCode.code ?? form.medicationCode,
      medicationDisplay:
        medicationRequest?.medicationCode.display ?? form.medicationDisplay,
      dosageText: medicationRequest?.dosageInstruction.text ?? form.dosageText,
      doseValue:
        medicationRequest?.dosageInstruction.doseQuantity?.value.toString() ??
        form.doseValue,
      doseUnit:
        medicationRequest?.dosageInstruction.doseQuantity?.unit ??
        form.doseUnit
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
        Chẩn đoán liên quan
        <select
          value={form.reasonConditionId}
          onChange={(event) =>
            onFormChange({
              ...form,
              reasonConditionId: event.target.value
            })
          }
        >
          <option value="">Không gắn</option>
          {conditions.map((condition) => (
            <option key={condition.id} value={condition.id}>
              {condition.code.display} · {condition.code.code}
            </option>
          ))}
        </select>
      </label>
      <label>
        Bối cảnh dùng thuốc
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({
              ...form,
              category: event.target.value as MedicationAdministrationCategory
            })
          }
        >
          <option value="outpatient">Ngoại trú</option>
          <option value="inpatient">Nội trú</option>
          <option value="community">Cộng đồng</option>
          <option value="patient-specified">Bệnh nhân tự khai</option>
        </select>
      </label>
    </>
  );
}
