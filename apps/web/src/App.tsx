import { FormEvent, useEffect, useRef, useState } from "react";
import {
  loginPresets,
  type DemoRole,
  type LoginForm
} from "./auth/demoLogin.js";
import { loginDemoSession } from "./auth/authApi.js";
import { createClinicalApiClient } from "./api/clinicalApi.js";
import { buildAuditLoaders } from "./features/audit/auditLoaders.js";
import { buildAuditPanelRenderers } from "./features/audit/auditPanelRenderers.js";
import {
  AuthenticatedLayout,
  Info,
  PageHeader
} from "./components/AppShell.js";
import { createClinicalDocument, signClinicalDocument } from "./features/clinical-documents/clinicalDocumentApi.js";
import { buildCreateClinicalDocumentCommandDraft } from "./features/clinical-documents/clinicalDocumentCommandBuilders.js";
import { buildClinicalDocumentPanelRenderers } from "./features/clinical-documents/clinicalDocumentPanelRenderers.js";
import { buildClinicalRecordPanelRenderers } from "./features/clinical-records/clinicalRecordPanelRenderers.js";
import { buildCarePlanHandlers } from "./features/clinical-records/carePlanHandlers.js";
import { buildMedicationHandlers } from "./features/clinical-records/medicationHandlers.js";
import { buildClinicalEntryHandlers } from "./features/clinical-records/clinicalEntryHandlers.js";
import { buildEncounterScopedFormUpdater } from "./features/clinical-records/encounterScopedFormUpdater.js";
import { buildEncounterHandlers } from "./features/clinical-records/encounterHandlers.js";
import { buildConsentLoaders } from "./features/consents/consentLoaders.js";
import { buildInteropPanelRenderers } from "./features/interoperability/interopPanelRenderers.js";
import { buildPatientRegistryHandlers } from "./features/patient-registry/patientRegistryHandlers.js";
import { buildPatientRegistryLoaders } from "./features/patient-registry/patientRegistryLoaders.js";
import { buildPatientPanelRenderers } from "./features/patient-registry/patientPanelRenderers.js";
import { buildPatientRegistrySelection } from "./features/patient-registry/patientRegistrySelectors.js";
import { buildPatientWriteGuard } from "./features/patient-registry/patientWriteGuard.js";
import { buildPatientWorkspaceCollectionLoaders } from "./features/patient-workspace/patientWorkspaceCollectionLoaders.js";
import { buildPlatformLoaders } from "./features/platform/platformLoaders.js";
import { buildFhirPreviewLoaders } from "./features/fhir-preview/fhirPreviewLoaders.js";
import { buildRecordTransferHandlers } from "./features/record-transfers/recordTransferHandlers.js";
import { buildRecordTransferLoaders } from "./features/record-transfers/recordTransferLoaders.js";
import { formatDateTime } from "./lib/clinicalFormatters.js";
import { LandingPage } from "./pages/LandingPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { AppRouteRenderer } from "./pages/AppRouteRenderer.js";
import { buildAppRoutePanels } from "./pages/appRoutePanels.js";
import { buildDashboardMetrics } from "./pages/dashboardMetrics.js";
import { buildWorkspaceSelection } from "./pages/workspaceSelection.js";

import {
  defaultAllergyIntoleranceForm,
  defaultClinicalDocumentForm,
  defaultConditionForm,
  defaultDiagnosticReportForm,
  defaultEncounterForm,
  defaultGatewayAcknowledgementForm,
  defaultImagingStudyForm,
  defaultMedicationAdministrationForm,
  defaultMedicationDispenseForm,
  defaultMedicationRequestForm,
  defaultObservationForm,
  defaultPatientForm,
  defaultPatientMergeForm,
  defaultProcedureForm,
  defaultRecordTransferForm,
  defaultServiceRequestForm,
  defaultTransferContext,
  documentTaxonomy,
  referenceSignals,
  workflowSteps
} from "./config/demoClinicalDefaults.js";
import type {
  AppRoute,
  PatientIdentifierType,
  MedicationTimingUnit,
  MedicationDispenseStatus,
  ConsentStatus,
  ConsentCategory,
  RecordTransferStatus,
  ProviderOrganizationType,
  ProviderEndpointConnectionType,
  ProviderIdentifier,
  ProviderTelecom,
  ProviderCoding,
  ProviderOrganization,
  ProviderPractitioner,
  ProviderEndpoint,
  ProviderPractitionerRole,
  ProviderDirectory,
  Patient,
  PatientStatusFilter,
  Encounter,
  ClinicalDocument,
  ObservationCode,
  ConditionCode,
  AllergyCode,
  AllergyReaction,
  AllergyIntolerance,
  Condition,
  ObservationQuantity,
  Observation,
  MedicationCode,
  MedicationQuantity,
  DosageInstruction,
  MedicationRequest,
  MedicationDispense,
  MedicationAdministrationPerformer,
  MedicationAdministrationEffectivePeriod,
  MedicationAdministrationDosage,
  MedicationAdministration,
  ServiceRequestCode,
  ServiceRequest,
  WorkflowTask,
  Procedure,
  DiagnosticReportCode,
  DiagnosticReport,
  ImagingStudyCoding,
  ImagingStudySeries,
  ImagingStudy,
  AuditEvent,
  AuditIntegrityReport,
  Consent,
  RecordTransfer,
  RecordTransferDeliveryAttempt,
  ApiRuntimeInfo,
  NewPatientForm,
  PatientMergeForm,
  NewRecordTransferForm,
  GatewayAcknowledgementForm,
  NewEncounterForm,
  NewClinicalDocumentForm,
  NewConditionForm,
  NewAllergyIntoleranceForm,
  NewObservationForm,
  NewMedicationRequestForm,
  NewMedicationDispenseForm,
  NewMedicationAdministrationForm,
  NewServiceRequestForm,
  NewProcedureForm,
  NewDiagnosticReportForm,
  NewImagingStudyForm,
  AuthSession
} from "./types/clinical.js";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (window.location.port === "7311" ? "http://localhost:7310/api/v1" : "/api/v1");

