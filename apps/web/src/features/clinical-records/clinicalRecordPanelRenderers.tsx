import { AllergyIntolerancePanel } from "./AllergyIntolerancePanel.js";
import { ConditionPanel } from "./ConditionPanel.js";
import { DiagnosticReportPanel } from "./DiagnosticReportPanel.js";
import { EncounterPanel } from "./EncounterPanel.js";
import { ImagingStudyPanel } from "./ImagingStudyPanel.js";
import { MedicationAdministrationPanel } from "./MedicationAdministrationPanel.js";
import { MedicationDispensePanel } from "./MedicationDispensePanel.js";
import { MedicationRequestPanel } from "./MedicationRequestPanel.js";
import { ObservationPanel } from "./ObservationPanel.js";
import { ProcedurePanel } from "./ProcedurePanel.js";
import { ServiceRequestPanel } from "./ServiceRequestPanel.js";
import { WorkflowTaskPanel } from "./WorkflowTaskPanel.js";
import type {
  BuildClinicalRecordPanelRenderersOptions,
  ClinicalRecordPanelRenderers
} from "./clinicalRecordPanelRendererTypes.js";

export type { ClinicalRecordPanelRenderers } from "./clinicalRecordPanelRendererTypes.js";

export function buildClinicalRecordPanelRenderers({
  collections,
  forms,
  handlers,
  isFinishingEncounter,
  isWriteDisabled,
  loading,
  selectedIds,
  selections,
  submitting
}: BuildClinicalRecordPanelRenderersOptions): ClinicalRecordPanelRenderers {
  return {
    allergyIntolerance: () => (
      <AllergyIntolerancePanel
        allergyIntolerances={collections.allergyIntolerances}
        encounters={collections.encounters}
        form={forms.allergyIntolerance}
        isLoading={loading.allergyIntolerances}
        isSubmitting={submitting.allergyIntolerance}
        isWriteDisabled={isWriteDisabled}
        selectedAllergyIntolerance={selections.selectedAllergyIntolerance}
        selectedAllergyIntoleranceId={selectedIds.allergyIntolerance}
        onCreateAllergyIntolerance={handlers.onCreateAllergyIntolerance}
        onFormChange={handlers.onAllergyIntoleranceFormChange}
        onSelectAllergyIntolerance={handlers.onSelectAllergyIntolerance}
      />
    ),
    condition: () => (
      <ConditionPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.condition}
        isLoading={loading.conditions}
        isSubmitting={submitting.condition}
        isWriteDisabled={isWriteDisabled}
        selectedCondition={selections.selectedCondition}
        selectedConditionId={selectedIds.condition}
        onCreateCondition={handlers.onCreateCondition}
        onFormChange={handlers.onConditionFormChange}
        onSelectCondition={handlers.onSelectCondition}
      />
    ),
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
    encounter: () => (
      <EncounterPanel
        encounters={collections.encounters}
        form={forms.encounter}
        isFinishing={isFinishingEncounter}
        isLoading={loading.encounters}
        isSubmitting={submitting.encounter}
        isWriteDisabled={isWriteDisabled}
        selectedEncounter={selections.selectedEncounter}
        selectedEncounterCounts={selections.selectedEncounterCounts}
        selectedEncounterId={selectedIds.encounter}
        onCreateEncounter={handlers.onCreateEncounter}
        onFinishEncounter={handlers.onFinishEncounter}
        onFormChange={handlers.onEncounterFormChange}
        onSelectEncounter={handlers.onSelectEncounter}
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
    medicationAdministration: () => (
      <MedicationAdministrationPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.medicationAdministration}
        isLoading={loading.medicationAdministrations}
        isSubmitting={submitting.medicationAdministration}
        isWriteDisabled={isWriteDisabled}
        medicationAdministrations={collections.medicationAdministrations}
        medicationRequests={collections.medicationRequests}
        selectedMedicationAdministration={selections.selectedMedicationAdministration}
        selectedMedicationAdministrationId={selectedIds.medicationAdministration}
        onCreateMedicationAdministration={handlers.onCreateMedicationAdministration}
        onFormChange={handlers.onMedicationAdministrationFormChange}
        onSelectMedicationAdministration={handlers.onSelectMedicationAdministration}
      />
    ),
    medicationDispense: () => (
      <MedicationDispensePanel
        encounters={collections.encounters}
        form={forms.medicationDispense}
        isLoading={loading.medicationDispenses}
        isSubmitting={submitting.medicationDispense}
        isWriteDisabled={isWriteDisabled}
        medicationDispenses={collections.medicationDispenses}
        medicationRequests={collections.medicationRequests}
        selectedMedicationDispense={selections.selectedMedicationDispense}
        selectedMedicationDispenseId={selectedIds.medicationDispense}
        onCreateMedicationDispense={handlers.onCreateMedicationDispense}
        onFormChange={handlers.onMedicationDispenseFormChange}
        onSelectMedicationDispense={handlers.onSelectMedicationDispense}
      />
    ),
    medicationRequest: () => (
      <MedicationRequestPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.medicationRequest}
        isLoading={loading.medicationRequests}
        isSubmitting={submitting.medicationRequest}
        isWriteDisabled={isWriteDisabled}
        medicationRequests={collections.medicationRequests}
        selectedMedicationRequest={selections.selectedMedicationRequest}
        selectedMedicationRequestId={selectedIds.medicationRequest}
        onCreateMedicationRequest={handlers.onCreateMedicationRequest}
        onFormChange={handlers.onMedicationRequestFormChange}
        onSelectMedicationRequest={handlers.onSelectMedicationRequest}
      />
    ),
    observation: () => (
      <ObservationPanel
        encounters={collections.encounters}
        form={forms.observation}
        isLoading={loading.observations}
        isSubmitting={submitting.observation}
        isWriteDisabled={isWriteDisabled}
        observations={collections.observations}
        selectedObservation={selections.selectedObservation}
        selectedObservationId={selectedIds.observation}
        onCreateObservation={handlers.onCreateObservation}
        onFormChange={handlers.onObservationFormChange}
        onSelectObservation={handlers.onSelectObservation}
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
