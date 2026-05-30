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
        eyebrow="Document Center"
        title="Trung tâm tài liệu bệnh án"
        description="Tổ chức tài liệu theo danh mục gần với OpenEMR: CCR/CCDA, hồ sơ bệnh án, xét nghiệm, thông tin bệnh nhân và tài liệu FHIR export."
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
