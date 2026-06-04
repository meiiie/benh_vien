import { WorkspacePage } from "./WorkspacePage.js";
import type { AppRouteRendererProps } from "./AppRouteRendererTypes.js";

type WorkspaceRouteRendererProps = Pick<
  AppRouteRendererProps,
  "canMergePatients" | "panels"
>;

export function WorkspaceRouteRenderer({
  canMergePatients,
  panels
}: WorkspaceRouteRendererProps) {
  return (
    <WorkspacePage
      allergyIntolerancePanel={panels.allergyIntolerance()}
      conditionPanel={panels.condition()}
      createPatientPanel={panels.createPatient()}
      diagnosticReportPanel={panels.diagnosticReport()}
      encounterPanel={panels.encounter()}
      imagingStudyPanel={panels.imagingStudy()}
      medicationAdministrationPanel={panels.medicationAdministration()}
      medicationDispensePanel={panels.medicationDispense()}
      medicationRequestPanel={panels.medicationRequest()}
      observationPanel={panels.observation()}
      patientDetailPanel={panels.patientDetail()}
      patientListPanel={panels.patientList()}
      patientMergePanel={canMergePatients ? panels.patientMerge() : undefined}
      procedurePanel={panels.procedure()}
      serviceRequestPanel={panels.serviceRequest()}
      workflowTaskPanel={panels.workflowTask()}
    />
  );
}
