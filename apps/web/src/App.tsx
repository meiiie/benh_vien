import { buildAuthSessionHandlers } from "./auth/authSessionHandlers.js";
import { createClinicalApiClient } from "./api/clinicalApi.js";
import { buildAuditLoaders } from "./features/audit/auditLoaders.js";
import { buildAuditPanelRenderers } from "./features/audit/auditPanelRenderers.js";
import { useAuditState } from "./features/audit/auditState.js";
import {
  AuthenticatedLayout,
  Info,
  PageHeader
} from "./components/AppShell.js";
import { buildClinicalDocumentHandlers } from "./features/clinical-documents/clinicalDocumentHandlers.js";
import { buildClinicalDocumentPanelRenderers } from "./features/clinical-documents/clinicalDocumentPanelRenderers.js";
import { buildClinicalRecordPanelRenderers } from "./features/clinical-records/clinicalRecordPanelRenderers.js";
import { useClinicalRecordState } from "./features/clinical-records/clinicalRecordState.js";
import { buildCarePlanHandlers } from "./features/clinical-records/carePlanHandlers.js";
import { buildMedicationHandlers } from "./features/clinical-records/medicationHandlers.js";
import { buildClinicalEntryHandlers } from "./features/clinical-records/clinicalEntryHandlers.js";
import { useEncounterScopedFormEffects } from "./features/clinical-records/encounterScopedFormEffects.js";
import { buildEncounterHandlers } from "./features/clinical-records/encounterHandlers.js";
import { buildConsentLoaders } from "./features/consents/consentLoaders.js";
import { buildInteropPanelRenderers } from "./features/interoperability/interopPanelRenderers.js";
import { useInteroperabilityState } from "./features/interoperability/interoperabilityState.js";
import { buildPatientRegistryHandlers } from "./features/patient-registry/patientRegistryHandlers.js";
import { buildPatientRegistryLoaders } from "./features/patient-registry/patientRegistryLoaders.js";
import { buildPatientPanelRenderers } from "./features/patient-registry/patientPanelRenderers.js";
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
import { useAppLifecycleEffects } from "./pages/appLifecycleEffects.js";
import { useAppShellState } from "./pages/appShellState.js";
import { buildAppRoutePanels } from "./pages/appRoutePanels.js";
import { buildDashboardMetrics } from "./pages/dashboardMetrics.js";
import { buildWorkspaceSelection } from "./pages/workspaceSelection.js";

