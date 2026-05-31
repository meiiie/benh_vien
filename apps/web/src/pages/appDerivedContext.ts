import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { buildDashboardMetrics } from "./dashboardMetrics.js";
import { buildWorkspaceSelection } from "./workspaceSelection.js";
import type {
  AuthSession,
  Patient,
  ProviderDirectory,
  RecordTransfer
} from "../types/clinical.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;

type BuildAppAccessContextInput = {
  readonly authSession: AuthSession | undefined;
};

type BuildAppWorkspaceContextInput = {
  readonly clinicalRecordState: ClinicalRecordState;
  readonly patients: readonly Patient[];
  readonly providerDirectory: ProviderDirectory | undefined;
  readonly recordTransfers: readonly RecordTransfer[];
  readonly selectedRecordTransferId: string | undefined;
};

export function buildAppAccessContext({
  authSession
}: BuildAppAccessContextInput) {
  const canReadAudit =
    authSession?.actor.role === "auditor" || authSession?.actor.role === "admin";

  return {
    canMergePatients: authSession?.actor.role === "admin",
    canReadAudit,
    canViewRuntimeInfo: canReadAudit,
    isAuditOnlySession: authSession?.actor.role === "auditor",
    isIntegrationSession: authSession?.actor.role === "integration"
  };
}

export function buildAppWorkspaceContext({
  clinicalRecordState,
  patients,
  providerDirectory,
  recordTransfers,
  selectedRecordTransferId
}: BuildAppWorkspaceContextInput) {
  const patientWorkspaceCollections = {
    allergyIntolerances: clinicalRecordState.allergyIntolerances,
    clinicalDocuments: clinicalRecordState.clinicalDocuments,
    conditions: clinicalRecordState.conditions,
    diagnosticReports: clinicalRecordState.diagnosticReports,
    encounters: clinicalRecordState.encounters,
    imagingStudies: clinicalRecordState.imagingStudies,
    medicationAdministrations: clinicalRecordState.medicationAdministrations,
    medicationDispenses: clinicalRecordState.medicationDispenses,
    medicationRequests: clinicalRecordState.medicationRequests,
    observations: clinicalRecordState.observations,
    procedures: clinicalRecordState.procedures,
    recordTransfers,
    serviceRequests: clinicalRecordState.serviceRequests,
    workflowTasks: clinicalRecordState.workflowTasks
  };

  const workspaceSelection = buildWorkspaceSelection({
    ...patientWorkspaceCollections,
    selectedAllergyIntoleranceId:
      clinicalRecordState.selectedAllergyIntoleranceId,
    selectedConditionId: clinicalRecordState.selectedConditionId,
    selectedDiagnosticReportId: clinicalRecordState.selectedDiagnosticReportId,
    selectedDocumentId: clinicalRecordState.selectedDocumentId,
    selectedEncounterId: clinicalRecordState.selectedEncounterId,
    selectedImagingStudyId: clinicalRecordState.selectedImagingStudyId,
    selectedMedicationAdministrationId:
      clinicalRecordState.selectedMedicationAdministrationId,
    selectedMedicationDispenseId:
      clinicalRecordState.selectedMedicationDispenseId,
    selectedMedicationRequestId: clinicalRecordState.selectedMedicationRequestId,
    selectedObservationId: clinicalRecordState.selectedObservationId,
    selectedProcedureId: clinicalRecordState.selectedProcedureId,
    selectedRecordTransferId,
    selectedServiceRequestId: clinicalRecordState.selectedServiceRequestId,
    selectedWorkflowTaskId: clinicalRecordState.selectedWorkflowTaskId
  });

  return {
    dashboardMetrics: buildDashboardMetrics({
      ...patientWorkspaceCollections,
      patients,
      providerDirectory
    }),
    patientWorkspaceCollections,
    workspaceSelection
  };
}
