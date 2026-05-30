import { FhirPanel } from "../../components/AppShell.js";
import {
  formatAuditAction,
  formatAuditIntegrityReason,
  formatAuditIntegrityStatus,
  formatAuditMetadataSummary,
  formatAuditResourceType
} from "../../lib/auditFormatters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { AuditEvent, AuditIntegrityReport } from "../../types/clinical.js";

type GlobalAuditPanelProps = {
  readonly auditEvents: readonly AuditEvent[];
  readonly canReadAudit: boolean;
  readonly isLoading: boolean;
  readonly onReload: () => void;
};

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

export function GlobalAuditPanel({
  auditEvents,
  canReadAudit,
  isLoading,
  onReload
}: GlobalAuditPanelProps) {
  const loginEventCount = auditEvents.filter((event) =>
    event.action.startsWith("auth.login.")
  ).length;
  const deniedEventCount = auditEvents.filter(
    (event) => event.action === "access.denied"
  ).length;
  const latestEvent = auditEvents[0];

  return (
    <article className="panel audit-panel global-audit-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Vận hành bảo mật</p>
          <h2>Nhật ký bảo mật toàn hệ thống</h2>
          <p className="panel-note">
            Theo dõi đăng nhập, truy cập bị chặn và các bản ghi kiểm toán không
            gắn trực tiếp với một bệnh nhân cụ thể.
          </p>
        </div>
        <div className="panel-actions">
          <button
            className="ghost-button"
            type="button"
            disabled={isLoading || !canReadAudit}
            onClick={onReload}
          >
            {isLoading
              ? "Đang tải..."
              : canReadAudit
                ? "Tải nhật ký toàn hệ thống"
                : "Cần quyền kiểm toán"}
          </button>
        </div>
      </div>

      <div className="security-audit-summary">
        <div>
          <span>Tổng bản ghi</span>
          <strong>{auditEvents.length}</strong>
        </div>
        <div>
          <span>Đăng nhập</span>
          <strong>{loginEventCount}</strong>
        </div>
        <div>
          <span>Bị chặn</span>
          <strong>{deniedEventCount}</strong>
        </div>
        <div>
          <span>Mới nhất</span>
          <strong>
            {latestEvent ? formatDateTime(latestEvent.occurredAt) : "Chưa có"}
          </strong>
        </div>
      </div>

      <div className="audit-list">
        {auditEvents.slice(0, 12).map((event) => (
          <div
            className="audit-item audit-item--global"
            key={event.id ?? `${event.occurredAt}:${event.action}`}
          >
            <div>
              <span>{formatDateTime(event.occurredAt)}</span>
              <strong>{formatAuditAction(event.action)}</strong>
            </div>
            <div>
              <span>Tác nhân</span>
              <strong>{event.actorId}</strong>
            </div>
            <div>
              <span>Tài nguyên</span>
              <strong>
                {formatAuditResourceType(event.resourceType)} · {event.resourceId}
              </strong>
            </div>
            <div>
              <span>Phạm vi</span>
              <strong>
                {event.patientId
                  ? `Bệnh nhân ${event.patientId}`
                  : "Toàn hệ thống"}
              </strong>
            </div>
            <div>
              <span>Chi tiết</span>
              <strong>{formatAuditMetadataSummary(event)}</strong>
            </div>
          </div>
        ))}
        {auditEvents.length === 0 ? (
          <p className="empty-state">
            {canReadAudit
              ? "Chưa có bản ghi kiểm toán toàn hệ thống. Hãy đăng nhập lại, thử truy cập bị chặn hoặc tải nhật ký theo bệnh nhân để phát sinh log."
              : "Nhật ký bảo mật toàn hệ thống chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
          </p>
        ) : null}
      </div>
    </article>
  );
}

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
            <p className="eyebrow">Security trace</p>
            <h2>Nhật ký kiểm toán</h2>
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
                  ? "Tải audit"
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
              {isExportingAuditFhir ? "Đang xuất..." : "Xuất FHIR AuditEvent"}
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
                <span>Actor</span>
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
                ? "Chưa có audit event cho bệnh nhân đang chọn. Hãy xem FHIR, mở lượt khám hoặc ký tài liệu để phát sinh log."
                : "Nhật ký kiểm toán chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
            </p>
          ) : null}
        </div>
      </article>
      <FhirPanel
        title="FHIR AuditEvent Bundle JSON"
        badge="AuditEvent"
        value={auditFhirBundlePreview}
      />
    </>
  );
}
