import { buildEncounterRecordCounts } from "../features/clinical-records/encounterSelectors.js";
import type {
  AllergyIntolerance,
  ClinicalDocument,
  Condition,
  DiagnosticReport,
  Encounter,
  ImagingStudy,
  MedicationAdministration,
  MedicationDispense,
  MedicationRequest,
  Observation,
  Procedure,
  RecordTransfer,
  ServiceRequest,
  WorkflowTask
} from "../types/clinical.js";

type BuildWorkspaceSelectionInput = {
  readonly allergyIntolerances: readonly AllergyIntolerance[];
  readonly clinicalDocuments: readonly ClinicalDocument[];
  readonly conditions: readonly Condition[];
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly imagingStudies: readonly ImagingStudy[];
  readonly medicationAdministrations: readonly MedicationAdministration[];
  readonly medicationDispenses: readonly MedicationDispense[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly observations: readonly Observation[];
  readonly procedures: readonly Procedure[];
  readonly recordTransfers: readonly RecordTransfer[];
  readonly selectedAllergyIntoleranceId?: string;
  readonly selectedConditionId?: string;
  readonly selectedDiagnosticReportId?: string;
  readonly selectedDocumentId?: string;
  readonly selectedEncounterId?: string;
  readonly selectedImagingStudyId?: string;
  readonly selectedMedicationAdministrationId?: string;
  readonly selectedMedicationDispenseId?: string;
  readonly selectedMedicationRequestId?: string;
  readonly selectedObservationId?: string;
  readonly selectedProcedureId?: string;
  readonly selectedRecordTransferId?: string;
  readonly selectedServiceRequestId?: string;
  readonly selectedWorkflowTaskId?: string;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly workflowTasks: readonly WorkflowTask[];
};

export function buildWorkspaceSelection({
  allergyIntolerances,
  clinicalDocuments,
  conditions,
  diagnosticReports,
  encounters,
  imagingStudies,
  medicationAdministrations,
  medicationDispenses,
  medicationRequests,
  observations,
  procedures,
  recordTransfers,
  selectedAllergyIntoleranceId,
  selectedConditionId,
  selectedDiagnosticReportId,
  selectedDocumentId,
  selectedEncounterId,
  selectedImagingStudyId,
  selectedMedicationAdministrationId,
  selectedMedicationDispenseId,
  selectedMedicationRequestId,
  selectedObservationId,
  selectedProcedureId,
  selectedRecordTransferId,
  selectedServiceRequestId,
  selectedWorkflowTaskId,
  serviceRequests,
  workflowTasks
}: BuildWorkspaceSelectionInput) {
  const selectedEncounter = encounters.find(
    (encounter) => encounter.id === selectedEncounterId
  );

  return {
    selectedAllergyIntolerance: allergyIntolerances.find(
      (allergyIntolerance) => allergyIntolerance.id === selectedAllergyIntoleranceId
    ),
    selectedCondition: conditions.find((condition) => condition.id === selectedConditionId),
    selectedDiagnosticReport: diagnosticReports.find(
      (diagnosticReport) => diagnosticReport.id === selectedDiagnosticReportId
    ),
    selectedDocument: clinicalDocuments.find((document) => document.id === selectedDocumentId),
    selectedEncounter,
    selectedEncounterCounts: buildEncounterRecordCounts({
      allergyIntolerances,
      clinicalDocuments,
      conditions,
      diagnosticReports,
      imagingStudies,
      medicationAdministrations,
      medicationDispenses,
      medicationRequests,
      observations,
      procedures,
      selectedEncounter,
      serviceRequests,
      workflowTasks
    }),
    selectedImagingStudy: imagingStudies.find(
      (imagingStudy) => imagingStudy.id === selectedImagingStudyId
    ),
    selectedMedicationAdministration: medicationAdministrations.find(
      (medicationAdministration) =>
        medicationAdministration.id === selectedMedicationAdministrationId
    ),
    selectedMedicationDispense: medicationDispenses.find(
      (medicationDispense) => medicationDispense.id === selectedMedicationDispenseId
    ),
    selectedMedicationRequest: medicationRequests.find(
      (medicationRequest) => medicationRequest.id === selectedMedicationRequestId
    ),
    selectedObservation: observations.find(
      (observation) => observation.id === selectedObservationId
    ),
    selectedProcedure: procedures.find((procedure) => procedure.id === selectedProcedureId),
    selectedRecordTransfer: recordTransfers.find(
      (recordTransfer) => recordTransfer.id === selectedRecordTransferId
    ),
    selectedServiceRequest: serviceRequests.find(
      (serviceRequest) => serviceRequest.id === selectedServiceRequestId
    ),
    selectedWorkflowTask: workflowTasks.find((task) => task.id === selectedWorkflowTaskId)
  };
}
