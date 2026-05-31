import { buildAuthSessionHandlers } from "./auth/authSessionHandlers.js";
import { createClinicalApiClient } from "./api/clinicalApi.js";
import { buildAuditLoaders } from "./features/audit/auditLoaders.js";
import { useAuditState } from "./features/audit/auditState.js";
import { AuthenticatedLayout } from "./components/AppShell.js";
import { buildClinicalDocumentHandlers } from "./features/clinical-documents/clinicalDocumentHandlers.js";
import { useClinicalRecordState } from "./features/clinical-records/clinicalRecordState.js";
import { buildCarePlanHandlers } from "./features/clinical-records/carePlanHandlers.js";
import { buildMedicationHandlers } from "./features/clinical-records/medicationHandlers.js";
import { buildClinicalEntryHandlers } from "./features/clinical-records/clinicalEntryHandlers.js";
import { useEncounterScopedFormEffects } from "./features/clinical-records/encounterScopedFormEffects.js";
import { buildEncounterHandlers } from "./features/clinical-records/encounterHandlers.js";
import { buildConsentLoaders } from "./features/consents/consentLoaders.js";
import { useInteroperabilityState } from "./features/interoperability/interoperabilityState.js";
import { buildPatientRegistryHandlers } from "./features/patient-registry/patientRegistryHandlers.js";
import { buildPatientRegistryLoaders } from "./features/patient-registry/patientRegistryLoaders.js";
import { buildPatientRegistrySelection } from "./features/patient-registry/patientRegistrySelectors.js";
import { usePatientRegistryState } from "./features/patient-registry/patientRegistryState.js";
import { buildPatientWriteGuard } from "./features/patient-registry/patientWriteGuard.js";
import { buildPatientWorkspaceCollectionLoaders } from "./features/patient-workspace/patientWorkspaceCollectionLoaders.js";
import { buildPatientWorkspaceLifecycle } from "./features/patient-workspace/patientWorkspaceLifecycle.js";
import { buildPlatformLoaders } from "./features/platform/platformLoaders.js";
import { usePlatformState } from "./features/platform/platformState.js";
import { buildFhirPreviewLoaders } from "./features/fhir-preview/fhirPreviewLoaders.js";
import { useFhirPreviewState } from "./features/fhir-preview/fhirPreviewState.js";
import { useSelectedFhirPreviewEffects } from "./features/fhir-preview/selectedFhirPreviewEffects.js";
import { buildRecordTransferHandlers } from "./features/record-transfers/recordTransferHandlers.js";
import { buildRecordTransferLoaders } from "./features/record-transfers/recordTransferLoaders.js";
import { LandingPage } from "./pages/LandingPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { AppRouteRenderer } from "./pages/AppRouteRenderer.js";
import { buildAuditPanels } from "./pages/auditPanelContext.js";
import {
  buildAppAccessContext,
  buildAppRouteRuntimeContext,
  buildAppWorkspaceContext
} from "./pages/appDerivedContext.js";
import { useAppLifecycleEffects } from "./pages/appLifecycleEffects.js";
import { useAppShellState } from "./pages/appShellState.js";
import { buildAppRoutePanels } from "./pages/appRoutePanels.js";
import { buildClinicalDocumentPanels } from "./pages/clinicalDocumentPanelContext.js";
import { buildClinicalRecordPanels } from "./pages/clinicalRecordPanelContext.js";
import { buildInteropPanels } from "./pages/interopPanelContext.js";
import { buildPatientPanels } from "./pages/patientPanelContext.js";

