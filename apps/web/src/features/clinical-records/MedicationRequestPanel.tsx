import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import {
  formatDosageInstruction,
  formatMedicationRequestCategory,
  formatMedicationRequestIntent,
  formatMedicationRequestPriority,
  formatMedicationRequestStatus
} from "./medicationFormatters.js";
import type {
  Condition,
} from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationRequest,
  NewMedicationRequestForm
} from "../../types/medications.js";
import { MedicationRequestForm } from "./MedicationRequestForm.js";

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

      <MedicationRequestForm
        conditions={conditions}
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateMedicationRequest={onCreateMedicationRequest}
        onFormChange={onFormChange}
      />
    </article>
  );
}
