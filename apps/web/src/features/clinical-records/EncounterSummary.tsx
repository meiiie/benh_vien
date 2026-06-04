import { Info } from "../../components/AppShell.js";
import type { Encounter } from "../../types/encounters.js";
import type { EncounterPanelCounts } from "./EncounterPanelTypes.js";

type EncounterSummaryProps = {
  readonly isFinishing: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedEncounter?: Encounter;
  readonly selectedEncounterCounts: EncounterPanelCounts;
  readonly onFinishEncounter: (encounterId: string) => Promise<void> | void;
};

export function EncounterSummary({
  isFinishing,
  isWriteDisabled,
  selectedEncounter,
  selectedEncounterCounts,
  onFinishEncounter
}: EncounterSummaryProps) {
  if (!selectedEncounter) {
    return (
      <div className="encounter-summary">
        <p className="empty-state">
          Chọn một lượt khám để xem chi tiết và xuất FHIR Encounter.
        </p>
      </div>
    );
  }

  return (
    <div className="encounter-summary">
      <div className="document-meta">
        <Info label="Lý do khám" value={selectedEncounter.reasonText} />
        <Info label="Khoa/phòng" value={selectedEncounter.departmentId ?? "Chưa gắn"} />
        <Info label="Nhân sự phụ trách" value={selectedEncounter.attendingPractitionerId} />
        <Info
          label="Dị ứng gắn lượt khám"
          value={`${selectedEncounterCounts.allergyIntolerances}`}
        />
        <Info label="Chẩn đoán gắn lượt khám" value={`${selectedEncounterCounts.conditions}`} />
        <Info
          label="Chỉ định dịch vụ gắn lượt khám"
          value={`${selectedEncounterCounts.serviceRequests}`}
        />
        <Info
          label="Công việc thực thi gắn lượt khám"
          value={`${selectedEncounterCounts.workflowTasks}`}
        />
        <Info
          label="Thủ thuật/hoạt động gắn lượt khám"
          value={`${selectedEncounterCounts.procedures}`}
        />
        <Info label="Chỉ số gắn lượt khám" value={`${selectedEncounterCounts.observations}`} />
        <Info
          label="Báo cáo kết quả gắn lượt khám"
          value={`${selectedEncounterCounts.diagnosticReports}`}
        />
        <Info label="Ảnh y khoa gắn lượt khám" value={`${selectedEncounterCounts.imagingStudies}`} />
        <Info label="Thuốc gắn lượt khám" value={`${selectedEncounterCounts.medicationRequests}`} />
        <Info
          label="Cấp phát thuốc gắn lượt khám"
          value={`${selectedEncounterCounts.medicationDispenses}`}
        />
        <Info
          label="Dùng thuốc gắn lượt khám"
          value={`${selectedEncounterCounts.medicationAdministrations}`}
        />
        <Info label="Tài liệu gắn lượt khám" value={`${selectedEncounterCounts.documents}`} />
      </div>
      <div className="action-row">
        <button
          className="primary-button"
          type="button"
          disabled={isWriteDisabled || selectedEncounter.status !== "in-progress" || isFinishing}
          onClick={() => void onFinishEncounter(selectedEncounter.id)}
        >
          {isFinishing ? "Đang kết thúc..." : "Kết thúc lượt khám"}
        </button>
      </div>
    </div>
  );
}
