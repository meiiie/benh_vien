import type { useAuditState } from "../features/audit/auditState.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { useEncounterScopedFormEffects } from "../features/clinical-records/encounterScopedFormEffects.js";
import type { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import { useSelectedFhirPreviewEffects } from "../features/fhir-preview/selectedFhirPreviewEffects.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { AuthSession } from "../types/appRuntime.js";
import type { buildAppAuditLoaders } from "./appAuditLoaders.js";
import { useAppLifecycleEffects } from "./appLifecycleEffects.js";
import type { buildAppWorkspaceContext } from "./appDerivedContext.js";
import type { buildAppFhirPreviewLoaders } from "./appFhirPreviewLoaders.js";
import type { buildAppPatientRegistryLoaders } from "./appPatientRegistryLoaders.js";
import type { buildAppPatientWorkspaceLifecycle } from "./appPatientWorkspaceLifecycle.js";
import type { buildAppPlatformLoaders } from "./appPlatformLoaders.js";
import type { buildRecordTransferLoaders } from "../features/record-transfers/recordTransferLoaders.js";

type AuditState = ReturnType<typeof useAuditState>;
type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type FhirPreviewState = ReturnType<typeof useFhirPreviewState>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;
type PlatformState = ReturnType<typeof usePlatformState>;
type AppWorkspaceContext = ReturnType<typeof buildAppWorkspaceContext>;
type AppAuditLoaders = ReturnType<typeof buildAppAuditLoaders>;
type AppFhirPreviewLoaders = ReturnType<typeof buildAppFhirPreviewLoaders>;
type AppPatientRegistryLoaders =
  ReturnType<typeof buildAppPatientRegistryLoaders>;
type AppPatientWorkspaceLifecycle =
  ReturnType<typeof buildAppPatientWorkspaceLifecycle>;
type AppPlatformLoaders = ReturnType<typeof buildAppPlatformLoaders>;
type RecordTransferLoaders = ReturnType<typeof buildRecordTransferLoaders>;

type BuildAppRuntimeEffectsInput = {
  readonly auditState: AuditState;
  readonly auditLoaders: AppAuditLoaders;
  readonly authSession: AuthSession | undefined;
  readonly canReadAudit: boolean;
  readonly canViewRuntimeInfo: boolean;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly fhirPreviewState: FhirPreviewState;
  readonly fhirPreviewLoaders: AppFhirPreviewLoaders;
  readonly interoperabilityState: InteroperabilityState;
  readonly isAuthenticated: boolean;
  readonly isIntegrationSession: boolean;
  readonly patientRegistryLoaders: AppPatientRegistryLoaders;
  readonly patientWorkspaceLifecycle: AppPatientWorkspaceLifecycle;
  readonly patientRegistryState: PatientRegistryState;
  readonly platformLoaders: AppPlatformLoaders;
  readonly platformState: PlatformState;
  readonly recordTransferLoaders: RecordTransferLoaders;
  readonly workspaceSelection: AppWorkspaceContext["workspaceSelection"];
};

export function useAppRuntimeEffects({
  auditState,
  auditLoaders,
  authSession,
  canReadAudit,
  canViewRuntimeInfo,
  clinicalRecordState,
  fhirPreviewState,
  fhirPreviewLoaders,
  interoperabilityState,
  isAuthenticated,
  isIntegrationSession,
  patientRegistryLoaders,
  patientWorkspaceLifecycle,
  patientRegistryState,
  platformLoaders,
  platformState,
  recordTransferLoaders,
  workspaceSelection
}: BuildAppRuntimeEffectsInput) {
  useSelectedFhirPreviewEffects({
    loadAllergyIntoleranceFhirPreview:
      fhirPreviewLoaders.loadAllergyIntoleranceFhirPreview,
    loadConditionFhirPreview: fhirPreviewLoaders.loadConditionFhirPreview,
    loadDiagnosticReportFhirPreview:
      fhirPreviewLoaders.loadDiagnosticReportFhirPreview,
    loadDocumentFhirPreview: fhirPreviewLoaders.loadDocumentFhirPreview,
    loadDocumentProvenanceFhirPreview:
      fhirPreviewLoaders.loadDocumentProvenanceFhirPreview,
    loadImagingStudyFhirPreview:
      fhirPreviewLoaders.loadImagingStudyFhirPreview,
    loadMedicationAdministrationFhirPreview:
      fhirPreviewLoaders.loadMedicationAdministrationFhirPreview,
    loadMedicationDispenseFhirPreview:
      fhirPreviewLoaders.loadMedicationDispenseFhirPreview,
    loadMedicationRequestFhirPreview:
      fhirPreviewLoaders.loadMedicationRequestFhirPreview,
    loadObservationFhirPreview: fhirPreviewLoaders.loadObservationFhirPreview,
    loadProcedureFhirPreview: fhirPreviewLoaders.loadProcedureFhirPreview,
    loadRecordTransferDeliveryAttempts:
      recordTransferLoaders.loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview:
      recordTransferLoaders.loadRecordTransferFhirTaskPreview,
    loadServiceRequestFhirPreview:
      fhirPreviewLoaders.loadServiceRequestFhirPreview,
    loadWorkflowTaskFhirPreview:
      fhirPreviewLoaders.loadWorkflowTaskFhirPreview,
    ...clinicalRecordState,
    selectedDocumentStatus: workspaceSelection.selectedDocument?.status,
    ...fhirPreviewState,
    ...interoperabilityState
  });

  useAppLifecycleEffects({
    actorRole: authSession?.actor.role,
    canReadAudit,
    canViewRuntimeInfo,
    clearPatientWorkspaceState:
      patientWorkspaceLifecycle.clearPatientWorkspaceState,
    isAuthenticated,
    isIntegrationSession,
    loadApiRuntimeInfo: platformLoaders.loadApiRuntimeInfo,
    loadCapabilityStatement: platformLoaders.loadCapabilityStatement,
    loadGlobalAuditEvents: auditLoaders.loadGlobalAuditEvents,
    loadPatients: patientRegistryLoaders.loadPatients,
    loadPatientWorkspace: patientWorkspaceLifecycle.loadPatientWorkspace,
    loadProviderDirectory: platformLoaders.loadProviderDirectory,
    selectedPatientId: patientRegistryState.selectedPatientId,
    setApiRuntimeInfo: platformState.setApiRuntimeInfo,
    setApiRuntimeWarning: platformState.setApiRuntimeWarning,
    setGlobalAuditEvents: auditState.setGlobalAuditEvents
  });

  useEncounterScopedFormEffects({
    loadEncounterFhirPreview: fhirPreviewLoaders.loadEncounterFhirPreview,
    ...clinicalRecordState,
    setEncounterFhirPreview: fhirPreviewState.setEncounterFhirPreview
  });
}
