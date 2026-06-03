import type { ClinicalRecordPanelHandlers } from "../features/clinical-records/clinicalRecordPanelRendererCommandTypes.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;

type ClinicalRecordCommandHandlers = Pick<
  ClinicalRecordPanelHandlers,
  | "onCreateAllergyIntolerance"
  | "onCreateCondition"
  | "onCreateDiagnosticReport"
  | "onCreateEncounter"
  | "onCreateImagingStudy"
  | "onCreateMedicationAdministration"
  | "onCreateMedicationDispense"
  | "onCreateMedicationRequest"
  | "onCreateObservation"
  | "onCreateProcedure"
  | "onCreateServiceRequest"
  | "onFinishEncounter"
>;

type BuildAppClinicalRecordPanelHandlersInput =
  ClinicalRecordCommandHandlers & {
    readonly clinicalRecordState: ClinicalRecordState;
  };

export function buildAppClinicalRecordPanelHandlers({
  clinicalRecordState,
  onCreateAllergyIntolerance,
  onCreateCondition,
  onCreateDiagnosticReport,
  onCreateEncounter,
  onCreateImagingStudy,
  onCreateMedicationAdministration,
  onCreateMedicationDispense,
  onCreateMedicationRequest,
  onCreateObservation,
  onCreateProcedure,
  onCreateServiceRequest,
  onFinishEncounter
}: BuildAppClinicalRecordPanelHandlersInput): ClinicalRecordPanelHandlers {
  return {
    onCreateAllergyIntolerance,
    onCreateCondition,
    onCreateDiagnosticReport,
    onCreateEncounter,
    onCreateImagingStudy,
    onCreateMedicationAdministration,
    onCreateMedicationDispense,
    onCreateMedicationRequest,
    onCreateObservation,
    onCreateProcedure,
    onCreateServiceRequest,
    onFinishEncounter,
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
