import type { Patient, PatientStatusFilter } from "../../types/clinical.js";
import { formatPatientRecordStatus } from "../../lib/clinicalFormatters.js";

type PatientListPanelProps = {
  readonly patients: readonly Patient[];
  readonly visiblePatients: readonly Patient[];
  readonly selectedPatientId?: string;
  readonly searchTerm: string;
  readonly statusFilter: PatientStatusFilter;
  readonly hasFilter: boolean;
  readonly isLoading: boolean;
  readonly onClearFilters: () => void;
  readonly onRefresh: () => Promise<void> | void;
  readonly onSearchTermChange: (value: string) => void;
  readonly onSelectPatient: (patientId: string) => void;
  readonly onStatusFilterChange: (value: PatientStatusFilter) => void;
};

export function PatientListPanel({
  patients,
  visiblePatients,
  selectedPatientId,
  searchTerm,
  statusFilter,
  hasFilter,
  isLoading,
  onClearFilters,
  onRefresh,
  onSearchTermChange,
  onSelectPatient,
  onStatusFilterChange
}: PatientListPanelProps) {
  return (
    <article className="panel patient-list">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Registry</p>
          <h2>Danh sách bệnh nhân</h2>
        </div>
        <div className="patient-list-actions">
          <span className="pill cyan">
            {visiblePatients.length}/{patients.length} hồ sơ
          </span>
          <button
            className="ghost-button compact-button"
            type="button"
            onClick={() => void onRefresh()}
            disabled={isLoading}
          >
            {isLoading ? "Đang tải..." : "Tải lại"}
          </button>
        </div>
      </div>

      <div className="patient-list-controls">
        <label>
          Tìm kiếm
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Tên, MRN/CCCD, điện thoại, cơ sở..."
          />
        </label>
        <label>
          Trạng thái
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as PatientStatusFilter)
            }
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="merged">Đã merge</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
        <button
          className="ghost-button compact-button"
          type="button"
          onClick={onClearFilters}
          disabled={!hasFilter}
        >
          Xóa lọc
        </button>
      </div>

      <div className="patient-cards">
        {visiblePatients.map((patient) => (
          <button
            className={[
              "patient-card",
              patient.id === selectedPatientId ? "selected" : "",
              patient.status === "merged" ? "merged" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            key={patient.id}
            type="button"
            onClick={() => onSelectPatient(patient.id)}
          >
            <span>
              {patient.identifiers[0]?.value ?? patient.id} ·{" "}
              {formatPatientRecordStatus(patient.status)}
            </span>
            <strong>{patient.fullName}</strong>
            <small>{patient.address ?? "Chưa có địa chỉ"}</small>
          </button>
        ))}
        {!isLoading && visiblePatients.length === 0 ? (
          <p className="empty-state">
            Không có hồ sơ phù hợp với bộ lọc hiện tại. Hãy thử xóa lọc hoặc tìm
            theo mã MRN/CCCD khác.
          </p>
        ) : null}
      </div>
    </article>
  );
}
