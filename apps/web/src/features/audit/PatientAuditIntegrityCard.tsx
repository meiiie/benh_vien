import {
  formatAuditIntegrityReason,
  formatAuditIntegrityStatus
} from "../../lib/auditFormatters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { AuditIntegrityReport } from "../../types/audit.js";

type PatientAuditIntegrityCardProps = {
  readonly auditIntegrityReport?: AuditIntegrityReport;
};

export function PatientAuditIntegrityCard({
  auditIntegrityReport
}: PatientAuditIntegrityCardProps) {
  if (!auditIntegrityReport) {
    return null;
  }

  return (
    <div className={`integrity-card integrity-card--${auditIntegrityReport.status}`}>
      <div>
        <span>Trạng thái chuỗi băm</span>
        <strong>{formatAuditIntegrityStatus(auditIntegrityReport.status)}</strong>
      </div>
      <div>
        <span>Số bản ghi đã kiểm</span>
        <strong>
          {auditIntegrityReport.sealedEvents}/{auditIntegrityReport.totalEvents}
        </strong>
      </div>
      <div>
        <span>Lần kiểm tra</span>
        <strong>{formatDateTime(auditIntegrityReport.checkedAt)}</strong>
      </div>
      <div>
        <span>Hash mới nhất</span>
        <strong className="hash-text">
          {auditIntegrityReport.latestHash ?? "Chưa có"}
        </strong>
      </div>
      {auditIntegrityReport.verified ? null : (
        <p>
          Điểm cần kiểm tra:{" "}
          {auditIntegrityReport.brokenAtEventId ?? "không xác định"} ·{" "}
          {formatAuditIntegrityReason(auditIntegrityReport.brokenReason)}
        </p>
      )}
    </div>
  );
}
