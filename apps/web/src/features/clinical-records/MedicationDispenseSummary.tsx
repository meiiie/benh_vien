import { Info } from "../../components/AppShell.js";
import type { MedicationDispense } from "../../types/medications.js";
import {
  formatMedicationDispenseCategory,
  formatMedicationDispenseQuantity,
  formatMedicationDispenseStatus,
  formatMedicationDispenseTime
} from "./medicationFormatters.js";

type MedicationDispenseSummaryProps = {
  readonly selectedMedicationDispense?: MedicationDispense;
};

export function MedicationDispenseSummary({
  selectedMedicationDispense
}: MedicationDispenseSummaryProps) {
  if (!selectedMedicationDispense) {
    return (
      <div className="medication-summary">
        <p className="empty-state">
          Chọn một lần cấp phát để xem siêu dữ liệu và xuất FHIR MedicationDispense.
        </p>
      </div>
    );
  }

  return (
    <div className="medication-summary">
      <div className="document-meta">
        <Info label="Thuốc" value={selectedMedicationDispense.medicationCode.display} />
        <Info
          label="Trạng thái"
          value={formatMedicationDispenseStatus(selectedMedicationDispense.status)}
        />
        <Info
          label="Loại cấp phát"
          value={formatMedicationDispenseCategory(selectedMedicationDispense.category)}
        />
        <Info
          label="Số lượng"
          value={formatMedicationDispenseQuantity(selectedMedicationDispense.quantity)}
        />
        <Info
          label="Số ngày cấp"
          value={formatMedicationDispenseQuantity(selectedMedicationDispense.daysSupply)}
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
          value={selectedMedicationDispense.dispenserPractitionerId ?? "Chưa gắn"}
        />
        <Info
          label="Người nhận"
          value={selectedMedicationDispense.receiverPractitionerId ?? "Chưa gắn"}
        />
      </div>
      <p className="empty-state">
        Tài nguyên FHIR MedicationDispense mô tả sự kiện cấp phát thuốc, thường
        do khoa dược hoặc kho thuốc thực hiện. Các trường trên là siêu dữ liệu
        giúp hồ sơ liên viện biết thuốc đã được cấp bao nhiêu, vào lúc nào và
        dựa trên chỉ định nào.
      </p>
    </div>
  );
}
