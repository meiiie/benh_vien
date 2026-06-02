import type { ReactNode } from "react";
import { FhirPanel, PageHeader } from "../components/AppShell.js";

type DocumentsPageProps = {
  readonly documentFhirPreview: unknown;
  readonly documentPanel: ReactNode;
  readonly documentProvenanceFhirPreview: unknown;
  readonly patientListPanel: ReactNode;
};

export function DocumentsPage({
  documentFhirPreview,
  documentPanel,
  documentProvenanceFhirPreview,
  patientListPanel
}: DocumentsPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Trung tâm tài liệu"
        title="Trung tâm tài liệu bệnh án"
        description="Quản lý tài liệu bệnh án theo hướng EMR: có siêu dữ liệu, trạng thái ký/xác thực, dấu vết tạo lập và bản xem trước FHIR để phục vụ liên thông."
      />

      <section className="document-brief" aria-label="Phạm vi quản lý tài liệu bệnh án">
        <article>
          <span>Nguồn tài liệu: </span>
          <p>Phân loại theo hồ sơ bệnh án, xét nghiệm, thông tin bệnh nhân và tài liệu trao đổi.</p>
        </article>
        <article>
          <span>DocumentReference: </span>
          <p>Mô tả loại tài liệu, định dạng tệp, dung lượng, mã băm và vị trí lưu trữ.</p>
        </article>
        <article>
          <span>Provenance: </span>
          <p>Ghi nhận người tạo, thời điểm, thao tác ký và nguồn gốc phục vụ kiểm toán.</p>
        </article>
      </section>

      <section className="workspace">
        {patientListPanel}
        {documentPanel}
        <FhirPanel title="FHIR DocumentReference JSON" badge="DocumentReference" value={documentFhirPreview} />
        <FhirPanel title="FHIR Provenance JSON" badge="Provenance" value={documentProvenanceFhirPreview} />
      </section>
    </div>
  );
}
