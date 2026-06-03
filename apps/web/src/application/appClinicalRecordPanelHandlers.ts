import type { ClinicalRecordPanelHandlers } from "../features/clinical-records/clinicalRecordPanelRendererCommandTypes.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { buildAppClinicalRecordHandlers } from "./appClinicalRecordHandlers.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type ClinicalRecordCommandHandlers =
  ReturnType<typeof buildAppClinicalRecordHandlers>;

type BuildAppClinicalRecordPanelHandlersInput = {
  readonly clinicalRecordHandlers: ClinicalRecordCommandHandlers;
  readonly clinicalRecordState: ClinicalRecordState;
};

export function buildAppClinicalRecordPanelHandlers({
  clinicalRecordHandlers,
  clinicalRecordState
}: BuildAppClinicalRecordPanelHandlersInput): ClinicalRecordPanelHandlers {
  const {
    handleCreateAllergyIntolerance,
    handleCreateCondition,
    handleCreateDiagnosticReport,
    handleCreateEncounter,
    handleCreateImagingStudy,
    handleCreateMedicationAdministration,
    handleCreateMedicationDispense,
    handleCreateMedicationRequest,
    handleCreateObservation,
    handleCreateProcedure,
    handleCreateServiceRequest,
    handleFinishEncounter
  } = clinicalRecordHandlers;

  return {
    onCreateAllergyIntolerance: handleCreateAllergyIntolerance,
    onCreateCondition: handleCreateCondition,
    onCreateDiagnosticReport: handleCreateDiagnosticReport,
    onCreateEncounter: handleCreateEncounter,
    onCreateImagingStudy: handleCreateImagingStudy,
    onCreateMedicationAdministration: handleCreateMedicationAdministration,
    onCreateMedicationDispense: handleCreateMedicationDispense,
    onCreateMedicationRequest: handleCreateMedicationRequest,
    onCreateObservation: handleCreateObservation,
    onCreateProcedure: handleCreateProcedure,
    onCreateServiceRequest: handleCreateServiceRequest,
    onFinishEncounter: handleFinishEncounter,
    onAllergyIntoleranceFormChange:
      clinicalRecordState.setAllergyIntoleranceForm,
    onConditionFormChange: clinicalRecordState.setConditionForm,
    onDiagnosticReportFormChange: clinicalRecordState.setDiagnosticReportForm,
    onEncounterFormChange: clinicalRecordState.setEncounterForm,
    onImagingStudyFormChange: clinicalRecordState.setImagingStudyForm,
    onMedicationAdministrationFormChange:
      clinicalRecordState.setMedicationAdministrationForm,
    onMedicationDispenseFormChange:
      clinicalRecordState.setMedicationDispenseForm,
    onMedicationRequestFormChange: clinicalRecordState.setMedicationRequestForm,
    onObservationFormChange: clinicalRecordState.setObservationForm,
    onProcedureFormChange: clinicalRecordState.setProcedureForm,
    onServiceRequestFormChange: clinicalRecordState.setServiceRequestForm,
    onSelectAllergyIntolerance:
      clinicalRecordState.setSelectedAllergyIntoleranceId,
    onSelectCondition: clinicalRecordState.setSelectedConditionId,
    onSelectDiagnosticReport:
      clinicalRecordState.setSelectedDiagnosticReportId,
    onSelectEncounter: clinicalRecordState.setSelectedEncounterId,
    onSelectImagingStudy: clinicalRecordState.setSelectedImagingStudyId,
    onSelectMedicationAdministration:
      clinicalRecordState.setSelectedMedicationAdministrationId,
    onSelectMedicationDispense:
      clinicalRecordState.setSelectedMedicationDispenseId,
    onSelectMedicationRequest:
      clinicalRecordState.setSelectedMedicationRequestId,
    onSelectObservation: clinicalRecordState.setSelectedObservationId,
    onSelectProcedure: clinicalRecordState.setSelectedProcedureId,
    onSelectServiceRequest: clinicalRecordState.setSelectedServiceRequestId,
    onSelectWorkflowTask: clinicalRecordState.setSelectedWorkflowTaskId
  };
}