import {
  defaultTransferContext,
  referenceSignals,
  workflowSteps
} from "./config/demoClinicalDefaults.js";
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
  const { loadPatients } = buildPatientRegistryLoaders({
    clinicalApi,
    isAuditOnlySession,
    selectedPatientId: patientRegistryState.selectedPatientId,
    setIsLoadingPatients: patientRegistryState.setIsLoadingPatients,
    setPatients: patientRegistryState.setPatients,
    setSelectedPatientId: patientRegistryState.setSelectedPatientId,
    setStatusMessage
  });
  const {
    loadAllergyIntoleranceFhirPreview,
    loadAuditFhirBundle,
    loadConditionFhirPreview,
    loadConsentFhirPreview,
    loadDiagnosticReportFhirPreview,
    loadDocumentFhirPreview,
    loadDocumentProvenanceFhirPreview,
    loadEncounterFhirPreview,
    loadImagingStudyFhirPreview,
    loadMedicationAdministrationFhirPreview,
    loadMedicationDispenseFhirPreview,
    loadMedicationRequestFhirPreview,
    loadObservationFhirPreview,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    loadPatientFhirPreview,
    loadProcedureFhirPreview,
    loadProviderDirectoryFhirPreview,
    loadServiceRequestFhirPreview,
    loadWorkflowTaskFhirPreview
  } = buildFhirPreviewLoaders({
    canReadAudit,
    clinicalApi,
    isAuditOnlySession,
    ...fhirPreviewState,
    setAuditFhirBundlePreview: auditState.setAuditFhirBundlePreview,
    setIsExportingAuditFhir: auditState.setIsExportingAuditFhir,
    setProviderDirectoryFhirPreview: platformState.setProviderDirectoryFhirPreview,
    setStatusMessage
  });
  const {
    loadAuditEvents,
    loadGlobalAuditEvents,
    verifyAuditIntegrity
  } = buildAuditLoaders({
    canReadAudit,
    clinicalApi,
    setAuditEvents: auditState.setAuditEvents,
    setAuditFhirBundlePreview: auditState.setAuditFhirBundlePreview,
    setAuditIntegrityReport: auditState.setAuditIntegrityReport,
    setGlobalAuditEvents: auditState.setGlobalAuditEvents,
    setIsLoadingAuditEvents: auditState.setIsLoadingAuditEvents,
    setIsLoadingGlobalAuditEvents: auditState.setIsLoadingGlobalAuditEvents,
    setIsVerifyingAuditIntegrity: auditState.setIsVerifyingAuditIntegrity,
    setStatusMessage
  });
  const {
    handleRevokeConsent,
    loadConsents
  } = buildConsentLoaders({
    clinicalApi,
    ensureSelectedPatientWritable,
    loadConsentFhirPreview,
    selectedPatient,
    ...interoperabilityState,
    setStatusMessage
  });
  const {
    loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview,
    loadRecordTransfers
  } = buildRecordTransferLoaders({
    clinicalApi,
    ...interoperabilityState,
    setRecordTransferFhirTaskPreview:
      fhirPreviewState.setRecordTransferFhirTaskPreview,
    setStatusMessage
  });
  const {
    handleCreateRecordTransfer,
    handleFailRecordTransfer,
    handleGatewayAcknowledgementSubmit,
    handleReceiveRecordTransfer,
    handleRetryRecordTransfer,
    handleSendRecordTransfer
  } = buildRecordTransferHandlers({
    clinicalApi,
    ensureSelectedPatientWritable,
    ...interoperabilityState,
    loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview,
    loadRecordTransfers,
    selectedPatient,
    setStatusMessage
  });
  const {
    loadApiRuntimeInfo,
    loadCapabilityStatement,
    loadProviderDirectory
  } = buildPlatformLoaders({
    authSession,
    clinicalApi,
    isAuditOnlySession,
    loadProviderDirectoryFhirPreview,
    setApiRuntimeInfo: platformState.setApiRuntimeInfo,
    setApiRuntimeWarning: platformState.setApiRuntimeWarning,
    setCapabilityStatementPreview: platformState.setCapabilityStatementPreview,
    setIsLoadingProviderDirectory: platformState.setIsLoadingProviderDirectory,
    setProviderDirectory: platformState.setProviderDirectory,
    setProviderDirectoryFhirPreview: platformState.setProviderDirectoryFhirPreview
  });
  const {
    loadAllergyIntolerances,
    loadClinicalDocuments,
    loadConditions,
    loadDiagnosticReports,
    loadEncounters,
    loadImagingStudies,
    loadMedicationAdministrations,
    loadMedicationDispenses,
    loadMedicationRequests,
    loadObservations,
    loadProcedures,
    loadServiceRequests,
    loadWorkflowTasks
  } = buildPatientWorkspaceCollectionLoaders({
    clinicalApi,
    ...clinicalRecordState,
    setStatusMessage
  });
  const {
    clearPatientWorkspaceState,
    loadPatientWorkspace
  } = buildPatientWorkspaceLifecycle({
    canReadAudit,
    consentReference: defaultTransferContext.consentReference,
    isAuditOnlySession,
    loadAllergyIntolerances,
    loadAuditEvents,
    loadClinicalDocuments,
    loadConditions,
    loadConsentFhirPreview,
    loadConsents,
    loadDiagnosticReports,
    loadEncounters,
    loadImagingStudies,
    loadMedicationAdministrations,
    loadMedicationDispenses,
    loadMedicationRequests,
    loadObservations,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    loadPatientFhirPreview,
    loadProcedures,
    loadRecordTransfers,
    loadServiceRequests,
    loadWorkflowTasks,
    ...fhirPreviewState,
    ...clinicalRecordState,
    setAuditEvents: auditState.setAuditEvents,
    setAuditFhirBundlePreview: auditState.setAuditFhirBundlePreview,
    setAuditIntegrityReport: auditState.setAuditIntegrityReport,
    setCapabilityStatementPreview: platformState.setCapabilityStatementPreview,
    ...interoperabilityState,
  });
  const {
    handleCreatePatient,
    handleMergeSelectedPatient
  } = buildPatientRegistryHandlers({
    canMergePatients,
    clinicalApi,
    isPatientMergeConfirmationValid,
    loadPatients,
    loadPatientWorkspace,
    patientForm: patientRegistryState.patientForm,
    patientMergeConfirmationCode,
    patientMergeForm: patientRegistryState.patientMergeForm,
    patientMergeTargetId,
    selectedPatient,
    setAppRoute,
    setIsMergingPatient: patientRegistryState.setIsMergingPatient,
    setIsSubmittingPatient: patientRegistryState.setIsSubmittingPatient,
    setPatientMergeForm: patientRegistryState.setPatientMergeForm,
    setStatusMessage
  });
  const {
    handleCreateEncounter,
    handleFinishEncounter
  } = buildEncounterHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadEncounterFhirPreview,
    loadEncounters,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });
  const {
    handleCreateAllergyIntolerance,
    handleCreateCondition,
    handleCreateObservation
  } = buildClinicalEntryHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAllergyIntolerances,
    loadAuditEvents,
    loadConditions,
    loadObservations,
    loadPatientFhirBundlePreview,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });
  const {
    handleCreateMedicationAdministration,
    handleCreateMedicationDispense,
    handleCreateMedicationRequest
  } = buildMedicationHandlers({
    clinicalApi,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadMedicationAdministrations,
    loadMedicationDispenses,
    loadMedicationRequests,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    ...clinicalRecordState,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });
  const {
    handleCreateDiagnosticReport,
    handleCreateImagingStudy,
    handleCreateProcedure,
    handleCreateServiceRequest
  } = buildCarePlanHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadDiagnosticReports,
    loadImagingStudies,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    loadProcedures,
    loadServiceRequests,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });
  const {
    handleCreateClinicalDocument,
    handleSignClinicalDocument
  } = buildClinicalDocumentHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadClinicalDocuments,
    loadDocumentFhirPreview,
    loadDocumentProvenanceFhirPreview,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });
  const {
    handleLogin,
    handleLogout
  } = buildAuthSessionHandlers({
    clearPatientWorkspaceState,
    clinicalApi,
    loginForm,
    setApiRuntimeInfo: platformState.setApiRuntimeInfo,
    setApiRuntimeWarning: platformState.setApiRuntimeWarning,
    setAppRoute,
    setAuthSession,
    setGlobalAuditEvents: auditState.setGlobalAuditEvents,
    setIsAuthenticated,
    setLoginError,
    setPatients: patientRegistryState.setPatients,
    setProviderDirectory: platformState.setProviderDirectory,
    setProviderDirectoryFhirPreview: platformState.setProviderDirectoryFhirPreview,
    setSelectedPatientId: patientRegistryState.setSelectedPatientId,
    setStatusMessage,
    setTransitioningRecordTransferId:
      interoperabilityState.setTransitioningRecordTransferId
  });
  const patientPanels = buildPatientPanels({
    hasPatientListFilter,
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    onCreatePatient: handleCreatePatient,
    onMergePatient: handleMergeSelectedPatient,
    onPatientRefresh: loadPatients,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeTargetId,
    patientRegistryState,
    selectedPatient,
    selectedPatientMergeTarget,
    visiblePatients
  });
  const interopPanels = buildInteropPanels({
    interoperabilityState,
    isSelectedPatientMerged,
    onCreateRecordTransfer: handleCreateRecordTransfer,
    onFailRecordTransfer: handleFailRecordTransfer,
    onLoadConsentFhirPreview: loadConsentFhirPreview,
    onProviderDirectoryRefresh: loadProviderDirectory,
    onReceiveRecordTransfer: handleReceiveRecordTransfer,
    onRetryRecordTransfer: handleRetryRecordTransfer,
    onRevokeConsent: handleRevokeConsent,
    onSendRecordTransfer: handleSendRecordTransfer,
    platformState,
    selectedPatientWriteDisabled,
    workspaceSelection
  });
  const auditPanels = buildAuditPanels({
    auditState,
    canReadAudit,
    onExportAuditFhir: loadAuditFhirBundle,
    onLoadAuditEvents: loadAuditEvents,
    onReloadGlobalAuditEvents: loadGlobalAuditEvents,
    onVerifyAuditIntegrity: verifyAuditIntegrity,
    selectedPatient
  });
  const clinicalRecordPanels = buildClinicalRecordPanels({
    clinicalRecordState,
    handlers: {
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
    },
    isWriteDisabled: selectedPatientWriteDisabled,
    patientWorkspaceCollections,
    workspaceSelection
  });
  const clinicalDocumentPanels = buildClinicalDocumentPanels({
    clinicalRecordState,
    isSelectedPatientMerged,
    isWriteDisabled: selectedPatientWriteDisabled,
    onCreateDocument: handleCreateClinicalDocument,
    onSignDocument: handleSignClinicalDocument,
    workspaceSelection
  });
  const routePanels = buildAppRoutePanels({
    auditPanels,
    clinicalDocumentPanels,
    clinicalRecordPanels,
    interopPanels,
    patientPanels
  });
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
    setEncounterFhirPreview: fhirPreviewState.setEncounterFhirPreview,
  });

  if (!isAuthenticated) {
    if (appRoute === "login") {
      return (
        <LoginPage
          form={loginForm}
          error={loginError}
          onBack={() => setAppRoute("landing")}
          onChange={setLoginForm}
          onSubmit={handleLogin}
        />
      );
    }

    return <LandingPage onDemo={() => void handleLogin()} onLogin={() => setAppRoute("login")} />;
  }

  return (
    <AuthenticatedLayout
      apiBaseUrl={apiBaseUrl}
      currentRoute={isIntegrationSession ? "interop" : appRoute}
      userRole={authSession?.actor.role ?? loginForm.role}
      userName={authSession?.actor.displayName ?? loginForm.username}
      onLogout={handleLogout}
      onNavigate={isIntegrationSession ? () => setAppRoute("interop") : setAppRoute}
      statusMessage={statusMessage}
    >
      <AppRouteRenderer
        apiBaseUrl={apiBaseUrl}
        apiRuntimeInfo={platformState.apiRuntimeInfo}
        apiRuntimeWarning={platformState.apiRuntimeWarning}
        appRoute={appRoute}
        authSession={authSession}
        canMergePatients={canMergePatients}
        canViewRuntimeInfo={canViewRuntimeInfo}
        dashboardMetrics={dashboardMetrics}
        fhirPreviews={fhirPreviews}
        gatewayAcknowledgementForm={interoperabilityState.gatewayAcknowledgementForm}
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
    </AuthenticatedLayout>
  );

}
