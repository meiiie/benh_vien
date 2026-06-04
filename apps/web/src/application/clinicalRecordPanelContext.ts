import { buildClinicalRecordPanelRenderers } from "../features/clinical-records/clinicalRecordPanelRenderers.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { buildAppWorkspaceContext } from "./appDerivedContext.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type AppWorkspaceContext = ReturnType<typeof buildAppWorkspaceContext>;
type ClinicalRecordPanelOptions = Parameters<typeof buildClinicalRecordPanelRenderers>[0];

type BuildClinicalRecordPanelsInput = {
  readonly clinicalRecordState: ClinicalRecordState;
  readonly handlers: ClinicalRecordPanelOptions["handlers"];
  readonly isWriteDisabled: boolean;
  readonly patientWorkspaceCollections: AppWorkspaceContext["patientWorkspaceCollections"];
  readonly workspaceSelection: AppWorkspaceContext["workspaceSelection"];
};

export function buildClinicalRecordPanels({
  clinicalRecordState,
  handlers,
  isWriteDisabled,
  patientWorkspaceCollections,
  workspaceSelection
}: BuildClinicalRecordPanelsInput) {
  return buildClinicalRecordPanelRenderers({
    collections: patientWorkspaceCollections,
    forms: {
      allergyIntolerance: clinicalRecordState.allergyIntoleranceForm,
      condition: clinicalRecordState.conditionForm,
      diagnosticReport: clinicalRecordState.diagnosticReportForm,
      encounter: clinicalRecordState.encounterForm,
      imagingStudy: clinicalRecordState.imagingStudyForm,
      medicationAdministration:
        clinicalRecordState.medicationAdministrationForm,
      medicationDispense: clinicalRecordState.medicationDispenseForm,
      medicationRequest: clinicalRecordState.medicationRequestForm,
      observation: clinicalRecordState.observationForm,
      procedure: clinicalRecordState.procedureForm,
      serviceRequest: clinicalRecordState.serviceRequestForm
    },
    handlers,
    isFinishingEncounter: clinicalRecordState.isFinishingEncounter,
    isWriteDisabled,
    loading: {
      allergyIntolerances: clinicalRecordState.isLoadingAllergyIntolerances,
      conditions: clinicalRecordState.isLoadingConditions,
      diagnosticReports: clinicalRecordState.isLoadingDiagnosticReports,
      encounters: clinicalRecordState.isLoadingEncounters,
      imagingStudies: clinicalRecordState.isLoadingImagingStudies,
      medicationAdministrations:
        clinicalRecordState.isLoadingMedicationAdministrations,
      medicationDispenses: clinicalRecordState.isLoadingMedicationDispenses,
      medicationRequests: clinicalRecordState.isLoadingMedicationRequests,
      observations: clinicalRecordState.isLoadingObservations,
      procedures: clinicalRecordState.isLoadingProcedures,
      serviceRequests: clinicalRecordState.isLoadingServiceRequests,
      workflowTasks: clinicalRecordState.isLoadingWorkflowTasks
    },
    selectedIds: {
      allergyIntolerance: clinicalRecordState.selectedAllergyIntoleranceId,
      condition: clinicalRecordState.selectedConditionId,
      diagnosticReport: clinicalRecordState.selectedDiagnosticReportId,
      encounter: clinicalRecordState.selectedEncounterId,
      imagingStudy: clinicalRecordState.selectedImagingStudyId,
      medicationAdministration:
        clinicalRecordState.selectedMedicationAdministrationId,
      medicationDispense: clinicalRecordState.selectedMedicationDispenseId,
      medicationRequest: clinicalRecordState.selectedMedicationRequestId,
      observation: clinicalRecordState.selectedObservationId,
      procedure: clinicalRecordState.selectedProcedureId,
      serviceRequest: clinicalRecordState.selectedServiceRequestId,
      workflowTask: clinicalRecordState.selectedWorkflowTaskId
    },
    selections: {
      selectedAllergyIntolerance: workspaceSelection.selectedAllergyIntolerance,
      selectedCondition: workspaceSelection.selectedCondition,
      selectedDiagnosticReport: workspaceSelection.selectedDiagnosticReport,
      selectedEncounter: workspaceSelection.selectedEncounter,
      selectedEncounterCounts: workspaceSelection.selectedEncounterCounts,
      selectedImagingStudy: workspaceSelection.selectedImagingStudy,
      selectedMedicationAdministration:
        workspaceSelection.selectedMedicationAdministration,
      selectedMedicationDispense: workspaceSelection.selectedMedicationDispense,
      selectedMedicationRequest: workspaceSelection.selectedMedicationRequest,
      selectedObservation: workspaceSelection.selectedObservation,
      selectedProcedure: workspaceSelection.selectedProcedure,
      selectedServiceRequest: workspaceSelection.selectedServiceRequest,
      selectedWorkflowTask: workspaceSelection.selectedWorkflowTask
    },
    submitting: {
      allergyIntolerance: clinicalRecordState.isSubmittingAllergyIntolerance,
      condition: clinicalRecordState.isSubmittingCondition,
      diagnosticReport: clinicalRecordState.isSubmittingDiagnosticReport,
      encounter: clinicalRecordState.isSubmittingEncounter,
      imagingStudy: clinicalRecordState.isSubmittingImagingStudy,
      medicationAdministration:
        clinicalRecordState.isSubmittingMedicationAdministration,
      medicationDispense: clinicalRecordState.isSubmittingMedicationDispense,
      medicationRequest: clinicalRecordState.isSubmittingMedicationRequest,
      observation: clinicalRecordState.isSubmittingObservation,
      procedure: clinicalRecordState.isSubmittingProcedure,
      serviceRequest: clinicalRecordState.isSubmittingServiceRequest
    }
  });
}
