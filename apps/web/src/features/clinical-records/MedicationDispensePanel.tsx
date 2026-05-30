import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatMedicationDispenseCategory,
  formatMedicationDispenseQuantity,
  formatMedicationDispenseStatus,
  formatMedicationDispenseTime
} from "../../lib/clinicalFormatters.js";
import type {
  Encounter,
  MedicationDispense,
  MedicationDispenseCategory,
  MedicationRequest,
  MedicationTimingUnit,
  NewMedicationDispenseForm
} from "../../types/clinical.js";

type MedicationDispensePanelProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationDispenseForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationDispenses: readonly MedicationDispense[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly selectedMedicationDispense?: MedicationDispense;
  readonly selectedMedicationDispenseId?: string;
  readonly onCreateMedicationDispense: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationDispenseForm) => void;
  readonly onSelectMedicationDispense: (medicationDispenseId: string) => void;
};

export function MedicationDispensePanel({
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  medicationDispenses,
  medicationRequests,
  selectedMedicationDispense,
  selectedMedicationDispenseId,
  onCreateMedicationDispense,
  onFormChange,
  onSelectMedicationDispense
}: MedicationDispensePanelProps) {
  return (
    <article className="panel medication-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR MedicationDispense</p>
          <h2>Cấp phát thuốc</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${medicationDispenses.length} lần cấp`}
        </span>
      </div>

      <div className="document-layout">
        <div className="medication-cards">
          {medicationDispenses.map((medicationDispense) => (
            <button
              className={
                medicationDispense.id === selectedMedicationDispenseId
                  ? "medication-card selected"
                  : "medication-card"
              }
              key={medicationDispense.id}
              type="button"
              onClick={() => onSelectMedicationDispense(medicationDispense.id)}
            >
              <span>{formatMedicationDispenseCategory(medicationDispense.category)}</span>
              <strong>{medicationDispense.medicationCode.display}</strong>
              <small>
                {formatMedicationDispenseStatus(medicationDispense.status)} ·{" "}
                {formatDateTime(
                  medicationDispense.whenHandedOver ??
                    medicationDispense.whenPrepared ??
                    medicationDispense.updatedAt
                )}
              </small>
            </button>
          ))}
          {medicationDispenses.length === 0 ? (
            <p className="empty-state">
              Chưa có bản ghi cấp phát thuốc. Bước này nằm giữa kê đơn và dùng
              thuốc, giúp phân biệt “đã chỉ định” với “khoa dược/kho đã bàn
              giao thuốc”.
            </p>
          ) : null}
        </div>

        <div className="medication-summary">
          {selectedMedicationDispense ? (
            <>
              <div className="document-meta">
                <Info
                  label="Thuốc"
                  value={selectedMedicationDispense.medicationCode.display}
                />
                <Info
                  label="Trạng thái"
                  value={formatMedicationDispenseStatus(selectedMedicationDispense.status)}
                />
                <Info
                  label="Loại cấp phát"
                  value={formatMedicationDispenseCategory(
                    selectedMedicationDispense.category
                  )}
                />
                <Info
                  label="Số lượng"
                  value={formatMedicationDispenseQuantity(
                    selectedMedicationDispense.quantity
                  )}
                />
                <Info
                  label="Số ngày cấp"
                  value={formatMedicationDispenseQuantity(
                    selectedMedicationDispense.daysSupply
                  )}
                />
                <Info
                  label="Thời điểm"
                  value={formatMedicationDispenseTime(selectedMedicationDispense)}
                />
                <Info
                  label="Gắn chỉ định"
                  value={selectedMedicationDispense.medicationRequestId ?? "Chưa gắn"}
                />
                <Info
                  label="Người cấp phát"
                  value={
                    selectedMedicationDispense.dispenserPractitionerId ?? "Chưa gắn"
                  }
                />
                <Info
                  label="Người nhận"
                  value={
                    selectedMedicationDispense.receiverPractitionerId ?? "Chưa gắn"
                  }
                />
              </div>
              <p className="empty-state">
                Tài nguyên FHIR MedicationDispense mô tả sự kiện cấp phát thuốc,
                thường do khoa dược hoặc kho thuốc thực hiện. Các trường trên là
                siêu dữ liệu giúp hồ sơ liên viện biết thuốc đã được cấp bao
                nhiêu, vào lúc nào và dựa trên chỉ định nào.
              </p>
            </>
          ) : (
            <p className="empty-state">
              Chọn một lần cấp phát để xem siêu dữ liệu và xuất FHIR
              MedicationDispense.
            </p>
          )}
        </div>
      </div>

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
    </article>
  );
}
