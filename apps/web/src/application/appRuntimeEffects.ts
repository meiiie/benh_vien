import type { useAuditState } from "../features/audit/auditState.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { useEncounterScopedFormEffects } from "../features/clinical-records/encounterScopedFormEffects.js";
import type { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import { useSelectedFhirPreviewEffects } from "../features/fhir-preview/selectedFhirPreviewEffects.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { AuthSession } from "../types/appRuntime.js";
import { useAppLifecycleEffects } from "./appLifecycleEffects.js";
import type { buildAppWorkspaceContext } from "./appDerivedContext.js";

type AuditState = ReturnType<typeof useAuditState>;
type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type FhirPreviewState = ReturnType<typeof useFhirPreviewState>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;
type PlatformState = ReturnType<typeof usePlatformState>;
type AppWorkspaceContext = ReturnType<typeof buildAppWorkspaceContext>;
type SelectedFhirPreviewEffectsConfig =
  Parameters<typeof useSelectedFhirPreviewEffects>[0];
type AppLifecycleEffectsConfig = Parameters<typeof useAppLifecycleEffects>[0];
type EncounterScopedFormEffectsConfig =
  Parameters<typeof useEncounterScopedFormEffects>[0];

type BuildAppRuntimeEffectsInput = {
  readonly auditState: AuditState;
  readonly authSession: AuthSession | undefined;
  readonly canReadAudit: boolean;
  readonly canViewRuntimeInfo: boolean;
  readonly clearPatientWorkspaceState: () => void;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly fhirPreviewState: FhirPreviewState;
  readonly interoperabilityState: InteroperabilityState;
  readonly isAuthenticated: boolean;
  readonly isIntegrationSession: boolean;
  readonly loadAllergyIntoleranceFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadAllergyIntoleranceFhirPreview"];
  readonly loadApiRuntimeInfo:
    AppLifecycleEffectsConfig["loadApiRuntimeInfo"];
  readonly loadCapabilityStatement:
    AppLifecycleEffectsConfig["loadCapabilityStatement"];
  readonly loadConditionFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadConditionFhirPreview"];
  readonly loadDiagnosticReportFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadDiagnosticReportFhirPreview"];
  readonly loadDocumentFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadDocumentFhirPreview"];
  readonly loadDocumentProvenanceFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadDocumentProvenanceFhirPreview"];
  readonly loadEncounterFhirPreview:
    EncounterScopedFormEffectsConfig["loadEncounterFhirPreview"];
  readonly loadGlobalAuditEvents:
    AppLifecycleEffectsConfig["loadGlobalAuditEvents"];
  readonly loadImagingStudyFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadImagingStudyFhirPreview"];
  readonly loadMedicationAdministrationFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadMedicationAdministrationFhirPreview"];
  readonly loadMedicationDispenseFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadMedicationDispenseFhirPreview"];
  readonly loadMedicationRequestFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadMedicationRequestFhirPreview"];
  readonly loadObservationFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadObservationFhirPreview"];
  readonly loadPatientWorkspace:
    AppLifecycleEffectsConfig["loadPatientWorkspace"];
  readonly loadPatients: AppLifecycleEffectsConfig["loadPatients"];
  readonly loadProcedureFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadProcedureFhirPreview"];
  readonly loadProviderDirectory:
    AppLifecycleEffectsConfig["loadProviderDirectory"];
  readonly loadRecordTransferDeliveryAttempts:
    SelectedFhirPreviewEffectsConfig["loadRecordTransferDeliveryAttempts"];
  readonly loadRecordTransferFhirTaskPreview:
    SelectedFhirPreviewEffectsConfig["loadRecordTransferFhirTaskPreview"];
  readonly loadServiceRequestFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadServiceRequestFhirPreview"];
  readonly loadWorkflowTaskFhirPreview:
    SelectedFhirPreviewEffectsConfig["loadWorkflowTaskFhirPreview"];
  readonly patientRegistryState: PatientRegistryState;
  readonly platformState: PlatformState;
  readonly workspaceSelection: AppWorkspaceContext["workspaceSelection"];
};

export function useAppRuntimeEffects({
  auditState,
  authSession,
  canReadAudit,
  canViewRuntimeInfo,
  clearPatientWorkspaceState,
  clinicalRecordState,
  fhirPreviewState,
  interoperabilityState,
  isAuthenticated,
  isIntegrationSession,
  loadAllergyIntoleranceFhirPreview,
  loadApiRuntimeInfo,
  loadCapabilityStatement,
  loadConditionFhirPreview,
  loadDiagnosticReportFhirPreview,
  loadDocumentFhirPreview,
  loadDocumentProvenanceFhirPreview,
  loadEncounterFhirPreview,
  loadGlobalAuditEvents,
  loadImagingStudyFhirPreview,
  loadMedicationAdministrationFhirPreview,
  loadMedicationDispenseFhirPreview,
  loadMedicationRequestFhirPreview,
  loadObservationFhirPreview,
  loadPatientWorkspace,
  loadPatients,
  loadProcedureFhirPreview,
  loadProviderDirectory,
  loadRecordTransferDeliveryAttempts,
  loadRecordTransferFhirTaskPreview,
  loadServiceRequestFhirPreview,
  loadWorkflowTaskFhirPreview,
  patientRegistryState,
  platformState,
  workspaceSelection
}: BuildAppRuntimeEffectsInput) {
  useSelectedFhirPreviewEffects({
    loadAllergyIntoleranceFhirPreview,
    loadConditionFhirPreview,
    loadDiagnosticReportFhirPreview,
    loadDocumentFhirPreview,
    loadDocumentProvenanceFhirPreview,
    loadImagingStudyFhirPreview,
    loadMedicationAdministrationFhirPreview,
    loadMedicationDispenseFhirPreview,
    loadMedicationRequestFhirPreview,
    loadObservationFhirPreview,
    loadProcedureFhirPreview,
    loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview,
    loadServiceRequestFhirPreview,
    loadWorkflowTaskFhirPreview,
    ...clinicalRecordState,
    selectedDocumentStatus: workspaceSelection.selectedDocument?.status,
    ...fhirPreviewState,
    ...interoperabilityState
  });

  useAppLifecycleEffects({
    actorRole: authSession?.actor.role,
    canReadAudit,
    canViewRuntimeInfo,
    clearPatientWorkspaceState,
    isAuthenticated,
    isIntegrationSession,
    loadApiRuntimeInfo,
    loadCapabilityStatement,
    loadGlobalAuditEvents,
    loadPatients,
    loadPatientWorkspace,
    loadProviderDirectory,
    selectedPatientId: patientRegistryState.selectedPatientId,
    setApiRuntimeInfo: platformState.setApiRuntimeInfo,
    setApiRuntimeWarning: platformState.setApiRuntimeWarning,
    setGlobalAuditEvents: auditState.setGlobalAuditEvents
  });

  useEncounterScopedFormEffects({
    loadEncounterFhirPreview,
    ...clinicalRecordState,
    setEncounterFhirPreview: fhirPreviewState.setEncounterFhirPreview
  });
}
