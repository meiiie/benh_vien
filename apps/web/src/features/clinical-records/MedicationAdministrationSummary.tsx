import { Info } from "../../components/AppShell.js";
import type { MedicationAdministration } from "../../types/medications.js";
import {
  formatMedicationAdministrationCategory,
  formatMedicationAdministrationDose,
  formatMedicationAdministrationPerformers,
  formatMedicationAdministrationPeriod,
  formatMedicationAdministrationStatus
} from "./medicationFormatters.js";

type MedicationAdministrationSummaryProps = {
  readonly selectedMedicationAdministration?: MedicationAdministration;
};

export function MedicationAdministrationSummary({
  selectedMedicationAdministration
}: MedicationAdministrationSummaryProps) {
  if (!selectedMedicationAdministration) {
    return (
      <div className="medication-summary">
        <p className="empty-state">
          Chọn một lần dùng thuốc để xem siêu dữ liệu và xuất FHIR
          MedicationAdministration.
        </p>
      </div>
    );
  }

  return (
    <div className="medication-summary">
      <div className="document-meta">
        <Info label="Thuốc" value={selectedMedicationAdministration.medicationCode.display} />
        <Info
          label="Trạng thái"
          value={formatMedicationAdministrationStatus(selectedMedicationAdministration.status)}
        />
        <Info
          label="Bối cảnh"
          value={formatMedicationAdministrationCategory(selectedMedicationAdministration.category)}
        />
        <Info
          label="Thời điểm"
          value={formatMedicationAdministrationPeriod(
            selectedMedicationAdministration.effectivePeriod
          )}
        />
        <Info
          label="Liều thực tế"
          value={formatMedicationAdministrationDose(selectedMedicationAdministration.dosage)}
        />
        <Info
          label="Gắn đơn thuốc"
          value={selectedMedicationAdministration.medicationRequestId ?? "Chưa gắn"}
        />
        <Info
          label="Người xác nhận"
          value={formatMedicationAdministrationPerformers(
            selectedMedicationAdministration.performers
          )}
        />
        <Info
          label="Chẩn đoán liên quan"
          value={selectedMedicationAdministration.reasonConditionId ?? "Chưa gắn"}
        />
      </div>
      <p className="empty-state">
        MedicationAdministration là sự kiện thuốc đã được dùng hoặc được xác nhận dùng.
        Đây là phần giúp EMR đóng vòng điều trị: bác sĩ kê, hệ thống lưu chỉ định,
        nhân sự y tế xác nhận dùng và FHIR Bundle có thể chuyển sang bệnh viện khác.
      </p>
    </div>
  );
}
