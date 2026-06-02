import type { ReactNode } from "react";
import { PageHeader } from "../components/AppShell.js";

type AuditLogPageProps = {
  readonly auditPanel: ReactNode;
  readonly globalAuditPanel: ReactNode;
};

const auditBriefItems = [
  {
    label: "Ai truy cập?",
    note: "Ghi tác nhân (actor), vai trò, thời điểm, hành động và mục đích sử dụng dữ liệu bệnh án."
  },
  {
    label: "Truy cập tài nguyên nào?",
    note: "Gắn sự kiện với bệnh nhân, tài liệu, lượt khám hoặc tài nguyên FHIR liên quan để phục vụ truy vết."
  },
  {
    label: "Log có toàn vẹn không?",
    note: "Chuỗi băm giúp phát hiện bản ghi chưa niêm phong, bị sửa hoặc bị đứt liên kết kiểm toán."
  }
] as const;

export function AuditLogPage({ auditPanel, globalAuditPanel }: AuditLogPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Kiểm toán truy cập dữ liệu"
        title="Nhật ký truy cập và kiểm toán"
        description="Mỗi lần xem FHIR, mở lượt khám, tạo/ký tài liệu hoặc xuất hồ sơ liên viện đều phải để lại dấu vết: tác nhân, mục đích sử dụng, tài nguyên liên quan và trạng thái toàn vẹn."
      />

      <section className="audit-brief" aria-label="Các câu hỏi kiểm toán cần trả lời">
        {auditBriefItems.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <p>{item.note}</p>
          </article>
        ))}
      </section>

      <section className="workspace">
        {globalAuditPanel}
        {auditPanel}
        <article className="panel">
          <p className="eyebrow">Phạm vi triển khai</p>
          <h2>Ranh giới của nguyên mẫu hiện tại</h2>
          <ul className="milestone-list">
            <li>Phiên hiện dùng Bearer token nội bộ cho demo; sản phẩm thật cần SSO/MFA và vòng đời phiên theo chính sách bệnh viện.</li>
            <li>Quyền truy cập tách theo vai trò và mục đích sử dụng: điều trị thao tác hồ sơ, kiểm toán xem nhật ký, quản trị giám sát vận hành.</li>
            <li>Khi triển khai thật cần bổ sung chữ ký số, chính sách lưu trữ log bất biến, giám sát SIEM/SOC và quy trình phản ứng sự cố.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