export function App() {
  const [appRoute, setAppRoute] = useState<AppRoute>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession>();
  const clinicalApi = createClinicalApiClient({
    baseUrl: apiBaseUrl,
    getSession: () => authSession
  });
  const [loginForm, setLoginForm] = useState<LoginForm>(loginPresets.clinician);
  const [loginError, setLoginError] = useState<string>();
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientStatusFilter, setPatientStatusFilter] =
    useState<PatientStatusFilter>("all");
  const [encounters, setEncounters] = useState<readonly Encounter[]>([]);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>();
  const [clinicalDocuments, setClinicalDocuments] = useState<readonly ClinicalDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>();
  const [allergyIntolerances, setAllergyIntolerances] = useState<readonly AllergyIntolerance[]>([]);
  const [selectedAllergyIntoleranceId, setSelectedAllergyIntoleranceId] = useState<string>();
  const [conditions, setConditions] = useState<readonly Condition[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState<string>();
  const [observations, setObservations] = useState<readonly Observation[]>([]);
  const [selectedObservationId, setSelectedObservationId] = useState<string>();
  const [medicationRequests, setMedicationRequests] = useState<readonly MedicationRequest[]>([]);
  const [selectedMedicationRequestId, setSelectedMedicationRequestId] = useState<string>();
  const [medicationDispenses, setMedicationDispenses] =
    useState<readonly MedicationDispense[]>([]);
  const [selectedMedicationDispenseId, setSelectedMedicationDispenseId] =
    useState<string>();
  const [medicationAdministrations, setMedicationAdministrations] =
    useState<readonly MedicationAdministration[]>([]);
  const [selectedMedicationAdministrationId, setSelectedMedicationAdministrationId] =
    useState<string>();
  const [serviceRequests, setServiceRequests] = useState<readonly ServiceRequest[]>([]);
  const [selectedServiceRequestId, setSelectedServiceRequestId] = useState<string>();
  const [workflowTasks, setWorkflowTasks] = useState<readonly WorkflowTask[]>([]);
  const [selectedWorkflowTaskId, setSelectedWorkflowTaskId] = useState<string>();
  const [procedures, setProcedures] = useState<readonly Procedure[]>([]);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>();
  const [diagnosticReports, setDiagnosticReports] = useState<readonly DiagnosticReport[]>([]);
  const [selectedDiagnosticReportId, setSelectedDiagnosticReportId] = useState<string>();
  const [imagingStudies, setImagingStudies] = useState<readonly ImagingStudy[]>([]);
  const [selectedImagingStudyId, setSelectedImagingStudyId] = useState<string>();
  const [auditEvents, setAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [globalAuditEvents, setGlobalAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [auditIntegrityReport, setAuditIntegrityReport] =
    useState<AuditIntegrityReport>();
  const [auditFhirBundlePreview, setAuditFhirBundlePreview] = useState<unknown>();
  const [consents, setConsents] = useState<readonly Consent[]>([]);
  const [recordTransfers, setRecordTransfers] = useState<readonly RecordTransfer[]>([]);
  const [selectedRecordTransferId, setSelectedRecordTransferId] = useState<string>();
  const selectedRecordTransferIdRef = useRef<string | undefined>(undefined);
  const [recordTransferDeliveryAttempts, setRecordTransferDeliveryAttempts] =
    useState<readonly RecordTransferDeliveryAttempt[]>([]);
  const [recordTransferDeliveryAttemptWarning, setRecordTransferDeliveryAttemptWarning] =
    useState<string>();
  const [apiRuntimeInfo, setApiRuntimeInfo] = useState<ApiRuntimeInfo>();
  const [apiRuntimeWarning, setApiRuntimeWarning] = useState<string>();
  const [providerDirectory, setProviderDirectory] = useState<ProviderDirectory>();
  const [patientFhirPreview, setPatientFhirPreview] = useState<unknown>();
  const [patientFhirBundlePreview, setPatientFhirBundlePreview] = useState<unknown>();
  const [patientFhirDocumentBundlePreview, setPatientFhirDocumentBundlePreview] = useState<unknown>();
  const [capabilityStatementPreview, setCapabilityStatementPreview] = useState<unknown>();
  const [providerDirectoryFhirPreview, setProviderDirectoryFhirPreview] = useState<unknown>();
  const [consentFhirPreview, setConsentFhirPreview] = useState<unknown>();
  const [recordTransferFhirTaskPreview, setRecordTransferFhirTaskPreview] =
    useState<unknown>();
  const [encounterFhirPreview, setEncounterFhirPreview] = useState<unknown>();
  const [documentFhirPreview, setDocumentFhirPreview] = useState<unknown>();
  const [documentProvenanceFhirPreview, setDocumentProvenanceFhirPreview] =
    useState<unknown>();
  const [allergyIntoleranceFhirPreview, setAllergyIntoleranceFhirPreview] = useState<unknown>();
  const [conditionFhirPreview, setConditionFhirPreview] = useState<unknown>();
  const [observationFhirPreview, setObservationFhirPreview] = useState<unknown>();
  const [medicationRequestFhirPreview, setMedicationRequestFhirPreview] = useState<unknown>();
  const [medicationDispenseFhirPreview, setMedicationDispenseFhirPreview] =
    useState<unknown>();
  const [medicationAdministrationFhirPreview, setMedicationAdministrationFhirPreview] =
    useState<unknown>();
  const [serviceRequestFhirPreview, setServiceRequestFhirPreview] = useState<unknown>();
  const [workflowTaskFhirPreview, setWorkflowTaskFhirPreview] = useState<unknown>();
  const [procedureFhirPreview, setProcedureFhirPreview] = useState<unknown>();
  const [diagnosticReportFhirPreview, setDiagnosticReportFhirPreview] = useState<unknown>();
  const [imagingStudyFhirPreview, setImagingStudyFhirPreview] = useState<unknown>();
  const [patientForm, setPatientForm] = useState<NewPatientForm>(defaultPatientForm);
  const [patientMergeForm, setPatientMergeForm] =
    useState<PatientMergeForm>(defaultPatientMergeForm);
  const [recordTransferForm, setRecordTransferForm] =
    useState<NewRecordTransferForm>(defaultRecordTransferForm);
  const [gatewayAcknowledgementForm, setGatewayAcknowledgementForm] =
    useState<GatewayAcknowledgementForm>(defaultGatewayAcknowledgementForm);
  const [gatewayAcknowledgementResult, setGatewayAcknowledgementResult] =
    useState<RecordTransfer>();
  const [encounterForm, setEncounterForm] = useState<NewEncounterForm>(defaultEncounterForm);
  const [documentForm, setDocumentForm] =
    useState<NewClinicalDocumentForm>(defaultClinicalDocumentForm);
  const [allergyIntoleranceForm, setAllergyIntoleranceForm] =
    useState<NewAllergyIntoleranceForm>(defaultAllergyIntoleranceForm);
  const [conditionForm, setConditionForm] =
    useState<NewConditionForm>(defaultConditionForm);
  const [observationForm, setObservationForm] =
    useState<NewObservationForm>(defaultObservationForm);
  const [medicationRequestForm, setMedicationRequestForm] =
    useState<NewMedicationRequestForm>(defaultMedicationRequestForm);
  const [medicationDispenseForm, setMedicationDispenseForm] =
    useState<NewMedicationDispenseForm>(defaultMedicationDispenseForm);
  const [medicationAdministrationForm, setMedicationAdministrationForm] =
    useState<NewMedicationAdministrationForm>(defaultMedicationAdministrationForm);
  const [serviceRequestForm, setServiceRequestForm] =
    useState<NewServiceRequestForm>(defaultServiceRequestForm);
  const [procedureForm, setProcedureForm] =
    useState<NewProcedureForm>(defaultProcedureForm);
  const [diagnosticReportForm, setDiagnosticReportForm] =
    useState<NewDiagnosticReportForm>(defaultDiagnosticReportForm);
  const [imagingStudyForm, setImagingStudyForm] =
    useState<NewImagingStudyForm>(defaultImagingStudyForm);
  const [statusMessage, setStatusMessage] = useState("Chưa đăng nhập.");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingAllergyIntolerances, setIsLoadingAllergyIntolerances] = useState(false);
  const [isLoadingConditions, setIsLoadingConditions] = useState(false);
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [isLoadingMedicationRequests, setIsLoadingMedicationRequests] = useState(false);
  const [isLoadingMedicationDispenses, setIsLoadingMedicationDispenses] =
    useState(false);
  const [isLoadingMedicationAdministrations, setIsLoadingMedicationAdministrations] =
    useState(false);
  const [isLoadingServiceRequests, setIsLoadingServiceRequests] = useState(false);
  const [isLoadingWorkflowTasks, setIsLoadingWorkflowTasks] = useState(false);
  const [isLoadingProcedures, setIsLoadingProcedures] = useState(false);
  const [isLoadingDiagnosticReports, setIsLoadingDiagnosticReports] = useState(false);
  const [isLoadingImagingStudies, setIsLoadingImagingStudies] = useState(false);
  const [isLoadingAuditEvents, setIsLoadingAuditEvents] = useState(false);
  const [isLoadingGlobalAuditEvents, setIsLoadingGlobalAuditEvents] = useState(false);
  const [isVerifyingAuditIntegrity, setIsVerifyingAuditIntegrity] = useState(false);
  const [isExportingAuditFhir, setIsExportingAuditFhir] = useState(false);
  const [isLoadingConsents, setIsLoadingConsents] = useState(false);
  const [isLoadingRecordTransfers, setIsLoadingRecordTransfers] = useState(false);
  const [isLoadingRecordTransferDeliveryAttempts, setIsLoadingRecordTransferDeliveryAttempts] =
    useState(false);
  const [isLoadingProviderDirectory, setIsLoadingProviderDirectory] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [isMergingPatient, setIsMergingPatient] = useState(false);
  const [isSubmittingEncounter, setIsSubmittingEncounter] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isSubmittingAllergyIntolerance, setIsSubmittingAllergyIntolerance] = useState(false);
  const [isSubmittingCondition, setIsSubmittingCondition] = useState(false);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [isSubmittingMedicationRequest, setIsSubmittingMedicationRequest] = useState(false);
  const [isSubmittingMedicationDispense, setIsSubmittingMedicationDispense] =
    useState(false);
  const [isSubmittingMedicationAdministration, setIsSubmittingMedicationAdministration] =
    useState(false);
  const [isSubmittingServiceRequest, setIsSubmittingServiceRequest] = useState(false);
  const [isSubmittingProcedure, setIsSubmittingProcedure] = useState(false);
  const [isSubmittingDiagnosticReport, setIsSubmittingDiagnosticReport] = useState(false);
  const [isSubmittingImagingStudy, setIsSubmittingImagingStudy] = useState(false);
  const [isSubmittingRecordTransfer, setIsSubmittingRecordTransfer] = useState(false);
  const [isSubmittingGatewayAcknowledgement, setIsSubmittingGatewayAcknowledgement] =
    useState(false);
  const [transitioningRecordTransferId, setTransitioningRecordTransferId] =
    useState<string>();
  const [revokingConsentId, setRevokingConsentId] = useState<string>();
  const [isSigningDocument, setIsSigningDocument] = useState(false);
  const [isFinishingEncounter, setIsFinishingEncounter] = useState(false);

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
    patientMergeForm,
    patientSearchTerm,
    patientStatusFilter,
    patients,
    selectedPatientId
  });
  const { ensureSelectedPatientWritable } = buildPatientWriteGuard({
    selectedPatient,
    selectedPatientMergeTarget,
    selectedPatientWriteDisabled,
    setStatusMessage
  });
  const patientWorkspaceCollections = {
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
    serviceRequests,
    workflowTasks
  };
  const workspaceSelection = buildWorkspaceSelection({
    ...patientWorkspaceCollections,
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
    selectedWorkflowTaskId
  });
  selectedRecordTransferIdRef.current = selectedRecordTransferId;
  const dashboardMetrics = buildDashboardMetrics({
    ...patientWorkspaceCollections,
    patients,
    providerDirectory
  });
  const canReadAudit = authSession?.actor.role === "auditor" || authSession?.actor.role === "admin";
  const canViewRuntimeInfo = canReadAudit;
  const isAuditOnlySession = authSession?.actor.role === "auditor";
  const { loadPatients } = buildPatientRegistryLoaders({
    clinicalApi,
    isAuditOnlySession,
    selectedPatientId,
    setIsLoadingPatients,
    setPatients,
    setSelectedPatientId,
    setStatusMessage
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
    patientForm,
    patientMergeConfirmationCode,
    patientMergeForm,
    patientMergeTargetId,
    selectedPatient,
    setAppRoute,
    setIsMergingPatient,
    setIsSubmittingPatient,
    setPatientMergeForm,
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
    setAllergyIntoleranceFhirPreview,
    setAuditFhirBundlePreview,
    setConditionFhirPreview,
    setConsentFhirPreview,
    setDiagnosticReportFhirPreview,
    setDocumentFhirPreview,
    setDocumentProvenanceFhirPreview,
    setEncounterFhirPreview,
    setImagingStudyFhirPreview,
    setIsExportingAuditFhir,
    setMedicationAdministrationFhirPreview,
    setMedicationDispenseFhirPreview,
    setMedicationRequestFhirPreview,
    setObservationFhirPreview,
    setPatientFhirBundlePreview,
    setPatientFhirDocumentBundlePreview,
    setPatientFhirPreview,
    setProcedureFhirPreview,
    setProviderDirectoryFhirPreview,
    setRecordTransferFhirTaskPreview,
    setServiceRequestFhirPreview,
    setStatusMessage,
    setWorkflowTaskFhirPreview
  });
  const {
    loadAuditEvents,
    loadGlobalAuditEvents,
    verifyAuditIntegrity
  } = buildAuditLoaders({
    canReadAudit,
    clinicalApi,
    setAuditEvents,
    setAuditFhirBundlePreview,
    setAuditIntegrityReport,
    setGlobalAuditEvents,
    setIsLoadingAuditEvents,
    setIsLoadingGlobalAuditEvents,
    setIsVerifyingAuditIntegrity,
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
    setConsents,
    setIsLoadingConsents,
    setRevokingConsentId,
    setStatusMessage
  });
  const {
    loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview,
    loadRecordTransfers
  } = buildRecordTransferLoaders({
    clinicalApi,
    getCurrentRecordTransferId: () => selectedRecordTransferIdRef.current,
    setIsLoadingRecordTransferDeliveryAttempts,
    setIsLoadingRecordTransfers,
    setRecordTransferDeliveryAttempts,
    setRecordTransferDeliveryAttemptWarning,
    setRecordTransferFhirTaskPreview,
    setRecordTransfers,
    setSelectedRecordTransferId,
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
    gatewayAcknowledgementForm,
    loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview,
    loadRecordTransfers,
    recordTransferForm,
    selectedPatient,
    setGatewayAcknowledgementResult,
    setIsSubmittingGatewayAcknowledgement,
    setIsSubmittingRecordTransfer,
    setStatusMessage,
    setTransitioningRecordTransferId
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
    setApiRuntimeInfo,
    setApiRuntimeWarning,
    setCapabilityStatementPreview,
    setIsLoadingProviderDirectory,
    setProviderDirectory,
    setProviderDirectoryFhirPreview
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
    setAllergyIntolerances,
    setClinicalDocuments,
    setConditions,
    setDiagnosticReports,
    setEncounters,
    setImagingStudies,
    setIsLoadingAllergyIntolerances,
    setIsLoadingConditions,
    setIsLoadingDiagnosticReports,
    setIsLoadingDocuments,
    setIsLoadingEncounters,
    setIsLoadingImagingStudies,
    setIsLoadingMedicationAdministrations,
    setIsLoadingMedicationDispenses,
    setIsLoadingMedicationRequests,
    setIsLoadingObservations,
    setIsLoadingProcedures,
    setIsLoadingServiceRequests,
    setIsLoadingWorkflowTasks,
    setMedicationAdministrations,
    setMedicationDispenses,
    setMedicationRequests,
    setObservations,
    setProcedures,
    setSelectedAllergyIntoleranceId,
    setSelectedConditionId,
    setSelectedDiagnosticReportId,
    setSelectedDocumentId,
    setSelectedEncounterId,
    setSelectedImagingStudyId,
    setSelectedMedicationAdministrationId,
    setSelectedMedicationDispenseId,
    setSelectedMedicationRequestId,
    setSelectedObservationId,
    setSelectedProcedureId,
    setSelectedServiceRequestId,
    setSelectedWorkflowTaskId,
    setServiceRequests,
    setStatusMessage,
    setWorkflowTasks
  });
  const {
    handleCreateEncounter,
    handleFinishEncounter
  } = buildEncounterHandlers({
    clinicalApi,
    encounterForm,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadEncounterFhirPreview,
    loadEncounters,
    selectedPatient,
    setAppRoute,
    setIsFinishingEncounter,
    setIsSubmittingEncounter,
    setStatusMessage
  });
  const {
    handleCreateAllergyIntolerance,
    handleCreateCondition,
    handleCreateObservation
  } = buildClinicalEntryHandlers({
    allergyIntoleranceForm,
    clinicalApi,
    conditionForm,
    ensureSelectedPatientWritable,
    loadAllergyIntolerances,
    loadAuditEvents,
    loadConditions,
    loadObservations,
    loadPatientFhirBundlePreview,
    observationForm,
    selectedPatient,
    setAppRoute,
    setIsSubmittingAllergyIntolerance,
    setIsSubmittingCondition,
    setIsSubmittingObservation,
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
    medicationAdministrationForm,
    medicationDispenseForm,
    medicationRequestForm,
    selectedPatient,
    setAppRoute,
    setIsSubmittingMedicationAdministration,
    setIsSubmittingMedicationDispense,
    setIsSubmittingMedicationRequest,
    setStatusMessage
  });
  const {
    handleCreateDiagnosticReport,
    handleCreateImagingStudy,
    handleCreateProcedure,
    handleCreateServiceRequest
  } = buildCarePlanHandlers({
    clinicalApi,
    diagnosticReportForm,
    ensureSelectedPatientWritable,
    imagingStudyForm,
    loadAuditEvents,
    loadDiagnosticReports,
    loadImagingStudies,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    loadProcedures,
    loadServiceRequests,
    procedureForm,
    selectedPatient,
    serviceRequestForm,
    setAppRoute,
    setIsSubmittingDiagnosticReport,
    setIsSubmittingImagingStudy,
    setIsSubmittingProcedure,
    setIsSubmittingServiceRequest,
    setStatusMessage
  });
  const patientPanels = buildPatientPanelRenderers({
    patients,
    visiblePatients,
    selectedPatient,
    selectedPatientId,
    selectedPatientMergeTarget,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeForm,
    patientMergeTargetId,
    patientForm,
    searchTerm: patientSearchTerm,
    statusFilter: patientStatusFilter,
    hasFilter: hasPatientListFilter,
    isLoadingPatients,
    isMergingPatient,
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    isSubmittingPatient,
    onClearPatientFilters: clearPatientFilters,
    onCreatePatient: handleCreatePatient,
    onMergePatient: handleMergeSelectedPatient,
    onPatientFormChange: setPatientForm,
    onPatientMergeFormChange: setPatientMergeForm,
    onPatientRefresh: loadPatients,
    onPatientSearchTermChange: setPatientSearchTerm,
    onPatientSelect: setSelectedPatientId,
    onPatientStatusFilterChange: setPatientStatusFilter
  });
  const interopPanels = buildInteropPanelRenderers({
    consentReference: defaultTransferContext.consentReference,
    consents,
    deliveryAttemptWarning: recordTransferDeliveryAttemptWarning,
    deliveryAttempts: recordTransferDeliveryAttempts,
    form: recordTransferForm,
    isLoadingConsents,
    isLoadingDeliveryAttempts: isLoadingRecordTransferDeliveryAttempts,
    isLoadingProviderDirectory,
    isLoadingRecordTransfers,
    isPatientMerged: isSelectedPatientMerged,
    isSubmittingRecordTransfer,
    isWriteDisabled: selectedPatientWriteDisabled,
    providerDirectory,
    recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
    recordTransfers,
    revokingConsentId,
    selectedRecordTransfer: workspaceSelection.selectedRecordTransfer,
    selectedRecordTransferId,
    transitioningRecordTransferId,
    onCreateRecordTransfer: handleCreateRecordTransfer,
    onFailRecordTransfer: handleFailRecordTransfer,
    onLoadConsentFhirPreview: loadConsentFhirPreview,
    onProviderDirectoryRefresh: loadProviderDirectory,
    onReceiveRecordTransfer: handleReceiveRecordTransfer,
    onRecordTransferFormChange: setRecordTransferForm,
    onRetryRecordTransfer: handleRetryRecordTransfer,
    onRevokeConsent: handleRevokeConsent,
    onSelectRecordTransfer: setSelectedRecordTransferId,
    onSendRecordTransfer: handleSendRecordTransfer
  });
  const auditPanels = buildAuditPanelRenderers({
    auditEvents,
    auditFhirBundlePreview,
    auditIntegrityReport,
    canReadAudit,
    globalAuditEvents,
    isExportingAuditFhir,
    isLoadingAuditEvents,
    isLoadingGlobalAuditEvents,
    isVerifyingAuditIntegrity,
    selectedPatientId: selectedPatient?.id,
    onExportAuditFhir: loadAuditFhirBundle,
    onLoadAuditEvents: loadAuditEvents,
    onReloadGlobalAuditEvents: loadGlobalAuditEvents,
    onVerifyAuditIntegrity: verifyAuditIntegrity
  });
  const clinicalRecordPanels = buildClinicalRecordPanelRenderers({
    collections: patientWorkspaceCollections,
    forms: {
      allergyIntolerance: allergyIntoleranceForm,
      condition: conditionForm,
      diagnosticReport: diagnosticReportForm,
      encounter: encounterForm,
      imagingStudy: imagingStudyForm,
      medicationAdministration: medicationAdministrationForm,
      medicationDispense: medicationDispenseForm,
      medicationRequest: medicationRequestForm,
      observation: observationForm,
      procedure: procedureForm,
      serviceRequest: serviceRequestForm
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
      onAllergyIntoleranceFormChange: setAllergyIntoleranceForm,
      onConditionFormChange: setConditionForm,
      onDiagnosticReportFormChange: setDiagnosticReportForm,
      onEncounterFormChange: setEncounterForm,
      onImagingStudyFormChange: setImagingStudyForm,
      onMedicationAdministrationFormChange: setMedicationAdministrationForm,
      onMedicationDispenseFormChange: setMedicationDispenseForm,
      onMedicationRequestFormChange: setMedicationRequestForm,
      onObservationFormChange: setObservationForm,
      onProcedureFormChange: setProcedureForm,
      onServiceRequestFormChange: setServiceRequestForm,
      onSelectAllergyIntolerance: setSelectedAllergyIntoleranceId,
      onSelectCondition: setSelectedConditionId,
      onSelectDiagnosticReport: setSelectedDiagnosticReportId,
      onSelectEncounter: setSelectedEncounterId,
      onSelectImagingStudy: setSelectedImagingStudyId,
      onSelectMedicationAdministration: setSelectedMedicationAdministrationId,
      onSelectMedicationDispense: setSelectedMedicationDispenseId,
      onSelectMedicationRequest: setSelectedMedicationRequestId,
      onSelectObservation: setSelectedObservationId,
      onSelectProcedure: setSelectedProcedureId,
      onSelectServiceRequest: setSelectedServiceRequestId,
      onSelectWorkflowTask: setSelectedWorkflowTaskId
    },
    isFinishingEncounter,
    isWriteDisabled: selectedPatientWriteDisabled,
    loading: {
      allergyIntolerances: isLoadingAllergyIntolerances,
      conditions: isLoadingConditions,
      diagnosticReports: isLoadingDiagnosticReports,
      encounters: isLoadingEncounters,
      imagingStudies: isLoadingImagingStudies,
      medicationAdministrations: isLoadingMedicationAdministrations,
      medicationDispenses: isLoadingMedicationDispenses,
      medicationRequests: isLoadingMedicationRequests,
      observations: isLoadingObservations,
      procedures: isLoadingProcedures,
      serviceRequests: isLoadingServiceRequests,
      workflowTasks: isLoadingWorkflowTasks
    },
    selectedIds: {
      allergyIntolerance: selectedAllergyIntoleranceId,
      condition: selectedConditionId,
      diagnosticReport: selectedDiagnosticReportId,
      encounter: selectedEncounterId,
      imagingStudy: selectedImagingStudyId,
      medicationAdministration: selectedMedicationAdministrationId,
      medicationDispense: selectedMedicationDispenseId,
      medicationRequest: selectedMedicationRequestId,
      observation: selectedObservationId,
      procedure: selectedProcedureId,
      serviceRequest: selectedServiceRequestId,
      workflowTask: selectedWorkflowTaskId
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
      allergyIntolerance: isSubmittingAllergyIntolerance,
      condition: isSubmittingCondition,
      diagnosticReport: isSubmittingDiagnosticReport,
      encounter: isSubmittingEncounter,
      imagingStudy: isSubmittingImagingStudy,
      medicationAdministration: isSubmittingMedicationAdministration,
      medicationDispense: isSubmittingMedicationDispense,
      medicationRequest: isSubmittingMedicationRequest,
      observation: isSubmittingObservation,
      procedure: isSubmittingProcedure,
      serviceRequest: isSubmittingServiceRequest
    }
  });
  const clinicalDocumentPanels = buildClinicalDocumentPanelRenderers({
    clinicalDocuments,
    documentTaxonomy,
    encounters,
    form: documentForm,
    isLoading: isLoadingDocuments,
    isSelectedPatientMerged,
    isSigningDocument,
    isSubmitting: isSubmittingDocument,
    isWriteDisabled: selectedPatientWriteDisabled,
    selectedDocument: workspaceSelection.selectedDocument,
    selectedDocumentId,
    onCreateDocument: handleCreateClinicalDocument,
    onDocumentFormChange: setDocumentForm,
    onSelectDocument: setSelectedDocumentId,
    onSignDocument: handleSignClinicalDocument
  });
  const routePanels = buildAppRoutePanels({
    auditPanels,
    clinicalDocumentPanels,
    clinicalRecordPanels,
    interopPanels,
    patientPanels
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (isIntegrationSession) {
      void loadCapabilityStatement();
      return;
    }

    void loadPatients();
    void loadCapabilityStatement();
    if (canViewRuntimeInfo) {
      void loadApiRuntimeInfo();
    } else {
      setApiRuntimeInfo(undefined);
      setApiRuntimeWarning(undefined);
    }
    void loadProviderDirectory();
  }, [canViewRuntimeInfo, isAuthenticated, isIntegrationSession]);

  useEffect(() => {
    if (!isAuthenticated || !canReadAudit) {
      setGlobalAuditEvents([]);
      return;
    }

    void loadGlobalAuditEvents({ silent: true });
  }, [isAuthenticated, authSession?.actor.role]);

  useEffect(() => {
    if (!isAuthenticated || !selectedPatientId) {
      clearPatientWorkspaceState();
      return;
    }

    void loadPatientWorkspace(selectedPatientId);
  }, [isAuthenticated, selectedPatientId]);

  useEffect(() => {
    const updateEncounterScopedForm = buildEncounterScopedFormUpdater(selectedEncounterId);

    setDocumentForm(updateEncounterScopedForm);
    setAllergyIntoleranceForm(updateEncounterScopedForm);
    setConditionForm(updateEncounterScopedForm);
    setObservationForm(updateEncounterScopedForm);
    setMedicationRequestForm(updateEncounterScopedForm);
    setMedicationDispenseForm(updateEncounterScopedForm);
    setMedicationAdministrationForm(updateEncounterScopedForm);
    setServiceRequestForm(updateEncounterScopedForm);
    setProcedureForm(updateEncounterScopedForm);
    setDiagnosticReportForm(updateEncounterScopedForm);
    setImagingStudyForm(updateEncounterScopedForm);

    if (!selectedEncounterId) {
      setEncounterFhirPreview(undefined);
      return;
    }

    void loadEncounterFhirPreview(selectedEncounterId);
  }, [selectedEncounterId]);

  useEffect(() => {
    if (!selectedDocumentId) {
      setDocumentFhirPreview(undefined);
      setDocumentProvenanceFhirPreview(undefined);
      return;
    }

    void loadDocumentFhirPreview(selectedDocumentId);
    if (workspaceSelection.selectedDocument?.status === "signed") {
      void loadDocumentProvenanceFhirPreview(selectedDocumentId);
      return;
    }

    setDocumentProvenanceFhirPreview({
      note: "FHIR Provenance chỉ được xuất khi tài liệu đã ký/xác nhận."
    });
  }, [selectedDocumentId, workspaceSelection.selectedDocument?.status]);

  useEffect(() => {
    if (!selectedConditionId) {
      setConditionFhirPreview(undefined);
      return;
    }

    void loadConditionFhirPreview(selectedConditionId);
  }, [selectedConditionId]);

  useEffect(() => {
    if (!selectedAllergyIntoleranceId) {
      setAllergyIntoleranceFhirPreview(undefined);
      return;
    }

    void loadAllergyIntoleranceFhirPreview(selectedAllergyIntoleranceId);
  }, [selectedAllergyIntoleranceId]);

  useEffect(() => {
    if (!selectedObservationId) {
      setObservationFhirPreview(undefined);
      return;
    }

    void loadObservationFhirPreview(selectedObservationId);
  }, [selectedObservationId]);

  useEffect(() => {
    if (!selectedMedicationRequestId) {
      setMedicationRequestFhirPreview(undefined);
      return;
    }

    void loadMedicationRequestFhirPreview(selectedMedicationRequestId);
  }, [selectedMedicationRequestId]);

  useEffect(() => {
    if (!selectedMedicationDispenseId) {
      setMedicationDispenseFhirPreview(undefined);
      return;
    }

    void loadMedicationDispenseFhirPreview(selectedMedicationDispenseId);
  }, [selectedMedicationDispenseId]);

  useEffect(() => {
    if (!selectedMedicationAdministrationId) {
      setMedicationAdministrationFhirPreview(undefined);
      return;
    }

    void loadMedicationAdministrationFhirPreview(selectedMedicationAdministrationId);
  }, [selectedMedicationAdministrationId]);

  useEffect(() => {
    if (!selectedServiceRequestId) {
      setServiceRequestFhirPreview(undefined);
      return;
    }

    void loadServiceRequestFhirPreview(selectedServiceRequestId);
  }, [selectedServiceRequestId]);

  useEffect(() => {
    if (!selectedWorkflowTaskId) {
      setWorkflowTaskFhirPreview(undefined);
      return;
    }

    void loadWorkflowTaskFhirPreview(selectedWorkflowTaskId);
  }, [selectedWorkflowTaskId]);

  useEffect(() => {
    if (!selectedProcedureId) {
      setProcedureFhirPreview(undefined);
      return;
    }

    void loadProcedureFhirPreview(selectedProcedureId);
  }, [selectedProcedureId]);

  useEffect(() => {
    if (!selectedDiagnosticReportId) {
      setDiagnosticReportFhirPreview(undefined);
      return;
    }

    void loadDiagnosticReportFhirPreview(selectedDiagnosticReportId);
  }, [selectedDiagnosticReportId]);

  useEffect(() => {
    if (!selectedImagingStudyId) {
      setImagingStudyFhirPreview(undefined);
      return;
    }

    void loadImagingStudyFhirPreview(selectedImagingStudyId);
  }, [selectedImagingStudyId]);

  useEffect(() => {
    if (!selectedRecordTransferId) {
      setRecordTransferFhirTaskPreview(undefined);
      setRecordTransferDeliveryAttempts([]);
      setRecordTransferDeliveryAttemptWarning(undefined);
      setIsLoadingRecordTransferDeliveryAttempts(false);
      return;
    }

    if (!recordTransfers.some((recordTransfer) => recordTransfer.id === selectedRecordTransferId)) {
      setRecordTransferFhirTaskPreview(undefined);
      setRecordTransferDeliveryAttempts([]);
      setRecordTransferDeliveryAttemptWarning(undefined);
      setIsLoadingRecordTransferDeliveryAttempts(false);
      return;
    }

    void loadRecordTransferFhirTaskPreview(selectedRecordTransferId);
    void loadRecordTransferDeliveryAttempts(selectedRecordTransferId);
  }, [selectedRecordTransferId, recordTransfers]);

  function clearPatientWorkspaceState() {
    setPatientFhirPreview(undefined);
    setPatientFhirBundlePreview(undefined);
    setPatientFhirDocumentBundlePreview(undefined);
    setCapabilityStatementPreview(undefined);
    setConsentFhirPreview(undefined);
    setEncounterFhirPreview(undefined);
    setRecordTransferFhirTaskPreview(undefined);
    setDocumentFhirPreview(undefined);
    setAllergyIntoleranceFhirPreview(undefined);
    setConditionFhirPreview(undefined);
    setObservationFhirPreview(undefined);
    setMedicationRequestFhirPreview(undefined);
    setMedicationDispenseFhirPreview(undefined);
    setMedicationAdministrationFhirPreview(undefined);
    setServiceRequestFhirPreview(undefined);
    setWorkflowTaskFhirPreview(undefined);
    setProcedureFhirPreview(undefined);
    setDiagnosticReportFhirPreview(undefined);
    setImagingStudyFhirPreview(undefined);
    setEncounters([]);
    setClinicalDocuments([]);
    setAllergyIntolerances([]);
    setConditions([]);
    setObservations([]);
    setMedicationRequests([]);
    setMedicationDispenses([]);
    setMedicationAdministrations([]);
    setServiceRequests([]);
    setWorkflowTasks([]);
    setProcedures([]);
    setDiagnosticReports([]);
    setImagingStudies([]);
    setAuditEvents([]);
    setAuditIntegrityReport(undefined);
    setAuditFhirBundlePreview(undefined);
    setConsents([]);
    setRecordTransfers([]);
    setRecordTransferDeliveryAttempts([]);
    setRecordTransferDeliveryAttemptWarning(undefined);
    setSelectedEncounterId(undefined);
    setSelectedDocumentId(undefined);
    setSelectedAllergyIntoleranceId(undefined);
    setSelectedConditionId(undefined);
    setSelectedObservationId(undefined);
    setSelectedMedicationRequestId(undefined);
    setSelectedMedicationDispenseId(undefined);
    setSelectedMedicationAdministrationId(undefined);
    setSelectedServiceRequestId(undefined);
    setSelectedWorkflowTaskId(undefined);
    setSelectedProcedureId(undefined);
    setSelectedDiagnosticReportId(undefined);
    setSelectedImagingStudyId(undefined);
    setSelectedRecordTransferId(undefined);
  }

  async function loadPatientWorkspace(patientId: string) {
    if (isAuditOnlySession) {
      await loadAuditEvents(patientId, { silent: true });
      return;
    }

    const workspaceTasks = [
      loadPatientFhirPreview(patientId),
      loadPatientFhirBundlePreview(patientId),
      loadPatientFhirDocumentBundlePreview(patientId),
      loadEncounters(patientId),
      loadAllergyIntolerances(patientId),
      loadConditions(patientId),
      loadObservations(patientId),
      loadMedicationRequests(patientId),
      loadMedicationDispenses(patientId),
      loadMedicationAdministrations(patientId),
      loadServiceRequests(patientId),
      loadWorkflowTasks(patientId),
      loadProcedures(patientId),
      loadDiagnosticReports(patientId),
      loadImagingStudies(patientId),
      loadClinicalDocuments(patientId),
      loadConsents(patientId),
      loadConsentFhirPreview(defaultTransferContext.consentReference),
      loadRecordTransfers(patientId)
    ];

    if (canReadAudit) {
      workspaceTasks.push(loadAuditEvents(patientId, { silent: true }));
    } else {
      setAuditEvents([]);
      setAuditIntegrityReport(undefined);
    }

    await Promise.all(workspaceTasks);
  }

  async function handleLogin(event?: FormEvent<HTMLFormElement>) {
    const shouldOpenLoginOnFailure = !event;

    event?.preventDefault();

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError("Vui lòng nhập tài khoản và mật khẩu demo.");
      return;
    }

    try {
      setLoginError(undefined);
      setStatusMessage("Đang xác thực phiên đăng nhập...");

      const session = await loginDemoSession(clinicalApi, loginForm);
      setAuthSession(session);
      setIsAuthenticated(true);
      setAppRoute(session.actor.role === "auditor" ? "audit" : "dashboard");
      setStatusMessage(
        `Đã đăng nhập ${session.actor.displayName}; phiên hết hạn ${formatDateTime(session.expiresAt)}.`
      );
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Không thể đăng nhập phiên demo."
      );
      setStatusMessage("Đăng nhập thất bại.");

      if (shouldOpenLoginOnFailure) {
        setAppRoute("login");
      }
    }
  }

  function handleLogout() {
    setAuthSession(undefined);
    setIsAuthenticated(false);
    setAppRoute("landing");
    setStatusMessage("Đã đăng xuất khỏi phiên demo.");
    setPatients([]);
    clearPatientWorkspaceState();
    setGlobalAuditEvents([]);
    setApiRuntimeInfo(undefined);
    setApiRuntimeWarning(undefined);
    setProviderDirectory(undefined);
    setProviderDirectoryFhirPreview(undefined);
    setSelectedPatientId(undefined);
    setTransitioningRecordTransferId(undefined);
  }

  async function handleCreateClinicalDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo tài liệu bệnh án.");
      return;
    }

    if (!ensureSelectedPatientWritable()) return;

    const commandDraft = buildCreateClinicalDocumentCommandDraft(documentForm, selectedPatient.id);

    if (!commandDraft.ok) { setStatusMessage(commandDraft.message); return; }

    setIsSubmittingDocument(true);

    try {
      const createdDocument = await createClinicalDocument(clinicalApi, selectedPatient.id, commandDraft.command);
      await loadClinicalDocuments(selectedPatient.id, createdDocument.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("documents");
      setStatusMessage(`Đã tạo tài liệu "${createdDocument.title}" ở trạng thái nháp.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo tài liệu bệnh án: ${error.message}`
          : "Không thể tạo tài liệu bệnh án."
      );
    } finally {
      setIsSubmittingDocument(false);
    }
  }

  async function handleSignClinicalDocument(documentId: string) {
    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSigningDocument(true);

    try {
      const signedDocument = await signClinicalDocument(clinicalApi, documentId);
      await loadClinicalDocuments(signedDocument.patientId, signedDocument.id);
      await loadDocumentFhirPreview(signedDocument.id);
      await loadDocumentProvenanceFhirPreview(signedDocument.id);
      await loadAuditEvents(signedDocument.patientId, { silent: true });
      setStatusMessage(`Đã ký tài liệu "${signedDocument.title}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ký tài liệu bệnh án: ${error.message}`
          : "Không thể ký tài liệu bệnh án."
      );
    } finally {
      setIsSigningDocument(false);
    }
  }

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
        apiRuntimeInfo={apiRuntimeInfo}
        apiRuntimeWarning={apiRuntimeWarning}
        appRoute={appRoute}
        authSession={authSession}
        canMergePatients={canMergePatients}
        canViewRuntimeInfo={canViewRuntimeInfo}
        dashboardMetrics={dashboardMetrics}
        fhirPreviews={{
          allergyIntolerance: allergyIntoleranceFhirPreview,
          capabilityStatement: capabilityStatementPreview,
          condition: conditionFhirPreview,
          consent: consentFhirPreview,
          diagnosticReport: diagnosticReportFhirPreview,
          document: documentFhirPreview,
          documentProvenance: documentProvenanceFhirPreview,
          encounter: encounterFhirPreview,
          imagingStudy: imagingStudyFhirPreview,
          medicationAdministration: medicationAdministrationFhirPreview,
          medicationDispense: medicationDispenseFhirPreview,
          medicationRequest: medicationRequestFhirPreview,
          observation: observationFhirPreview,
          patient: patientFhirPreview,
          patientBundle: patientFhirBundlePreview,
          patientDocumentBundle: patientFhirDocumentBundlePreview,
          procedure: procedureFhirPreview,
          providerDirectory: providerDirectoryFhirPreview,
          recordTransferTask: recordTransferFhirTaskPreview,
          serviceRequest: serviceRequestFhirPreview,
          workflowTask: workflowTaskFhirPreview
        }}
        gatewayAcknowledgementForm={gatewayAcknowledgementForm}
        gatewayAcknowledgementResult={gatewayAcknowledgementResult}
        isIntegrationSession={isIntegrationSession}
        isSubmittingGatewayAcknowledgement={isSubmittingGatewayAcknowledgement}
        latestEncounterServiceType={encounters[0]?.serviceType}
        loginForm={loginForm}
        panels={routePanels}
        referenceSignals={referenceSignals}
        selectedPatient={selectedPatient}
        workflowSteps={workflowSteps}
        onGatewayAcknowledgementFormChange={setGatewayAcknowledgementForm}
        onGatewayAcknowledgementSubmit={(event) =>
          void handleGatewayAcknowledgementSubmit(event)
        }
        onNavigate={setAppRoute}
        onReloadRuntimeInfo={() => void loadApiRuntimeInfo()}
      />
    </AuthenticatedLayout>
  );

  function clearPatientFilters() {
    setPatientSearchTerm("");
    setPatientStatusFilter("all");
  }

}
