import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { MedicationDispense } from "../../types/medications.js";
import {
  formatMedicationDispenseCategory,
  formatMedicationDispenseStatus
} from "./medicationFormatters.js";

type MedicationDispenseListProps = {
  readonly medicationDispenses: readonly MedicationDispense[];
  readonly selectedMedicationDispenseId?: string;
  readonly onSelectMedicationDispense: (medicationDispenseId: string) => void;
};

export function MedicationDispenseList({
  medicationDispenses,
  selectedMedicationDispenseId,
  onSelectMedicationDispense
}: MedicationDispenseListProps) {
  return (
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
          Chưa có bản ghi cấp phát thuốc. Bước này nằm giữa kê đơn và dùng thuốc,
          giúp phân biệt “đã chỉ định” với “khoa dược/kho đã bàn giao thuốc”.
        </p>
      ) : null}
    </div>
  );
}
