import { createClinicalApiClient } from "./api/clinicalApi.js";
import { useAuditState } from "./features/audit/auditState.js";
import { useClinicalRecordState } from "./features/clinical-records/clinicalRecordState.js";
import { useInteroperabilityState } from "./features/interoperability/interoperabilityState.js";
import { buildPatientRegistrySelection } from "./features/patient-registry/patientRegistrySelectors.js";
import { usePatientRegistryState } from "./features/patient-registry/patientRegistryState.js";
import { buildPatientWriteGuard } from "./features/patient-registry/patientWriteGuard.js";
import { usePlatformState } from "./features/platform/platformState.js";
import { useFhirPreviewState } from "./features/fhir-preview/fhirPreviewState.js";
import { AuthenticatedAppExperience } from "./pages/AuthenticatedAppExperience.js";
import { PublicAppExperience } from "./pages/PublicAppExperience.js";
import {
  buildAppAccessContext,
  buildAppRouteRuntimeContext,
  buildAppWorkspaceContext
} from "./application/appDerivedContext.js";
import { buildAppHandlerComposition } from "./application/appHandlerComposition.js";
import { buildAppLoaderComposition } from "./application/appLoaderComposition.js";
import { buildAppPanelComposition } from "./application/appPanelComposition.js";
import { useAppRuntimeEffects } from "./application/appRuntimeEffects.js";
import { useAppShellState } from "./application/appShellState.js";
import { normalizeAuthenticatedRoute } from "./config/appNavigation.js";

import { referenceSignals, workflowSteps } from "./config/demoClinicalDefaults.js";
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (window.location.port === "7311" ? "http://localhost:7310/api/v1" : "/api/v1");

export function App() {
  const {
    appRoute,
    authSession,
    isAuthenticated,
    loginError,
    loginForm,
    setAppRoute,
    setAuthSession,
    setIsAuthenticated,
    setLoginError,
    setLoginForm,
    setStatusMessage,
    statusMessage
  } = useAppShellState();
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
    isAuditOnlySession,
    isIntegrationSession
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
  const {
    handleLogin,
    handleLogout
  } = handlerComposition.authSessionHandlers;
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
    isAuthenticated,
    isIntegrationSession,
    patientRegistryLoaders,
    patientWorkspaceLifecycle,
    patientRegistryState,
    platformLoaders,
    platformState,
    recordTransferLoaders,
    workspaceSelection
  });

  if (!isAuthenticated) {
    return (
      <PublicAppExperience
        appRoute={appRoute}
        loginError={loginError}
        loginForm={loginForm}
        onBackToLanding={() => setAppRoute("landing")}
        onDemo={() => void handleLogin()}
        onLogin={() => setAppRoute("login")}
        onLoginFormChange={setLoginForm}
        onLoginSubmit={handleLogin}
      />
    );
  }

  const authenticatedAppRoute = isIntegrationSession
    ? "interop"
    : normalizeAuthenticatedRoute(appRoute);

  return (
    <AuthenticatedAppExperience
      apiBaseUrl={apiBaseUrl}
      currentRoute={authenticatedAppRoute}
      userRole={authSession?.actor.role ?? loginForm.role}
      userName={authSession?.actor.displayName ?? loginForm.username}
      onLogout={handleLogout}
      onShellNavigate={(route) =>
        setAppRoute(isIntegrationSession ? "interop" : route)
      }
      statusMessage={statusMessage}
      apiRuntimeInfo={platformState.apiRuntimeInfo}
      apiRuntimeWarning={platformState.apiRuntimeWarning}
      appRoute={authenticatedAppRoute}
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
