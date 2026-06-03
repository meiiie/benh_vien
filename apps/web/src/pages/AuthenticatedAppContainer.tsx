import type { Dispatch, SetStateAction } from "react";
import { createClinicalApiClient } from "../api/clinicalApi.js";
import type { LoginForm } from "../auth/demoLogin.js";
import {
  buildAppAccessContext,
  buildAppRouteRuntimeContext,
  buildAppWorkspaceContext
} from "../application/appDerivedContext.js";
import { buildAppHandlerComposition } from "../application/appHandlerComposition.js";
import { buildAppLoaderComposition } from "../application/appLoaderComposition.js";
import { buildAppPanelComposition } from "../application/appPanelComposition.js";
import { useAppRuntimeEffects } from "../application/appRuntimeEffects.js";
import type { AuthenticatedAppRoute } from "../config/appNavigation.js";
import { referenceSignals, workflowSteps } from "../config/demoClinicalDefaults.js";
import { useAuditState } from "../features/audit/auditState.js";
import { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import { buildPatientRegistrySelection } from "../features/patient-registry/patientRegistrySelectors.js";
import { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import { buildPatientWriteGuard } from "../features/patient-registry/patientWriteGuard.js";
import { usePlatformState } from "../features/platform/platformState.js";
import type { AppRoute, AuthSession } from "../types/appRuntime.js";
import { AuthenticatedAppExperience } from "./AuthenticatedAppExperience.js";

type AuthenticatedAppContainerProps = {
  readonly apiBaseUrl: string;
  readonly appRoute: AuthenticatedAppRoute;
  readonly authSession: AuthSession;
  readonly isIntegrationSession: boolean;
  readonly loginForm: LoginForm;
  readonly setAppRoute: Dispatch<SetStateAction<AppRoute>>;
  readonly setAuthSession: Dispatch<SetStateAction<AuthSession | undefined>>;
  readonly setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  readonly setLoginError: Dispatch<SetStateAction<string | undefined>>;
  readonly setStatusMessage: Dispatch<SetStateAction<string>>;
  readonly statusMessage: string;
};

export default function AuthenticatedAppContainer({
  apiBaseUrl,
  appRoute,
  authSession,
  isIntegrationSession,
  loginForm,
  setAppRoute,
  setAuthSession,
  setIsAuthenticated,
  setLoginError,
  setStatusMessage,
  statusMessage
}: AuthenticatedAppContainerProps) {
  const clinicalApi = createClinicalApiClient({
    baseUrl: apiBaseUrl,
    getSession: () => authSession
  });
  const patientRegistryState = usePatientRegistryState();
  const platformState = usePlatformState();
  const fhirPreviewState = useFhirPreviewState();
  const auditState = useAuditState();
  const interoperabilityState = useInteroperabilityState();
  const clinicalRecordState = useClinicalRecordState();

  const {
    canMergePatients,
    canReadAudit,
    canViewRuntimeInfo,
    isAuditOnlySession
  } = buildAppAccessContext({ authSession });
  const {
    hasPatientListFilter,
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeTargetId,
    selectedPatient,
    selectedPatientMergeTarget,
    selectedPatientWriteDisabled,
    visiblePatients
  } = buildPatientRegistrySelection({
    patientMergeForm: patientRegistryState.patientMergeForm,
    patientSearchTerm: patientRegistryState.patientSearchTerm,
    patientStatusFilter: patientRegistryState.patientStatusFilter,
    patients: patientRegistryState.patients,
    selectedPatientId: patientRegistryState.selectedPatientId
  });
  const { ensureSelectedPatientWritable } = buildPatientWriteGuard({
    selectedPatient,
    selectedPatientMergeTarget,
    selectedPatientWriteDisabled,
    setStatusMessage
  });
  const {
    dashboardMetrics,
    patientWorkspaceCollections,
    workspaceSelection
  } = buildAppWorkspaceContext({
    clinicalRecordState,
    patients: patientRegistryState.patients,
    providerDirectory: platformState.providerDirectory,
    recordTransfers: interoperabilityState.recordTransfers,
    selectedRecordTransferId: interoperabilityState.selectedRecordTransferId
  });
  const {
    fhirPreviews,
    latestEncounterServiceType
  } = buildAppRouteRuntimeContext({
    clinicalRecordState,
    fhirPreviewState,
    platformState
  });
  const loaderComposition = buildAppLoaderComposition({
    auditState,
    authSession,
    canReadAudit,
    clinicalApi,
    clinicalRecordState,
    ensureSelectedPatientWritable,
    fhirPreviewState,
    interoperabilityState,
    isAuditOnlySession,
    patientRegistryState,
    platformState,
    selectedPatient,
    setStatusMessage
  });
  const {
    auditLoaders,
    consentLoaders,
    fhirPreviewLoaders,
    patientRegistryLoaders,
    patientWorkspaceLifecycle,
    patientWorkspaceLoaders,
    platformLoaders,
    recordTransferLoaders
  } = loaderComposition;
  const { loadApiRuntimeInfo } = platformLoaders;
  const handlerComposition = buildAppHandlerComposition({
    auditLoaders,
    auditState,
    canMergePatients,
    clinicalApi,
    clinicalRecordState,
    ensureSelectedPatientWritable,
    fhirPreviewLoaders,
    interoperabilityState,
    isPatientMergeConfirmationValid,
    loginForm,
    patientMergeConfirmationCode,
    patientMergeTargetId,
    patientRegistryLoaders,
    patientRegistryState,
    patientWorkspaceLifecycle,
    patientWorkspaceLoaders,
    platformState,
    recordTransferLoaders,
    selectedPatient,
    setAppRoute,
    setAuthSession,
    setIsAuthenticated,
    setLoginError,
    setStatusMessage
  });
  const { handleLogout } = handlerComposition.authSessionHandlers;
  const { handleGatewayAcknowledgementSubmit } =
    handlerComposition.recordTransferHandlers;
  const routePanels = buildAppPanelComposition({
    auditLoaders,
    auditState,
    canReadAudit,
    clinicalRecordHandlers: handlerComposition.clinicalRecordHandlers,
    clinicalRecordState,
    consentLoaders,
    fhirPreviewLoaders,
    hasPatientListFilter,
    interoperabilityState,
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeTargetId,
    patientRegistryHandlers: handlerComposition.patientRegistryHandlers,
    patientRegistryLoaders,
    patientRegistryState,
    patientWorkspaceCollections,
    platformLoaders,
    platformState,
    recordTransferHandlers: handlerComposition.recordTransferHandlers,
    selectedPatient,
    selectedPatientMergeTarget,
    selectedPatientWriteDisabled,
    visiblePatients,
    workspaceSelection
  });
  useAppRuntimeEffects({
    auditState,
    auditLoaders,
    authSession,
    canReadAudit,
    canViewRuntimeInfo,
    clinicalRecordState,
    fhirPreviewLoaders,
    fhirPreviewState,
    interoperabilityState,
    isAuthenticated: true,
    isIntegrationSession,
    patientRegistryLoaders,
    patientWorkspaceLifecycle,
    patientRegistryState,
    platformLoaders,
    platformState,
    recordTransferLoaders,
    workspaceSelection
  });

  return (
    <AuthenticatedAppExperience
      apiBaseUrl={apiBaseUrl}
      currentRoute={appRoute}
      userRole={authSession.actor.role}
      userName={authSession.actor.displayName}
      onLogout={handleLogout}
      onShellNavigate={(route) =>
        setAppRoute(isIntegrationSession ? "interop" : route)
      }
      statusMessage={statusMessage}
      apiRuntimeInfo={platformState.apiRuntimeInfo}
      apiRuntimeWarning={platformState.apiRuntimeWarning}
      appRoute={appRoute}
      authSession={authSession}
      canMergePatients={canMergePatients}
      canViewRuntimeInfo={canViewRuntimeInfo}
      dashboardMetrics={dashboardMetrics}
      fhirPreviews={fhirPreviews}
      gatewayAcknowledgementForm={
        interoperabilityState.gatewayAcknowledgementForm
      }
      gatewayAcknowledgementResult={
        interoperabilityState.gatewayAcknowledgementResult
      }
      isIntegrationSession={isIntegrationSession}
      isSubmittingGatewayAcknowledgement={
        interoperabilityState.isSubmittingGatewayAcknowledgement
      }
      latestEncounterServiceType={latestEncounterServiceType}
      loginForm={loginForm}
      panels={routePanels}
      providerDirectory={platformState.providerDirectory}
      referenceSignals={referenceSignals}
      selectedPatient={selectedPatient}
      workflowSteps={workflowSteps}
      onGatewayAcknowledgementFormChange={
        interoperabilityState.setGatewayAcknowledgementForm
      }
      onGatewayAcknowledgementSubmit={(event) =>
        void handleGatewayAcknowledgementSubmit(event)
      }
      onNavigate={setAppRoute}
      onReloadRuntimeInfo={() => void loadApiRuntimeInfo()}
    />
  );
}
