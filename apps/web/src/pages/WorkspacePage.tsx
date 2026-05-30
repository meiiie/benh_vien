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
        eyebrow="Patient Workspace"
        title="Bàn làm việc bệnh nhân"
        description="Luồng chính mô phỏng EMR thật: chọn bệnh nhân, mở lượt khám, gắn tài liệu và theo dõi hồ sơ."
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
