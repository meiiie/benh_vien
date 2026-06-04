import {
  formatAuditAction,
  formatAuditMetadataSummary,
  formatAuditResourceType
} from "../../lib/auditFormatters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { AuditEvent } from "../../types/audit.js";

type GlobalAuditPanelProps = {
  readonly auditEvents: readonly AuditEvent[];
  readonly canReadAudit: boolean;
  readonly isLoading: boolean;
  readonly onReload: () => void;
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
