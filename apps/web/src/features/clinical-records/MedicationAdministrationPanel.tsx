import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import {
  formatMedicationAdministrationCategory,
  formatMedicationAdministrationDose,
  formatMedicationAdministrationPerformers,
  formatMedicationAdministrationPeriod,
  formatMedicationAdministrationStatus
} from "./medicationFormatters.js";
import type {
  Condition,
} from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationAdministration,
  MedicationRequest,
  NewMedicationAdministrationForm
} from "../../types/medications.js";
import { MedicationAdministrationForm } from "./MedicationAdministrationForm.js";

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

      <MedicationAdministrationForm
        conditions={conditions}
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        medicationRequests={medicationRequests}
        onCreateMedicationAdministration={onCreateMedicationAdministration}
        onFormChange={onFormChange}
      />
    </article>
  );
}
