import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationDispenseCategory,
  MedicationRequest,
  MedicationTimingUnit,
  NewMedicationDispenseForm
} from "../../types/medications.js";

type MedicationDispenseFormProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationDispenseForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationRequests: readonly MedicationRequest[];
  readonly onCreateMedicationDispense: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationDispenseForm) => void;
};

export function MedicationDispenseForm({
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  medicationRequests,
  onCreateMedicationDispense,
  onFormChange
}: MedicationDispenseFormProps) {
  return (
    <form
      className="medication-form"
      onSubmit={(event) => void onCreateMedicationDispense(event)}
    >
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
          onChange={(event) => {
            const medicationRequest = medicationRequests.find(
              (request) => request.id === event.target.value
            );
            onFormChange({
              ...form,
              medicationRequestId: event.target.value,
              medicationSystem:
                medicationRequest?.medicationCode.system ?? form.medicationSystem,
              medicationCode:
                medicationRequest?.medicationCode.code ?? form.medicationCode,
              medicationDisplay:
                medicationRequest?.medicationCode.display ?? form.medicationDisplay,
              dosageText:
                medicationRequest?.dosageInstruction.text ?? form.dosageText,
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
                medicationRequest?.dosageInstruction.period?.toString() ??
                form.period,
              periodUnit:
                medicationRequest?.dosageInstruction.periodUnit ?? form.periodUnit,
              daysSupplyValue:
                medicationRequest?.expectedSupplyDurationDays?.toString() ??
                form.daysSupplyValue
            });
          }}
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
      <label className="wide-field">
        Tên thuốc
        <input
          value={form.medicationDisplay}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationDisplay: event.target.value
            })
          }
        />
      </label>
      <label>
        Hệ mã thuốc
        <input
          value={form.medicationSystem}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationSystem: event.target.value
            })
          }
        />
      </label>
      <label>
        Mã thuốc
        <input
          value={form.medicationCode}
          onChange={(event) =>
            onFormChange({
              ...form,
              medicationCode: event.target.value
            })
          }
        />
      </label>
      <label>
        Số lượng cấp
        <input
          type="number"
          step="any"
          value={form.quantityValue}
          onChange={(event) =>
            onFormChange({
              ...form,
              quantityValue: event.target.value
            })
          }
        />
      </label>
      <label>
        Đơn vị cấp
        <input
          value={form.quantityUnit}
          onChange={(event) =>
            onFormChange({
              ...form,
              quantityUnit: event.target.value
            })
          }
        />
      </label>
      <label>
        Số ngày cấp
        <input
          type="number"
          step="any"
          value={form.daysSupplyValue}
          onChange={(event) =>
            onFormChange({
              ...form,
              daysSupplyValue: event.target.value
            })
          }
        />
      </label>
      <label>
        Chuẩn bị thuốc
        <input
          type="datetime-local"
          value={form.whenPrepared}
          onChange={(event) =>
            onFormChange({
              ...form,
              whenPrepared: event.target.value
            })
          }
        />
      </label>
      <label>
        Bàn giao thuốc
        <input
          type="datetime-local"
          value={form.whenHandedOver}
          onChange={(event) =>
            onFormChange({
              ...form,
              whenHandedOver: event.target.value
            })
          }
        />
      </label>
      <label>
        Người cấp phát
        <input
          value={form.dispenserPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              dispenserPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label>
        Người nhận thuốc
        <input
          value={form.receiverPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              receiverPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Hướng dẫn sau cấp phát
        <input
          value={form.dosageText}
          onChange={(event) =>
            onFormChange({
              ...form,
              dosageText: event.target.value
            })
          }
        />
      </label>
      <label>
        Đường dùng
        <input
          value={form.route}
          onChange={(event) =>
            onFormChange({
              ...form,
              route: event.target.value
            })
          }
        />
      </label>
      <label>
        Liều
        <input
          type="number"
          step="any"
          value={form.doseValue}
          onChange={(event) =>
            onFormChange({
              ...form,
              doseValue: event.target.value
            })
          }
        />
      </label>
      <label>
        Đơn vị liều
        <input
          value={form.doseUnit}
          onChange={(event) =>
            onFormChange({
              ...form,
              doseUnit: event.target.value
            })
          }
        />
      </label>
      <label>
        Tần suất
        <input
          type="number"
          value={form.frequency}
          onChange={(event) =>
            onFormChange({
              ...form,
              frequency: event.target.value
            })
          }
        />
      </label>
      <label>
        Chu kỳ
        <input
          type="number"
          step="any"
          value={form.period}
          onChange={(event) =>
            onFormChange({
              ...form,
              period: event.target.value
            })
          }
        />
      </label>
      <label>
        Đơn vị chu kỳ
        <select
          value={form.periodUnit}
          onChange={(event) =>
            onFormChange({
              ...form,
              periodUnit: event.target.value as MedicationTimingUnit
            })
          }
        >
          <option value="h">Giờ</option>
          <option value="d">Ngày</option>
          <option value="wk">Tuần</option>
        </select>
      </label>
      <label className="wide-field">
        Ghi chú
        <input
          value={form.note}
          onChange={(event) =>
            onFormChange({
              ...form,
              note: event.target.value
            })
          }
        />
      </label>
      <button
        className="primary-button"
        type="submit"
        disabled={isWriteDisabled || isSubmitting}
      >
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận cấp phát thuốc"}
      </button>
    </form>
  );
}
