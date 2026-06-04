import {
  formatAuditAction,
  formatAuditResourceType
} from "../../lib/auditFormatters.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { AuditEvent } from "../../types/audit.js";

type PatientAuditEventListProps = {
  readonly auditEvents: readonly AuditEvent[];
  readonly canReadAudit: boolean;
};

export function PatientAuditEventList({
  auditEvents,
  canReadAudit
}: PatientAuditEventListProps) {
  return (
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
              {formatAuditResourceType(event.resourceType)} · {event.resourceId}
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
  );
}
