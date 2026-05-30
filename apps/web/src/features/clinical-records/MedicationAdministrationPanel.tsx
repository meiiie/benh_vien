import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatMedicationAdministrationCategory,
  formatMedicationAdministrationDose,
  formatMedicationAdministrationPerformers,
  formatMedicationAdministrationPeriod,
  formatMedicationAdministrationStatus
} from "../../lib/clinicalFormatters.js";
import type {
  Condition,
  Encounter,
  MedicationAdministration,
  MedicationAdministrationCategory,
  MedicationAdministrationPerformerActorType,
  MedicationRequest,
  NewMedicationAdministrationForm
} from "../../types/clinical.js";

type MedicationAdministrationPanelProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationAdministrationForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationAdministrations: readonly MedicationAdministration[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly selectedMedicationAdministration?: MedicationAdministration;
  readonly selectedMedicationAdministrationId?: string;
  readonly onCreateMedicationAdministration: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationAdministrationForm) => void;
  readonly onSelectMedicationAdministration: (
    medicationAdministrationId: string
  ) => void;
};

export function MedicationAdministrationPanel({
  conditions,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  medicationAdministrations,
  medicationRequests,
  selectedMedicationAdministration,
  selectedMedicationAdministrationId,
  onCreateMedicationAdministration,
  onFormChange,
  onSelectMedicationAdministration
}: MedicationAdministrationPanelProps) {
  return (
    <article className="panel medication-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR MedicationAdministration</p>
          <h2>Dùng thuốc thực tế</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${medicationAdministrations.length} lần dùng`}
        </span>
      </div>

      <div className="document-layout">
        <div className="medication-cards">
          {medicationAdministrations.map((medicationAdministration) => (
            <button
              className={
                medicationAdministration.id === selectedMedicationAdministrationId
                  ? "medication-card selected"
                  : "medication-card"
              }
              key={medicationAdministration.id}
              type="button"
              onClick={() =>
                onSelectMedicationAdministration(medicationAdministration.id)
              }
            >
              <span>
                {formatMedicationAdministrationCategory(
                  medicationAdministration.category
                )}
              </span>
              <strong>{medicationAdministration.medicationCode.display}</strong>
              <small>
                {formatMedicationAdministrationStatus(
                  medicationAdministration.status
                )}{" "}
                ·{" "}
                {formatDateTime(
                  medicationAdministration.effectivePeriod.start ??
                    medicationAdministration.updatedAt
                )}
              </small>
            </button>
          ))}
          {medicationAdministrations.length === 0 ? (
            <p className="empty-state">
              Chưa có bản ghi dùng thuốc thực tế. Hãy xác nhận sau khi có
              MedicationRequest để phân biệt “chỉ định” với “đã dùng”.
            </p>
          ) : null}
        </div>

        <div className="medication-summary">
          {selectedMedicationAdministration ? (
            <>
              <div className="document-meta">
                <Info
                  label="Thuốc"
                  value={selectedMedicationAdministration.medicationCode.display}
                />
                <Info
                  label="Trạng thái"
                  value={formatMedicationAdministrationStatus(
                    selectedMedicationAdministration.status
                  )}
                />
                <Info
                  label="Bối cảnh"
                  value={formatMedicationAdministrationCategory(
                    selectedMedicationAdministration.category
                  )}
                />
                <Info
                  label="Thời điểm"
                  value={formatMedicationAdministrationPeriod(
                    selectedMedicationAdministration.effectivePeriod
                  )}
                />
                <Info
                  label="Liều thực tế"
                  value={formatMedicationAdministrationDose(
                    selectedMedicationAdministration.dosage
                  )}
                />
                <Info
                  label="Gắn đơn thuốc"
                  value={
                    selectedMedicationAdministration.medicationRequestId ??
                    "Chưa gắn"
                  }
                />
                <Info
                  label="Người xác nhận"
                  value={formatMedicationAdministrationPerformers(
                    selectedMedicationAdministration.performers
                  )}
                />
                <Info
                  label="Chẩn đoán liên quan"
                  value={
                    selectedMedicationAdministration.reasonConditionId ??
                    "Chưa gắn"
                  }
                />
              </div>
              <p className="empty-state">
                MedicationAdministration là sự kiện thuốc đã được dùng hoặc được
                xác nhận dùng. Đây là phần giúp EMR đóng vòng điều trị: bác sĩ
                kê, hệ thống lưu chỉ định, nhân sự y tế xác nhận dùng và FHIR
                Bundle có thể chuyển sang bệnh viện khác.
              </p>
            </>
          ) : (
            <p className="empty-state">
              Chọn một lần dùng thuốc để xem siêu dữ liệu và xuất FHIR
              MedicationAdministration.
            </p>
          )}
        </div>
      </div>

      <form
        className="medication-form"
        onSubmit={(event) => void onCreateMedicationAdministration(event)}
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
                reasonConditionId:
                  medicationRequest?.reasonConditionId ?? form.reasonConditionId,
                medicationSystem:
                  medicationRequest?.medicationCode.system ?? form.medicationSystem,
                medicationCode:
                  medicationRequest?.medicationCode.code ?? form.medicationCode,
                medicationDisplay:
                  medicationRequest?.medicationCode.display ?? form.medicationDisplay,
                dosageText:
                  medicationRequest?.dosageInstruction.text ?? form.dosageText,
                doseValue:
                  medicationRequest?.dosageInstruction.doseQuantity?.value.toString() ??
                  form.doseValue,
                doseUnit:
                  medicationRequest?.dosageInstruction.doseQuantity?.unit ??
                  form.doseUnit
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
        <label>
          Thời điểm dùng
          <input
            type="datetime-local"
            value={form.effectiveStart}
            onChange={(event) =>
              onFormChange({
                ...form,
                effectiveStart: event.target.value
              })
            }
          />
        </label>
        <label>
          Loại tác nhân xác nhận
          <select
            value={form.performerActorType}
            onChange={(event) =>
              onFormChange({
                ...form,
                performerActorType: event.target
                  .value as MedicationAdministrationPerformerActorType
              })
            }
          >
            <option value="Practitioner">Nhân viên y tế</option>
            <option value="PractitionerRole">Vai trò nhân viên y tế</option>
            <option value="Patient">Người bệnh</option>
            <option value="RelatedPerson">Người liên quan</option>
            <option value="Device">Thiết bị</option>
          </select>
        </label>
        <label>
          Người/thiết bị xác nhận
          <input
            value={form.performerActorId}
            onChange={(event) =>
              onFormChange({
                ...form,
                performerActorId: event.target.value
              })
            }
          />
        </label>
        <label>
          Vai trò xác nhận
          <input
            value={form.performerFunctionDisplay}
            onChange={(event) =>
              onFormChange({
                ...form,
                performerFunctionDisplay: event.target.value
              })
            }
          />
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
        <label className="wide-field">
          Mô tả liều thực tế
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
          Đơn vị
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
          {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận dùng thuốc"}
        </button>
      </form>
    </article>
  );
}
