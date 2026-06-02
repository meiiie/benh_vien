import type { ReactNode } from "react";
import { PageBrief, PageHeader } from "../components/AppShell.js";

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

const workspaceBriefItems = [
  {
    label: "Định danh bệnh nhân: ",
    note: "Quản lý hồ sơ, mã định danh, trạng thái hợp nhất và cơ sở quản lý."
  },
  {
    label: "Lượt khám: ",
    note: "Gắn dị ứng, chẩn đoán, chỉ định, thủ thuật, kết quả và hình ảnh theo từng đợt điều trị."
  },
  {
    label: "Thuốc và tài liệu: ",
    note: "Theo dõi kê đơn, cấp phát, dùng thuốc thực tế và tài liệu bệnh án liên quan."
  }
] as const;

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

      <PageBrief
        ariaLabel="Phạm vi thao tác trong bàn làm việc bệnh nhân"
        className="workspace-brief"
        items={workspaceBriefItems}
      />

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
