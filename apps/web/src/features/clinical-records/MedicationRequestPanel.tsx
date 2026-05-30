import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatDosageInstruction,
  formatMedicationRequestCategory,
  formatMedicationRequestIntent,
  formatMedicationRequestPriority,
  formatMedicationRequestStatus
} from "../../lib/clinicalFormatters.js";
import type {
  Condition,
  Encounter,
  MedicationRequest,
  MedicationRequestCategory,
  MedicationRequestPriority,
  MedicationTimingUnit,
  NewMedicationRequestForm
} from "../../types/clinical.js";

type MedicationRequestPanelProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationRequestForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationRequests: readonly MedicationRequest[];
  readonly selectedMedicationRequest?: MedicationRequest;
  readonly selectedMedicationRequestId?: string;
  readonly onCreateMedicationRequest: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationRequestForm) => void;
  readonly onSelectMedicationRequest: (medicationRequestId: string) => void;
};

export function MedicationRequestPanel({
  conditions,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  medicationRequests,
  selectedMedicationRequest,
  selectedMedicationRequestId,
  onCreateMedicationRequest,
  onFormChange,
  onSelectMedicationRequest
}: MedicationRequestPanelProps) {
  return (
    <article className="panel medication-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Medication requests</p>
          <h2>Chỉ định thuốc và đơn thuốc</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${medicationRequests.length} chỉ định`}
        </span>
      </div>

      <div className="document-layout">
        <div className="medication-cards">
          {medicationRequests.map((medicationRequest) => (
            <button
              className={
                medicationRequest.id === selectedMedicationRequestId
                  ? "medication-card selected"
                  : "medication-card"
              }
              key={medicationRequest.id}
              type="button"
              onClick={() => onSelectMedicationRequest(medicationRequest.id)}
            >
              <span>{formatMedicationRequestCategory(medicationRequest.category)}</span>
              <strong>{medicationRequest.medicationCode.display}</strong>
              <small>
                {formatMedicationRequestStatus(medicationRequest.status)} ·{" "}
                {formatDateTime(medicationRequest.authoredOn)}
              </small>
            </button>
          ))}
          {medicationRequests.length === 0 ? (
            <p className="empty-state">
              Bệnh nhân này chưa có chỉ định thuốc có cấu trúc. Hãy ghi nhận thuốc đầu tiên để Bundle có thêm MedicationRequest.
            </p>
          ) : null}
        </div>

        <div className="medication-summary">
          {selectedMedicationRequest ? (
            <>
              <div className="document-meta">
                <Info label="Thuốc" value={selectedMedicationRequest.medicationCode.display} />
                <Info
                  label="Mã thuốc"
                  value={`${selectedMedicationRequest.medicationCode.system} · ${selectedMedicationRequest.medicationCode.code}`}
                />
                <Info label="Trạng thái" value={formatMedicationRequestStatus(selectedMedicationRequest.status)} />
                <Info label="Mục đích" value={formatMedicationRequestIntent(selectedMedicationRequest.intent)} />
                <Info label="Ưu tiên" value={formatMedicationRequestPriority(selectedMedicationRequest.priority)} />
                <Info label="Liều dùng" value={formatDosageInstruction(selectedMedicationRequest.dosageInstruction)} />
                <Info label="Chẩn đoán liên quan" value={selectedMedicationRequest.reasonConditionId ?? "Chưa gắn"} />
                <Info label="Người kê" value={selectedMedicationRequest.requesterPractitionerId} />
              </div>
              <p className="empty-state">
                MedicationRequest thể hiện yêu cầu dùng thuốc ở dạng máy đọc được; trong luồng liên viện, nó giúp bên nhận thấy thuốc đang được chỉ định thay vì chỉ đọc trong tài liệu PDF.
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một chỉ định thuốc để xem siêu dữ liệu và xuất FHIR MedicationRequest.</p>
          )}
        </div>
      </div>

      <form className="medication-form" onSubmit={(event) => void onCreateMedicationRequest(event)}>
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
          Chẩn đoán liên quan
          <select
            value={form.reasonConditionId}
            onChange={(event) => onFormChange({ ...form, reasonConditionId: event.target.value })}
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
          Loại chỉ định
          <select
            value={form.category}
            onChange={(event) =>
              onFormChange({
                ...form,
                category: event.target.value as MedicationRequestCategory
              })
            }
          >
            <option value="outpatient">Ngoại trú</option>
            <option value="inpatient">Nội trú</option>
            <option value="community">Cộng đồng</option>
            <option value="discharge">Ra viện</option>
          </select>
        </label>
        <label>
          Ưu tiên
          <select
            value={form.priority}
            onChange={(event) =>
              onFormChange({
                ...form,
                priority: event.target.value as MedicationRequestPriority
              })
            }
          >
            <option value="routine">Thường quy</option>
            <option value="urgent">Khẩn</option>
            <option value="asap">Càng sớm càng tốt</option>
            <option value="stat">Ngay lập tức</option>
          </select>
        </label>
        <label>
          Hệ mã thuốc
          <input
            value={form.medicationSystem}
            onChange={(event) => onFormChange({ ...form, medicationSystem: event.target.value })}
          />
        </label>
        <label>
          Mã thuốc
          <input
            value={form.medicationCode}
            onChange={(event) => onFormChange({ ...form, medicationCode: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Tên thuốc
          <input
            value={form.medicationDisplay}
            onChange={(event) => onFormChange({ ...form, medicationDisplay: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Hướng dẫn dùng
          <input
            value={form.dosageText}
            onChange={(event) => onFormChange({ ...form, dosageText: event.target.value })}
          />
        </label>
        <label>
          Đường dùng
          <input
            value={form.route}
            onChange={(event) => onFormChange({ ...form, route: event.target.value })}
          />
        </label>
        <label>
          Liều lượng
          <input
            type="number"
            step="any"
            value={form.doseValue}
            onChange={(event) => onFormChange({ ...form, doseValue: event.target.value })}
          />
        </label>
        <label>
          Đơn vị liều
          <input
            value={form.doseUnit}
            onChange={(event) => onFormChange({ ...form, doseUnit: event.target.value })}
          />
        </label>
        <label>
          Tần suất
          <input
            type="number"
            value={form.frequency}
            onChange={(event) => onFormChange({ ...form, frequency: event.target.value })}
          />
        </label>
        <label>
          Chu kỳ
          <input
            type="number"
            step="any"
            value={form.period}
            onChange={(event) => onFormChange({ ...form, period: event.target.value })}
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
        <label>
          Thời điểm kê
          <input
            type="datetime-local"
            value={form.authoredOn}
            onChange={(event) => onFormChange({ ...form, authoredOn: event.target.value })}
          />
        </label>
        <label>
          Số ngày cấp
          <input
            type="number"
            value={form.expectedSupplyDurationDays}
            onChange={(event) =>
              onFormChange({
                ...form,
                expectedSupplyDurationDays: event.target.value
              })
            }
          />
        </label>
        <label className="wide-field">
          Người kê
          <input
            value={form.requesterPractitionerId}
            onChange={(event) =>
              onFormChange({
                ...form,
                requesterPractitionerId: event.target.value
              })
            }
          />
        </label>
        <label className="wide-field">
          Ghi chú
          <input
            value={form.note}
            onChange={(event) => onFormChange({ ...form, note: event.target.value })}
          />
        </label>
        <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
          {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận chỉ định thuốc"}
        </button>
      </form>
    </article>
  );
}
