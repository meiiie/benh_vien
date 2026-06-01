import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import {
  formatMedicationDispenseCategory,
  formatMedicationDispenseQuantity,
  formatMedicationDispenseStatus,
  formatMedicationDispenseTime
} from "./medicationFormatters.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationDispense,
  MedicationRequest,
  NewMedicationDispenseForm
} from "../../types/medications.js";
import { MedicationDispenseForm } from "./MedicationDispenseForm.js";

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

      <MedicationDispenseForm
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        medicationRequests={medicationRequests}
        onCreateMedicationDispense={onCreateMedicationDispense}
        onFormChange={onFormChange}
      />
    </article>
  );
}
