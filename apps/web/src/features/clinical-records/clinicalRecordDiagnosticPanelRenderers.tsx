import { DiagnosticReportPanel } from "./DiagnosticReportPanel.js";
import { ImagingStudyPanel } from "./ImagingStudyPanel.js";
import { ProcedurePanel } from "./ProcedurePanel.js";
import { ServiceRequestPanel } from "./ServiceRequestPanel.js";
import { WorkflowTaskPanel } from "./WorkflowTaskPanel.js";
import type {
  BuildClinicalRecordPanelRenderersOptions,
  ClinicalRecordPanelRenderers
} from "./clinicalRecordPanelRendererTypes.js";

type ClinicalRecordDiagnosticPanelRenderers = Pick<
  ClinicalRecordPanelRenderers,
  "diagnosticReport" | "imagingStudy" | "procedure" | "serviceRequest" | "workflowTask"
>;

export function buildClinicalRecordDiagnosticPanelRenderers({
  collections,
  forms,
  handlers,
  isWriteDisabled,
  loading,
  selectedIds,
  selections,
  submitting
}: BuildClinicalRecordPanelRenderersOptions): ClinicalRecordDiagnosticPanelRenderers {
  return {
    diagnosticReport: () => (
      <DiagnosticReportPanel
        diagnosticReports={collections.diagnosticReports}
        encounters={collections.encounters}
        form={forms.diagnosticReport}
        isLoading={loading.diagnosticReports}
        isSubmitting={submitting.diagnosticReport}
        isWriteDisabled={isWriteDisabled}
        observations={collections.observations}
        selectedDiagnosticReport={selections.selectedDiagnosticReport}
        selectedDiagnosticReportId={selectedIds.diagnosticReport}
        serviceRequests={collections.serviceRequests}
        onCreateDiagnosticReport={handlers.onCreateDiagnosticReport}
        onFormChange={handlers.onDiagnosticReportFormChange}
        onSelectDiagnosticReport={handlers.onSelectDiagnosticReport}
      />
    ),
    imagingStudy: () => (
      <ImagingStudyPanel
        diagnosticReports={collections.diagnosticReports}
        encounters={collections.encounters}
        form={forms.imagingStudy}
        imagingStudies={collections.imagingStudies}
        isLoading={loading.imagingStudies}
        isSubmitting={submitting.imagingStudy}
        isWriteDisabled={isWriteDisabled}
        selectedImagingStudy={selections.selectedImagingStudy}
        selectedImagingStudyId={selectedIds.imagingStudy}
        serviceRequests={collections.serviceRequests}
        onCreateImagingStudy={handlers.onCreateImagingStudy}
        onFormChange={handlers.onImagingStudyFormChange}
        onSelectImagingStudy={handlers.onSelectImagingStudy}
      />
    ),
    procedure: () => (
      <ProcedurePanel
        conditions={collections.conditions}
        diagnosticReports={collections.diagnosticReports}
        encounters={collections.encounters}
        form={forms.procedure}
        isLoading={loading.procedures}
        isSubmitting={submitting.procedure}
        isWriteDisabled={isWriteDisabled}
        procedures={collections.procedures}
        selectedProcedure={selections.selectedProcedure}
        selectedProcedureId={selectedIds.procedure}
        serviceRequests={collections.serviceRequests}
        onCreateProcedure={handlers.onCreateProcedure}
        onFormChange={handlers.onProcedureFormChange}
        onSelectProcedure={handlers.onSelectProcedure}
      />
    ),
    serviceRequest: () => (
      <ServiceRequestPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.serviceRequest}
        isLoading={loading.serviceRequests}
        isSubmitting={submitting.serviceRequest}
        isWriteDisabled={isWriteDisabled}
        selectedServiceRequest={selections.selectedServiceRequest}
        selectedServiceRequestId={selectedIds.serviceRequest}
        serviceRequests={collections.serviceRequests}
        onCreateServiceRequest={handlers.onCreateServiceRequest}
        onFormChange={handlers.onServiceRequestFormChange}
        onSelectServiceRequest={handlers.onSelectServiceRequest}
      />
    ),
    workflowTask: () => (
      <WorkflowTaskPanel
        isLoading={loading.workflowTasks}
        selectedWorkflowTask={selections.selectedWorkflowTask}
        selectedWorkflowTaskId={selectedIds.workflowTask}
        workflowTasks={collections.workflowTasks}
        onSelectWorkflowTask={handlers.onSelectWorkflowTask}
      />
    )
  };
}
