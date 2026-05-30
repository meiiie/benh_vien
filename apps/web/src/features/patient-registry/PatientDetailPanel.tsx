import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatGender,
  formatIdentifierType,
  formatPatientRecordStatus
} from "../../lib/clinicalFormatters.js";
import type { Patient } from "../../types/clinical.js";

type PatientDetailPanelProps = {
  readonly isMerged: boolean;
  readonly patient?: Patient;
  readonly mergeTarget?: Patient;
};

export function PatientDetailPanel({
  isMerged,
  patient,
  mergeTarget
}: PatientDetailPanelProps) {
  return (
    <article className="panel patient-detail">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Patient chart</p>
          <h2>Hồ sơ đang chọn</h2>
        </div>
        {patient ? (
          <span className={`pill ${isMerged ? "gold" : ""}`}>
            {formatPatientRecordStatus(patient.status)}
          </span>
        ) : null}
      </div>

      {patient && isMerged ? (
        <div className="merged-patient-banner" role="status">
          <p className="eyebrow">Master Patient Index</p>
          <h3>Hồ sơ đã được merge và chuyển sang chế độ chỉ đọc</h3>
          <p>
            Không ghi thêm dữ liệu lâm sàng vào hồ sơ nguồn này. Các lượt khám,
            chỉ định, kết quả, thuốc và tài liệu mới cần được tạo trên hồ sơ đích
            để tránh phân mảnh bệnh án điện tử.
          </p>
          <div className="detail-grid compact">
            <Info
              label="Hồ sơ đích"
              value={
                mergeTarget
                  ? `${mergeTarget.fullName} (${patient.mergedIntoPatientId})`
                  : patient.mergedIntoPatientId ?? "Chưa ghi nhận"
              }
            />
            <Info
              label="Thời điểm merge"
              value={patient.mergedAt ? formatDateTime(patient.mergedAt) : "Chưa ghi nhận"}
            />
            <Info label="Người thực hiện" value={patient.mergedByActorId ?? "Chưa ghi nhận"} />
            <Info label="Lý do" value={patient.mergeReason ?? "Chưa ghi nhận"} />
          </div>
        </div>
      ) : null}

      {patient ? (
        <div className="detail-grid">
          <Info label="Họ tên" value={patient.fullName} />
          <Info label="Ngày sinh" value={patient.birthDate ?? "Chưa có"} />
          <Info label="Giới tính" value={formatGender(patient.gender)} />
          <Info label="Điện thoại" value={patient.phone ?? "Chưa có"} />
          <Info label="Cơ sở quản lý" value={patient.managingOrganizationId} />
          <Info label="Cập nhật" value={formatDateTime(patient.updatedAt)} />
          <div className="identifiers">
            <span>Định danh</span>
            {patient.identifiers.map((identifier) => (
              <code key={`${identifier.system}:${identifier.value}`}>
                {formatIdentifierType(identifier.type)} · {identifier.value}
              </code>
            ))}
          </div>
        </div>
      ) : (
        <p className="empty-state">Chưa có bệnh nhân nào để hiển thị.</p>
      )}
    </article>
  );
}
