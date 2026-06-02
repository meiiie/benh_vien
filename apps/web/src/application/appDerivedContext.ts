import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { AppRouteRuntimeContext } from "./appRouteModels.js";
import { buildDashboardMetrics } from "./dashboardMetrics.js";
import { buildWorkspaceSelection } from "./workspaceSelection.js";
import type { AuthSession } from "../types/appRuntime.js";
import type { Patient } from "../types/patientRegistry.js";
import type { ProviderDirectory } from "../types/providerDirectory.js";
import type { RecordTransfer } from "../types/recordTransfers.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type FhirPreviewState = ReturnType<typeof useFhirPreviewState>;
type PlatformState = ReturnType<typeof usePlatformState>;

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

export function buildAppRouteRuntimeContext({
  clinicalRecordState,
  fhirPreviewState,
  platformState
}: {
  readonly clinicalRecordState: ClinicalRecordState;
  readonly fhirPreviewState: FhirPreviewState;
  readonly platformState: PlatformState;
}): AppRouteRuntimeContext {
  return {
    fhirPreviews: {
      allergyIntolerance: fhirPreviewState.allergyIntoleranceFhirPreview,
      capabilityStatement: platformState.capabilityStatementPreview,
      condition: fhirPreviewState.conditionFhirPreview,
      consent: fhirPreviewState.consentFhirPreview,
      diagnosticReport: fhirPreviewState.diagnosticReportFhirPreview,
      document: fhirPreviewState.documentFhirPreview,
      documentProvenance: fhirPreviewState.documentProvenanceFhirPreview,
      encounter: fhirPreviewState.encounterFhirPreview,
      imagingStudy: fhirPreviewState.imagingStudyFhirPreview,
      medicationAdministration:
        fhirPreviewState.medicationAdministrationFhirPreview,
      medicationDispense: fhirPreviewState.medicationDispenseFhirPreview,
      medicationRequest: fhirPreviewState.medicationRequestFhirPreview,
      observation: fhirPreviewState.observationFhirPreview,
      patient: fhirPreviewState.patientFhirPreview,
      patientBundle: fhirPreviewState.patientFhirBundlePreview,
      patientDocumentBundle: fhirPreviewState.patientFhirDocumentBundlePreview,
      procedure: fhirPreviewState.procedureFhirPreview,
      providerDirectory: platformState.providerDirectoryFhirPreview,
      recordTransferTask: fhirPreviewState.recordTransferFhirTaskPreview,
      serviceRequest: fhirPreviewState.serviceRequestFhirPreview,
      workflowTask: fhirPreviewState.workflowTaskFhirPreview
    },
    latestEncounterServiceType: clinicalRecordState.encounters[0]?.serviceType
  };
}
