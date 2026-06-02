import type { ReactNode } from "react";
import { FhirPanel, PageBrief, PageHeader } from "../components/AppShell.js";

type DocumentsPageProps = {
  readonly documentFhirPreview: unknown;
  readonly documentPanel: ReactNode;
  readonly documentProvenanceFhirPreview: unknown;
  readonly patientListPanel: ReactNode;
};

const documentBriefItems = [
  {
    label: "Nguồn tài liệu: ",
    note: "Phân loại theo hồ sơ bệnh án, xét nghiệm, thông tin bệnh nhân và tài liệu trao đổi."
  },
  {
    label: "DocumentReference: ",
    note: "Mô tả loại tài liệu, định dạng tệp, dung lượng, mã băm và vị trí lưu trữ."
  },
  {
    label: "Provenance: ",
    note: "Ghi nhận người tạo, thời điểm, thao tác ký và nguồn gốc phục vụ kiểm toán."
  }
] as const;

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

      <PageBrief
        ariaLabel="Phạm vi quản lý tài liệu bệnh án"
        className="document-brief"
        items={documentBriefItems}
      />

      <section className="workspace">
        {patientListPanel}
        {documentPanel}
        <FhirPanel title="FHIR DocumentReference JSON" badge="DocumentReference" value={documentFhirPreview} />
        <FhirPanel title="FHIR Provenance JSON" badge="Provenance" value={documentProvenanceFhirPreview} />
      </section>
    </div>
  );
}
