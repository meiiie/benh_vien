import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { MedicationAdministration } from "../../types/medications.js";
import {
  formatMedicationAdministrationCategory,
  formatMedicationAdministrationStatus
} from "./medicationFormatters.js";

type MedicationAdministrationListProps = {
  readonly medicationAdministrations: readonly MedicationAdministration[];
  readonly selectedMedicationAdministrationId?: string;
  readonly onSelectMedicationAdministration: (
    medicationAdministrationId: string
  ) => void;
};

export function MedicationAdministrationList({
  medicationAdministrations,
  selectedMedicationAdministrationId,
  onSelectMedicationAdministration
}: MedicationAdministrationListProps) {
  return (
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
          onClick={() => onSelectMedicationAdministration(medicationAdministration.id)}
        >
          <span>
            {formatMedicationAdministrationCategory(medicationAdministration.category)}
          </span>
          <strong>{medicationAdministration.medicationCode.display}</strong>
          <small>
            {formatMedicationAdministrationStatus(medicationAdministration.status)} ·{" "}
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
  );
}
