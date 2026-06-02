import { FhirPanel } from "../../components/AppShell.js";
import {
  formatAuditAction,
  formatAuditIntegrityReason,
  formatAuditIntegrityStatus,
  formatAuditResourceType
} from "../../lib/auditFormatters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { AuditEvent, AuditIntegrityReport } from "../../types/audit.js";

type PatientAuditPanelProps = {
  readonly auditEvents: readonly AuditEvent[];
  readonly auditFhirBundlePreview: unknown;
  readonly auditIntegrityReport?: AuditIntegrityReport;
  readonly canReadAudit: boolean;
  readonly hasSelectedPatient: boolean;
  readonly isExportingAuditFhir: boolean;
  readonly isLoadingAuditEvents: boolean;
  readonly isVerifyingAuditIntegrity: boolean;
  readonly onExportAuditFhir: () => void;
  readonly onLoadAuditEvents: () => void;
  readonly onVerifyAuditIntegrity: () => void;
};

export function PatientAuditPanel({
  auditEvents,
  auditFhirBundlePreview,
  auditIntegrityReport,
  canReadAudit,
  hasSelectedPatient,
  isExportingAuditFhir,
  isLoadingAuditEvents,
  isVerifyingAuditIntegrity,
  onExportAuditFhir,
  onLoadAuditEvents,
  onVerifyAuditIntegrity
}: PatientAuditPanelProps) {
  return (
    <>
      <article className="panel audit-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Dấu vết theo bệnh nhân</p>
            <h2>Nhật ký kiểm toán</h2>
            <p className="panel-note">
              Theo dõi các sự kiện gắn trực tiếp với hồ sơ đang chọn: ai truy
              cập, vì mục đích gì, tác động lên tài nguyên nào và log đã được
              niêm phong hay chưa.
            </p>
          </div>
          <div className="panel-actions">
            <button
              className="ghost-button"
              type="button"
              disabled={!hasSelectedPatient || isLoadingAuditEvents || !canReadAudit}
              onClick={onLoadAuditEvents}
            >
              {isLoadingAuditEvents
                ? "Đang tải..."
                : canReadAudit
                  ? "Tải nhật ký"
                  : "Cần quyền kiểm toán"}
            </button>
            <button
              className="ghost-button"
              type="button"
              disabled={
                !hasSelectedPatient || isVerifyingAuditIntegrity || !canReadAudit
              }
              onClick={onVerifyAuditIntegrity}
            >
              {isVerifyingAuditIntegrity
                ? "Đang xác minh..."
                : "Kiểm tra toàn vẹn"}
            </button>
            <button
              className="ghost-button"
              type="button"
              disabled={!hasSelectedPatient || isExportingAuditFhir || !canReadAudit}
              onClick={onExportAuditFhir}
            >
              {isExportingAuditFhir ? "Đang xuất..." : "Xuất FHIR AuditEvent Bundle"}
            </button>
          </div>
        </div>

        {auditIntegrityReport ? (
          <div className={`integrity-card integrity-card--${auditIntegrityReport.status}`}>
            <div>
              <span>Trạng thái chuỗi băm</span>
              <strong>{formatAuditIntegrityStatus(auditIntegrityReport.status)}</strong>
            </div>
            <div>
              <span>Số bản ghi đã kiểm</span>
              <strong>
                {auditIntegrityReport.sealedEvents}/
                {auditIntegrityReport.totalEvents}
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
        ) : null}

        <div className="audit-list">
          {auditEvents.map((event) => (
            <div
              className="audit-item"
              key={event.id ?? `${event.occurredAt}:${event.action}`}
            >
              <div>
                <span>{formatDateTime(event.occurredAt)}</span>
                <strong>{formatAuditAction(event.action)}</strong>
              </div>
              <div>
                <span>Tác nhân (actor)</span>
                <strong>{event.actorId}</strong>
              </div>
              <div>
                <span>Tài nguyên</span>
                <strong>
                  {formatAuditResourceType(event.resourceType)} ·{" "}
                  {event.resourceId}
                </strong>
              </div>
              <div>
                <span>Mục đích</span>
                <strong>
                  {event.purposeOfUse ?? "Chưa khai báo"}
                  {typeof event.metadata.actorRole === "string"
                    ? ` · ${event.metadata.actorRole}`
                    : ""}
                </strong>
              </div>
              <div>
                <span>Toàn vẹn</span>
                <strong>
                  {event.integrityHash ? "Đã niêm phong" : "Chưa niêm phong"}
                </strong>
              </div>
            </div>
          ))}
          {auditEvents.length === 0 ? (
            <p className="empty-state">
              {canReadAudit
                ? "Chưa có bản ghi kiểm toán cho bệnh nhân đang chọn. Hãy xem FHIR, mở lượt khám hoặc ký tài liệu để phát sinh log."
                : "Nhật ký kiểm toán chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
            </p>
          ) : null}
        </div>
      </article>
      <FhirPanel
        title="Gói nhật ký kiểm toán dưới dạng FHIR AuditEvent Bundle"
        badge="AuditEvent"
        value={auditFhirBundlePreview}
      />
    </>
  );
}