import {
  defaultTransferContext,
  documentTaxonomy,
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

  const canMergePatients = authSession?.actor.role === "admin";
  const isIntegrationSession = authSession?.actor.role === "integration";
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
  const patientWorkspaceCollections = {
    ...clinicalRecordState,
    recordTransfers: interoperabilityState.recordTransfers,
  };
  const workspaceSelection = buildWorkspaceSelection({
    ...patientWorkspaceCollections,
    ...clinicalRecordState,
    selectedRecordTransferId: interoperabilityState.selectedRecordTransferId,
  });
  const dashboardMetrics = buildDashboardMetrics({
    ...patientWorkspaceCollections,
    patients: patientRegistryState.patients,
    providerDirectory: platformState.providerDirectory
  });
  const canReadAudit = authSession?.actor.role === "auditor" || authSession?.actor.role === "admin";
  const canViewRuntimeInfo = canReadAudit;
  const isAuditOnlySession = authSession?.actor.role === "auditor";
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
  const patientPanels = buildPatientPanelRenderers({
    patients: patientRegistryState.patients,
    visiblePatients,
    selectedPatient,
    selectedPatientId: patientRegistryState.selectedPatientId,
    selectedPatientMergeTarget,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeForm: patientRegistryState.patientMergeForm,
    patientMergeTargetId,
    patientForm: patientRegistryState.patientForm,
    searchTerm: patientRegistryState.patientSearchTerm,
    statusFilter: patientRegistryState.patientStatusFilter,
    hasFilter: hasPatientListFilter,
    isLoadingPatients: patientRegistryState.isLoadingPatients,
    isMergingPatient: patientRegistryState.isMergingPatient,
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    isSubmittingPatient: patientRegistryState.isSubmittingPatient,
    onClearPatientFilters: patientRegistryState.clearPatientFilters,
    onCreatePatient: handleCreatePatient,
    onMergePatient: handleMergeSelectedPatient,
    onPatientFormChange: patientRegistryState.setPatientForm,
    onPatientMergeFormChange: patientRegistryState.setPatientMergeForm,
    onPatientRefresh: loadPatients,
    onPatientSearchTermChange: patientRegistryState.setPatientSearchTerm,
    onPatientSelect: patientRegistryState.setSelectedPatientId,
    onPatientStatusFilterChange: patientRegistryState.setPatientStatusFilter
  });
  const interopPanels = buildInteropPanelRenderers({
    consentReference: defaultTransferContext.consentReference,
    consents: interoperabilityState.consents,
    deliveryAttemptWarning:
      interoperabilityState.recordTransferDeliveryAttemptWarning,
    deliveryAttempts: interoperabilityState.recordTransferDeliveryAttempts,
    form: interoperabilityState.recordTransferForm,
    isLoadingConsents: interoperabilityState.isLoadingConsents,
    isLoadingDeliveryAttempts:
      interoperabilityState.isLoadingRecordTransferDeliveryAttempts,
    isLoadingProviderDirectory: platformState.isLoadingProviderDirectory,
    isLoadingRecordTransfers: interoperabilityState.isLoadingRecordTransfers,
    isPatientMerged: isSelectedPatientMerged,
    isSubmittingRecordTransfer: interoperabilityState.isSubmittingRecordTransfer,
    isWriteDisabled: selectedPatientWriteDisabled,
    providerDirectory: platformState.providerDirectory,
    recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
    recordTransfers: interoperabilityState.recordTransfers,
    revokingConsentId: interoperabilityState.revokingConsentId,
    selectedRecordTransfer: workspaceSelection.selectedRecordTransfer,
    selectedRecordTransferId: interoperabilityState.selectedRecordTransferId,
    transitioningRecordTransferId:
      interoperabilityState.transitioningRecordTransferId,
    onCreateRecordTransfer: handleCreateRecordTransfer,
    onFailRecordTransfer: handleFailRecordTransfer,
    onLoadConsentFhirPreview: loadConsentFhirPreview,
    onProviderDirectoryRefresh: loadProviderDirectory,
    onReceiveRecordTransfer: handleReceiveRecordTransfer,
    onRecordTransferFormChange: interoperabilityState.setRecordTransferForm,
    onRetryRecordTransfer: handleRetryRecordTransfer,
    onRevokeConsent: handleRevokeConsent,
    onSelectRecordTransfer: interoperabilityState.setSelectedRecordTransferId,
    onSendRecordTransfer: handleSendRecordTransfer
  });
  const auditPanels = buildAuditPanelRenderers({
    auditEvents: auditState.auditEvents,
    auditFhirBundlePreview: auditState.auditFhirBundlePreview,
    auditIntegrityReport: auditState.auditIntegrityReport,
    canReadAudit,
    globalAuditEvents: auditState.globalAuditEvents,
    isExportingAuditFhir: auditState.isExportingAuditFhir,
    isLoadingAuditEvents: auditState.isLoadingAuditEvents,
    isLoadingGlobalAuditEvents: auditState.isLoadingGlobalAuditEvents,
    isVerifyingAuditIntegrity: auditState.isVerifyingAuditIntegrity,
    selectedPatientId: selectedPatient?.id,
    onExportAuditFhir: loadAuditFhirBundle,
    onLoadAuditEvents: loadAuditEvents,
    onReloadGlobalAuditEvents: loadGlobalAuditEvents,
    onVerifyAuditIntegrity: verifyAuditIntegrity
  });
  const clinicalRecordPanels = buildClinicalRecordPanelRenderers({
    collections: patientWorkspaceCollections,
    forms: {
      allergyIntolerance: clinicalRecordState.allergyIntoleranceForm,
      condition: clinicalRecordState.conditionForm,
      diagnosticReport: clinicalRecordState.diagnosticReportForm,
      encounter: clinicalRecordState.encounterForm,
      imagingStudy: clinicalRecordState.imagingStudyForm,
      medicationAdministration:
        clinicalRecordState.medicationAdministrationForm,
      medicationDispense: clinicalRecordState.medicationDispenseForm,
      medicationRequest: clinicalRecordState.medicationRequestForm,
      observation: clinicalRecordState.observationForm,
      procedure: clinicalRecordState.procedureForm,
      serviceRequest: clinicalRecordState.serviceRequestForm
    },
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
    isFinishingEncounter: clinicalRecordState.isFinishingEncounter,
    isWriteDisabled: selectedPatientWriteDisabled,
    loading: {
      allergyIntolerances: clinicalRecordState.isLoadingAllergyIntolerances,
      conditions: clinicalRecordState.isLoadingConditions,
      diagnosticReports: clinicalRecordState.isLoadingDiagnosticReports,
      encounters: clinicalRecordState.isLoadingEncounters,
      imagingStudies: clinicalRecordState.isLoadingImagingStudies,
      medicationAdministrations:
        clinicalRecordState.isLoadingMedicationAdministrations,
      medicationDispenses: clinicalRecordState.isLoadingMedicationDispenses,
      medicationRequests: clinicalRecordState.isLoadingMedicationRequests,
      observations: clinicalRecordState.isLoadingObservations,
      procedures: clinicalRecordState.isLoadingProcedures,
      serviceRequests: clinicalRecordState.isLoadingServiceRequests,
      workflowTasks: clinicalRecordState.isLoadingWorkflowTasks
    },
    selectedIds: {
      allergyIntolerance: clinicalRecordState.selectedAllergyIntoleranceId,
      condition: clinicalRecordState.selectedConditionId,
      diagnosticReport: clinicalRecordState.selectedDiagnosticReportId,
      encounter: clinicalRecordState.selectedEncounterId,
      imagingStudy: clinicalRecordState.selectedImagingStudyId,
      medicationAdministration:
        clinicalRecordState.selectedMedicationAdministrationId,
      medicationDispense: clinicalRecordState.selectedMedicationDispenseId,
      medicationRequest: clinicalRecordState.selectedMedicationRequestId,
      observation: clinicalRecordState.selectedObservationId,
      procedure: clinicalRecordState.selectedProcedureId,
      serviceRequest: clinicalRecordState.selectedServiceRequestId,
      workflowTask: clinicalRecordState.selectedWorkflowTaskId
    },
    selections: {
      selectedAllergyIntolerance: workspaceSelection.selectedAllergyIntolerance,
      selectedCondition: workspaceSelection.selectedCondition,
      selectedDiagnosticReport: workspaceSelection.selectedDiagnosticReport,
      selectedEncounter: workspaceSelection.selectedEncounter,
      selectedEncounterCounts: workspaceSelection.selectedEncounterCounts,
      selectedImagingStudy: workspaceSelection.selectedImagingStudy,
      selectedMedicationAdministration: workspaceSelection.selectedMedicationAdministration,
      selectedMedicationDispense: workspaceSelection.selectedMedicationDispense,
      selectedMedicationRequest: workspaceSelection.selectedMedicationRequest,
      selectedObservation: workspaceSelection.selectedObservation,
      selectedProcedure: workspaceSelection.selectedProcedure,
      selectedServiceRequest: workspaceSelection.selectedServiceRequest,
      selectedWorkflowTask: workspaceSelection.selectedWorkflowTask
    },
    submitting: {
      allergyIntolerance: clinicalRecordState.isSubmittingAllergyIntolerance,
      condition: clinicalRecordState.isSubmittingCondition,
      diagnosticReport: clinicalRecordState.isSubmittingDiagnosticReport,
      encounter: clinicalRecordState.isSubmittingEncounter,
      imagingStudy: clinicalRecordState.isSubmittingImagingStudy,
      medicationAdministration:
        clinicalRecordState.isSubmittingMedicationAdministration,
      medicationDispense: clinicalRecordState.isSubmittingMedicationDispense,
      medicationRequest: clinicalRecordState.isSubmittingMedicationRequest,
      observation: clinicalRecordState.isSubmittingObservation,
      procedure: clinicalRecordState.isSubmittingProcedure,
      serviceRequest: clinicalRecordState.isSubmittingServiceRequest
    }
  });
  const clinicalDocumentPanels = buildClinicalDocumentPanelRenderers({
    clinicalDocuments: clinicalRecordState.clinicalDocuments,
    documentTaxonomy,
    encounters: clinicalRecordState.encounters,
    form: clinicalRecordState.documentForm,
    isLoading: clinicalRecordState.isLoadingDocuments,
    isSelectedPatientMerged,
    isSigningDocument: clinicalRecordState.isSigningDocument,
    isSubmitting: clinicalRecordState.isSubmittingDocument,
    isWriteDisabled: selectedPatientWriteDisabled,
    selectedDocument: workspaceSelection.selectedDocument,
    selectedDocumentId: clinicalRecordState.selectedDocumentId,
    onCreateDocument: handleCreateClinicalDocument,
    onDocumentFormChange: clinicalRecordState.setDocumentForm,
    onSelectDocument: clinicalRecordState.setSelectedDocumentId,
    onSignDocument: handleSignClinicalDocument
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
        fhirPreviews={{
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
          patientDocumentBundle:
            fhirPreviewState.patientFhirDocumentBundlePreview,
          procedure: fhirPreviewState.procedureFhirPreview,
          providerDirectory: platformState.providerDirectoryFhirPreview,
          recordTransferTask: fhirPreviewState.recordTransferFhirTaskPreview,
          serviceRequest: fhirPreviewState.serviceRequestFhirPreview,
          workflowTask: fhirPreviewState.workflowTaskFhirPreview
        }}
        gatewayAcknowledgementForm={interoperabilityState.gatewayAcknowledgementForm}
        gatewayAcknowledgementResult={
          interoperabilityState.gatewayAcknowledgementResult
        }
        isIntegrationSession={isIntegrationSession}
        isSubmittingGatewayAcknowledgement={
          interoperabilityState.isSubmittingGatewayAcknowledgement
        }
        latestEncounterServiceType={clinicalRecordState.encounters[0]?.serviceType}
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
