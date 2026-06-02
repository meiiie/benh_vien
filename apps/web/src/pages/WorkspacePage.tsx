import type { ReactNode } from "react";
import { PageHeader } from "../components/AppShell.js";

type WorkspacePageProps = {
  readonly allergyIntolerancePanel: ReactNode;
  readonly conditionPanel: ReactNode;
  readonly createPatientPanel: ReactNode;
  readonly diagnosticReportPanel: ReactNode;
  readonly encounterPanel: ReactNode;
  readonly imagingStudyPanel: ReactNode;
  readonly medicationAdministrationPanel: ReactNode;
  readonly medicationDispensePanel: ReactNode;
  readonly medicationRequestPanel: ReactNode;
  readonly observationPanel: ReactNode;
  readonly patientDetailPanel: ReactNode;
  readonly patientListPanel: ReactNode;
  readonly patientMergePanel?: ReactNode;
  readonly procedurePanel: ReactNode;
  readonly serviceRequestPanel: ReactNode;
  readonly workflowTaskPanel: ReactNode;
};

export function WorkspacePage({
  allergyIntolerancePanel,
  conditionPanel,
  createPatientPanel,
  diagnosticReportPanel,
  encounterPanel,
  imagingStudyPanel,
  medicationAdministrationPanel,
  medicationDispensePanel,
  medicationRequestPanel,
  observationPanel,
  patientDetailPanel,
  patientListPanel,
  patientMergePanel,
  procedurePanel,
  serviceRequestPanel,
  workflowTaskPanel
}: WorkspacePageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Không gian hồ sơ bệnh nhân"
        title="Bàn làm việc bệnh nhân"
        description="Luồng chính mô phỏng EMR thật: chọn đúng hồ sơ bệnh nhân, mở lượt khám, ghi nhận dữ liệu lâm sàng và gắn tài liệu bệnh án theo bối cảnh điều trị."
      />

      <section className="workspace-brief" aria-label="Phạm vi thao tác trong bàn làm việc bệnh nhân">
        <article>
          <span>Định danh bệnh nhân: </span>
          <p>Quản lý hồ sơ, mã định danh, trạng thái hợp nhất và cơ sở quản lý.</p>
        </article>
        <article>
          <span>Lượt khám: </span>
          <p>Gắn dị ứng, chẩn đoán, chỉ định, thủ thuật, kết quả và hình ảnh theo từng đợt điều trị.</p>
        </article>
        <article>
          <span>Thuốc và tài liệu: </span>
          <p>Theo dõi kê đơn, cấp phát, dùng thuốc thực tế và tài liệu bệnh án liên quan.</p>
        </article>
      </section>

      <section className="workspace">
        {patientListPanel}
        {patientDetailPanel}
        {patientMergePanel ?? null}
        {encounterPanel}
        {allergyIntolerancePanel}
        {conditionPanel}
        {serviceRequestPanel}
        {workflowTaskPanel}
        {procedurePanel}
        {observationPanel}
        {diagnosticReportPanel}
        {imagingStudyPanel}
        {medicationRequestPanel}
        {medicationDispensePanel}
        {medicationAdministrationPanel}
        {createPatientPanel}
      </section>
    </div>
  );
}
