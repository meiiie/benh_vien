import type { ReactNode } from "react";
import { PageHeader } from "../components/AppShell.js";

type AuditLogPageProps = {
  readonly auditPanel: ReactNode;
  readonly globalAuditPanel: ReactNode;
};

export function AuditLogPage({ auditPanel, globalAuditPanel }: AuditLogPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Audit"
        title="Nhật ký truy cập và kiểm toán"
        description="Mỗi lần xem FHIR, mở lượt khám, tạo/ký tài liệu đều được ghi log với actor, mục đích sử dụng và tài nguyên liên quan."
      />

      <section className="workspace">
        {globalAuditPanel}
        {auditPanel}
        <article className="panel">
          <p className="eyebrow">Policy note</p>
          <h2>Ranh giới demo</h2>
          <ul className="milestone-list">
            <li>Giao diện đã dùng phiên Bearer token nội bộ, chưa phải IAM/SSO bệnh viện thật.</li>
            <li>API chặn quyền cơ bản: điều trị thao tác hồ sơ, kiểm toán xem nhật ký, quản trị có quyền giám sát.</li>
            <li>Khi lên sản phẩm thật cần thêm SSO/MFA, đồng ý chia sẻ (consent), chữ ký số và log bất biến.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
