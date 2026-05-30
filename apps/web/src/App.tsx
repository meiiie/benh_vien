import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import {
  loginPresets,
  type DemoRole,
  type LoginForm
} from "./auth/demoLogin.js";
import { loginDemoSession } from "./auth/authApi.js";
import {
  createClinicalApiClient,
  isApiHttpError
} from "./api/clinicalApi.js";
import {
  exportPatientAuditFhirBundle,
  listGlobalAuditEvents,
  listPatientAuditEvents,
  verifyPatientAuditIntegrity
} from "./features/audit/auditApi.js";
import {
  AuthenticatedLayout,
  Info,
  PageHeader
} from "./components/AppShell.js";
import { GlobalAuditPanel, PatientAuditPanel } from "./features/audit/AuditPanels.js";
import {
  createClinicalDocument,
  exportClinicalDocumentFhir,
  exportClinicalDocumentProvenanceFhir,
  listClinicalDocuments,
  signClinicalDocument
} from "./features/clinical-documents/clinicalDocumentApi.js";
import { ClinicalDocumentPanel } from "./features/clinical-documents/ClinicalDocumentPanel.js";
import {
  createAllergyIntolerance,
  createCondition,
  createDiagnosticReport,
  createEncounter,
  createImagingStudy,
  createMedicationAdministration,
  createMedicationDispense,
  createMedicationRequest,
  createObservation,
  createProcedure,
  createServiceRequest,
  exportAllergyIntoleranceFhir,
  exportConditionFhir,
  exportDiagnosticReportFhir,
  exportEncounterFhir,
  exportImagingStudyFhir,
  exportMedicationAdministrationFhir,
  exportMedicationDispenseFhir,
  exportMedicationRequestFhir,
  exportObservationFhir,
  exportProcedureFhir,
  exportServiceRequestFhir,
  exportWorkflowTaskFhir,
  finishEncounter,
  listAllergyIntolerances,
  listConditions,
  listDiagnosticReports,
  listEncounters,
  listImagingStudies,
  listMedicationAdministrations,
  listMedicationDispenses,
  listMedicationRequests,
  listObservations,
  listProcedures,
  listServiceRequests,
  listWorkflowTasks
} from "./features/clinical-records/clinicalRecordApi.js";
import {
  buildMedicationAdministrationCommand,
  buildMedicationDispenseCommand,
  buildMedicationRequestCommand
} from "./features/clinical-records/medicationCommandBuilders.js";
import {
  buildDiagnosticReportCommand,
  buildImagingStudyCommand,
  buildProcedureCommand,
  buildServiceRequestCommand
} from "./features/clinical-records/carePlanCommandBuilders.js";
import {
  buildAllergyIntoleranceCommand,
  buildConditionCommand,
  buildEncounterCommand,
  buildObservationCommand
} from "./features/clinical-records/clinicalEntryCommandBuilders.js";
import { AllergyIntolerancePanel } from "./features/clinical-records/AllergyIntolerancePanel.js";
import { ConditionPanel } from "./features/clinical-records/ConditionPanel.js";
import { DiagnosticReportPanel } from "./features/clinical-records/DiagnosticReportPanel.js";
import { EncounterPanel } from "./features/clinical-records/EncounterPanel.js";
import { ImagingStudyPanel } from "./features/clinical-records/ImagingStudyPanel.js";
import { MedicationAdministrationPanel } from "./features/clinical-records/MedicationAdministrationPanel.js";
import { MedicationDispensePanel } from "./features/clinical-records/MedicationDispensePanel.js";
import { MedicationRequestPanel } from "./features/clinical-records/MedicationRequestPanel.js";
import { ObservationPanel } from "./features/clinical-records/ObservationPanel.js";
import { ProcedurePanel } from "./features/clinical-records/ProcedurePanel.js";
import { ServiceRequestPanel } from "./features/clinical-records/ServiceRequestPanel.js";
import { WorkflowTaskPanel } from "./features/clinical-records/WorkflowTaskPanel.js";
import {
  exportConsentFhir,
  listPatientConsents,
  revokePatientConsent
} from "./features/consents/consentApi.js";
import { ConsentInteropPanel } from "./features/consents/ConsentInteropPanel.js";
import {
  createPatient,
  exportPatientFhir,
  exportPatientFhirBundle,
  exportPatientFhirDocumentBundle,
  listPatients,
  mergePatient
} from "./features/patient-registry/patientRegistryApi.js";
import { buildPatientPanelRenderers } from "./features/patient-registry/patientPanelRenderers.js";
import { buildPatientRegistrySelection } from "./features/patient-registry/patientRegistrySelectors.js";
import {
  getApiRuntimeInfo,
  getFhirCapabilityStatement
} from "./features/platform/platformApi.js";
import {
  exportProviderDirectoryFhir,
  getProviderDirectory
} from "./features/provider-directory/providerDirectoryApi.js";
import { ProviderDirectoryPanel } from "./features/provider-directory/ProviderDirectoryPanel.js";
import {
  acknowledgeRecordTransfer,
  createRecordTransfer,
  exportRecordTransferFhirTask,
  failRecordTransfer,
  listRecordTransferDeliveryAttempts,
  listRecordTransfers,
  receiveRecordTransfer,
  retryRecordTransfer,
  sendRecordTransfer
} from "./features/record-transfers/recordTransferApi.js";
import { RecordTransferInteropPanel } from "./features/record-transfers/RecordTransferInteropPanel.js";
import { formatAuditIntegrityReason } from "./lib/auditFormatters.js";
import {
  formatDateTime,
  isMissingRecordTransferDeliveryAttemptsRoute,
  resolveSelectedRecordTransferId,
  toApiDateTime
} from "./lib/clinicalFormatters.js";
import { loadFhirPreview } from "./lib/fhirPreviewLoader.js";
import { loadPatientScopedCollection } from "./lib/patientScopedCollectionLoader.js";
import { LandingPage } from "./pages/LandingPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { AppRouteRenderer } from "./pages/AppRouteRenderer.js";
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
  PatientIdentifier,
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
      return;
    }

    void loadPatientWorkspace(selectedPatientId);
  }, [isAuthenticated, selectedPatientId]);

  useEffect(() => {
    if (!selectedEncounterId) {
      setEncounterFhirPreview(undefined);
      setDocumentForm((current) => ({ ...current, encounterId: "" }));
      setAllergyIntoleranceForm((current) => ({ ...current, encounterId: "" }));
      setConditionForm((current) => ({ ...current, encounterId: "" }));
      setObservationForm((current) => ({ ...current, encounterId: "" }));
      setMedicationRequestForm((current) => ({ ...current, encounterId: "" }));
      setMedicationDispenseForm((current) => ({ ...current, encounterId: "" }));
      setMedicationAdministrationForm((current) => ({ ...current, encounterId: "" }));
      setServiceRequestForm((current) => ({ ...current, encounterId: "" }));
      setProcedureForm((current) => ({ ...current, encounterId: "" }));
      setDiagnosticReportForm((current) => ({ ...current, encounterId: "" }));
      setImagingStudyForm((current) => ({ ...current, encounterId: "" }));
      return;
    }

    setDocumentForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setAllergyIntoleranceForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setConditionForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setObservationForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setMedicationRequestForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setMedicationDispenseForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setMedicationAdministrationForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setServiceRequestForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setProcedureForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setDiagnosticReportForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setImagingStudyForm((current) => ({ ...current, encounterId: selectedEncounterId }));
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

  async function loadPatients(nextSelectedId?: string) {
    setIsLoadingPatients(true);

    try {
      const data = await listPatients(clinicalApi, isAuditOnlySession ? "AUDIT" : "TREATMENT");
      setPatients(data.items);
      setSelectedPatientId(nextSelectedId ?? selectedPatientId ?? data.items[0]?.id);
      setStatusMessage(`Đã tải ${data.items.length} hồ sơ bệnh nhân từ backend.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải dữ liệu bệnh nhân: ${error.message}`
          : "Không thể tải dữ liệu bệnh nhân."
      );
    } finally {
      setIsLoadingPatients(false);
    }
  }

  async function loadProviderDirectory() {
    setIsLoadingProviderDirectory(true);

    try {
      if (isAuditOnlySession) {
        const directory = await getProviderDirectory(clinicalApi, "AUDIT");
        setProviderDirectory(directory);
        setProviderDirectoryFhirPreview({
          note: "Phiên kiểm toán chỉ tải danh bạ vận hành; không xuất FHIR Provider Directory."
        });
        return;
      }

      const [directory, fhirPreview] = await Promise.all([
        getProviderDirectory(clinicalApi, "TREATMENT"),
        exportProviderDirectoryFhir(clinicalApi)
      ]);

      setProviderDirectory(directory);
      setProviderDirectoryFhirPreview(fhirPreview);
    } catch (error) {
      setProviderDirectory(undefined);
      setProviderDirectoryFhirPreview({
        error:
          error instanceof Error
            ? `Không thể tải Provider Directory: ${error.message}`
            : "Không thể tải Provider Directory."
      });
    } finally {
      setIsLoadingProviderDirectory(false);
    }
  }

  async function loadCapabilityStatement() {
    try {
      setCapabilityStatementPreview(await getFhirCapabilityStatement(clinicalApi));
    } catch (error) {
      setCapabilityStatementPreview({
        error:
          error instanceof Error
            ? `Không thể tải FHIR CapabilityStatement: ${error.message}`
            : "Không thể tải FHIR CapabilityStatement."
      });
    }
  }

  async function loadApiRuntimeInfo() {
    try {
      const runtimeInfo = await getApiRuntimeInfo(
        clinicalApi,
        authSession ? (authSession.actor.role === "auditor" ? "AUDIT" : "OPERATIONS") : undefined
      );
      setApiRuntimeInfo(runtimeInfo);
      setApiRuntimeWarning(undefined);
    } catch (error) {
      if (isApiHttpError(error) && error.status === 404) {
        setApiRuntimeInfo(undefined);
        setApiRuntimeWarning(
          "API runtime metadata chưa có trong backend đang chạy. Hãy khởi động lại backend mới nhất nếu cần kiểm tra phiên bản và trạng thái worker."
        );
        return;
      }

      setApiRuntimeInfo(undefined);
      setApiRuntimeWarning(
        error instanceof Error
          ? `Không thể đọc runtime metadata: ${error.message}`
          : "Không thể đọc runtime metadata."
      );
    }
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

  async function loadEncounters(patientId: string, nextSelectedEncounterId?: string) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải lượt khám",
      listItems: () => listEncounters(clinicalApi, patientId),
      nextSelectedId: nextSelectedEncounterId,
      setItems: setEncounters,
      setLoading: setIsLoadingEncounters,
      setSelectedId: setSelectedEncounterId,
      setStatusMessage
    });
  }

  async function loadClinicalDocuments(patientId: string, nextSelectedDocumentId?: string) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải tài liệu bệnh án",
      listItems: () => listClinicalDocuments(clinicalApi, patientId),
      nextSelectedId: nextSelectedDocumentId,
      setItems: setClinicalDocuments,
      setLoading: setIsLoadingDocuments,
      setSelectedId: setSelectedDocumentId,
      setStatusMessage
    });
  }

  async function loadAllergyIntolerances(
    patientId: string,
    nextSelectedAllergyIntoleranceId?: string
  ) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải dị ứng/cảnh báo",
      listItems: () => listAllergyIntolerances(clinicalApi, patientId),
      nextSelectedId: nextSelectedAllergyIntoleranceId,
      setItems: setAllergyIntolerances,
      setLoading: setIsLoadingAllergyIntolerances,
      setSelectedId: setSelectedAllergyIntoleranceId,
      setStatusMessage
    });
  }

  async function loadConditions(patientId: string, nextSelectedConditionId?: string) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải chẩn đoán/vấn đề sức khỏe",
      listItems: () => listConditions(clinicalApi, patientId),
      nextSelectedId: nextSelectedConditionId,
      setItems: setConditions,
      setLoading: setIsLoadingConditions,
      setSelectedId: setSelectedConditionId,
      setStatusMessage
    });
  }

  async function loadObservations(patientId: string, nextSelectedObservationId?: string) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải chỉ số lâm sàng",
      listItems: () => listObservations(clinicalApi, patientId),
      nextSelectedId: nextSelectedObservationId,
      setItems: setObservations,
      setLoading: setIsLoadingObservations,
      setSelectedId: setSelectedObservationId,
      setStatusMessage
    });
  }

  async function loadMedicationRequests(
    patientId: string,
    nextSelectedMedicationRequestId?: string
  ) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải chỉ định thuốc",
      listItems: () => listMedicationRequests(clinicalApi, patientId),
      nextSelectedId: nextSelectedMedicationRequestId,
      setItems: setMedicationRequests,
      setLoading: setIsLoadingMedicationRequests,
      setSelectedId: setSelectedMedicationRequestId,
      setStatusMessage
    });
  }

  async function loadMedicationDispenses(
    patientId: string,
    nextSelectedMedicationDispenseId?: string
  ) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải cấp phát thuốc",
      listItems: () => listMedicationDispenses(clinicalApi, patientId),
      nextSelectedId: nextSelectedMedicationDispenseId,
      setItems: setMedicationDispenses,
      setLoading: setIsLoadingMedicationDispenses,
      setSelectedId: setSelectedMedicationDispenseId,
      setStatusMessage
    });
  }

  async function loadMedicationAdministrations(
    patientId: string,
    nextSelectedMedicationAdministrationId?: string
  ) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải lần dùng thuốc",
      listItems: () => listMedicationAdministrations(clinicalApi, patientId),
      nextSelectedId: nextSelectedMedicationAdministrationId,
      setItems: setMedicationAdministrations,
      setLoading: setIsLoadingMedicationAdministrations,
      setSelectedId: setSelectedMedicationAdministrationId,
      setStatusMessage
    });
  }

  async function loadServiceRequests(
    patientId: string,
    nextSelectedServiceRequestId?: string
  ) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải chỉ định dịch vụ",
      listItems: () => listServiceRequests(clinicalApi, patientId),
      nextSelectedId: nextSelectedServiceRequestId,
      setItems: setServiceRequests,
      setLoading: setIsLoadingServiceRequests,
      setSelectedId: setSelectedServiceRequestId,
      setStatusMessage
    });
  }

  async function loadWorkflowTasks(patientId: string, nextSelectedWorkflowTaskId?: string) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải hàng đợi công việc",
      listItems: () => listWorkflowTasks(clinicalApi, patientId),
      nextSelectedId: nextSelectedWorkflowTaskId,
      setItems: setWorkflowTasks,
      setLoading: setIsLoadingWorkflowTasks,
      setSelectedId: setSelectedWorkflowTaskId,
      setStatusMessage
    });
  }

  async function loadProcedures(patientId: string, nextSelectedProcedureId?: string) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải thủ thuật/hoạt động đã thực hiện",
      listItems: () => listProcedures(clinicalApi, patientId),
      nextSelectedId: nextSelectedProcedureId,
      setItems: setProcedures,
      setLoading: setIsLoadingProcedures,
      setSelectedId: setSelectedProcedureId,
      setStatusMessage
    });
  }

  async function loadDiagnosticReports(
    patientId: string,
    nextSelectedDiagnosticReportId?: string
  ) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải báo cáo kết quả",
      listItems: () => listDiagnosticReports(clinicalApi, patientId),
      nextSelectedId: nextSelectedDiagnosticReportId,
      setItems: setDiagnosticReports,
      setLoading: setIsLoadingDiagnosticReports,
      setSelectedId: setSelectedDiagnosticReportId,
      setStatusMessage
    });
  }

  async function loadImagingStudies(patientId: string, nextSelectedImagingStudyId?: string) {
    await loadPatientScopedCollection({
      errorMessage: "Không thể tải nghiên cứu hình ảnh/PACS",
      listItems: () => listImagingStudies(clinicalApi, patientId),
      nextSelectedId: nextSelectedImagingStudyId,
      setItems: setImagingStudies,
      setLoading: setIsLoadingImagingStudies,
      setSelectedId: setSelectedImagingStudyId,
      setStatusMessage
    });
  }

  async function loadAuditEvents(patientId: string, options: { readonly silent?: boolean } = {}) {
    if (!canReadAudit) {
      setAuditEvents([]);
      setAuditIntegrityReport(undefined);
      setAuditFhirBundlePreview(undefined);

      if (!options.silent) {
        setStatusMessage("Nhật ký kiểm toán chỉ mở cho vai trò kiểm toán hoặc quản trị.");
      }

      return;
    }

    setIsLoadingAuditEvents(true);

    try {
      const data = await listPatientAuditEvents(clinicalApi, patientId);
      setAuditEvents(data.items);
    } catch (error) {
      setAuditEvents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải nhật ký kiểm toán: ${error.message}`
          : "Không thể tải nhật ký kiểm toán."
      );
    } finally {
      setIsLoadingAuditEvents(false);
    }
  }

  async function loadGlobalAuditEvents(options: { readonly silent?: boolean } = {}) {
    if (!canReadAudit) {
      setGlobalAuditEvents([]);

      if (!options.silent) {
        setStatusMessage("Nhật ký bảo mật toàn hệ thống chỉ mở cho kiểm toán viên hoặc quản trị viên.");
      }

      return;
    }

    setIsLoadingGlobalAuditEvents(true);

    try {
      const data = await listGlobalAuditEvents(clinicalApi);
      setGlobalAuditEvents(data.items);

      if (!options.silent) {
        setStatusMessage(`Đã tải ${data.items.length} bản ghi kiểm toán toàn hệ thống.`);
      }
    } catch (error) {
      setGlobalAuditEvents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải nhật ký bảo mật toàn hệ thống: ${error.message}`
          : "Không thể tải nhật ký bảo mật toàn hệ thống."
      );
    } finally {
      setIsLoadingGlobalAuditEvents(false);
    }
  }

  async function verifyAuditIntegrity(
    patientId: string,
    options: { readonly silent?: boolean } = {}
  ) {
    if (!canReadAudit) {
      setAuditIntegrityReport(undefined);

      if (!options.silent) {
        setStatusMessage("Kiểm tra toàn vẹn audit chỉ mở cho vai trò kiểm toán hoặc quản trị.");
      }

      return;
    }

    setIsVerifyingAuditIntegrity(true);

    try {
      const data = await verifyPatientAuditIntegrity(clinicalApi, patientId);
      setAuditIntegrityReport(data);

      if (!options.silent) {
        setStatusMessage(
          data.verified
            ? "Chuỗi audit đã được xác minh toàn vẹn."
            : `Chuỗi audit cần kiểm tra: ${formatAuditIntegrityReason(data.brokenReason)}.`
        );
      }
    } catch (error) {
      setAuditIntegrityReport(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể kiểm tra toàn vẹn audit: ${error.message}`
          : "Không thể kiểm tra toàn vẹn audit."
      );
    } finally {
      setIsVerifyingAuditIntegrity(false);
    }
  }

  async function loadAuditFhirBundle(patientId: string) {
    if (!canReadAudit) {
      setAuditFhirBundlePreview(undefined);
      setStatusMessage("Xuất FHIR AuditEvent chỉ mở cho vai trò kiểm toán hoặc quản trị.");
      return;
    }

    setIsExportingAuditFhir(true);

    try {
      setAuditFhirBundlePreview(await exportPatientAuditFhirBundle(clinicalApi, patientId));
      setStatusMessage("Đã xuất FHIR AuditEvent Bundle cho nhật ký kiểm toán.");
    } catch (error) {
      setAuditFhirBundlePreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR AuditEvent Bundle: ${error.message}`
            : "Không thể xuất FHIR AuditEvent Bundle."
      });
    } finally {
      setIsExportingAuditFhir(false);
    }
  }

  async function loadConsents(patientId: string) {
    setIsLoadingConsents(true);

    try {
      const data = await listPatientConsents(clinicalApi, patientId);
      setConsents(data.items);
    } catch (error) {
      setConsents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải đồng ý chia sẻ hồ sơ: ${error.message}`
          : "Không thể tải đồng ý chia sẻ hồ sơ."
      );
    } finally {
      setIsLoadingConsents(false);
    }
  }

  async function handleRevokeConsent(consent: Consent) {
    if (!selectedPatient) {
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setRevokingConsentId(consent.id);

    try {
      const revokedConsent = await revokePatientConsent(
        clinicalApi,
        selectedPatient.id,
        consent.id,
        "Thu hồi theo yêu cầu người bệnh trong phiên demo."
      );
      await loadConsents(selectedPatient.id);
      await loadConsentFhirPreview(revokedConsent.id);
      setStatusMessage(`Đã thu hồi consent ${revokedConsent.id}; các lần xuất/chuyển hồ sơ mới sẽ bị chặn nếu dùng consent này.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể thu hồi consent: ${error.message}`
          : "Không thể thu hồi consent."
      );
    } finally {
      setRevokingConsentId(undefined);
    }
  }

  async function loadRecordTransfers(
    patientId: string,
    nextSelectedRecordTransferId?: string
  ) {
    setIsLoadingRecordTransfers(true);

    try {
      const data = await listRecordTransfers(clinicalApi, patientId);
      setRecordTransfers(data.items);
      setSelectedRecordTransferId(
        resolveSelectedRecordTransferId({
          items: data.items,
          preferredId: nextSelectedRecordTransferId,
          currentId: selectedRecordTransferId
        })
      );
    } catch (error) {
      setRecordTransfers([]);
      setSelectedRecordTransferId(undefined);
      setRecordTransferDeliveryAttempts([]);
      setRecordTransferDeliveryAttemptWarning(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải gói chuyển hồ sơ: ${error.message}`
          : "Không thể tải gói chuyển hồ sơ."
      );
    } finally {
      setIsLoadingRecordTransfers(false);
    }
  }

  async function loadRecordTransferFhirTaskPreview(recordTransferId: string) {
    try {
      const preview = await exportRecordTransferFhirTask(clinicalApi, recordTransferId);

      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      setRecordTransferFhirTaskPreview(preview);
    } catch (error) {
      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      setRecordTransferFhirTaskPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Task chuyển hồ sơ: ${error.message}`
            : "Không thể xuất FHIR Task chuyển hồ sơ."
      });
    }
  }

  async function loadRecordTransferDeliveryAttempts(recordTransferId: string) {
    if (!isCurrentRecordTransferSelection(recordTransferId)) {
      return;
    }

    setIsLoadingRecordTransferDeliveryAttempts(true);
    setRecordTransferDeliveryAttemptWarning(undefined);

    try {
      const data = await listRecordTransferDeliveryAttempts(clinicalApi, recordTransferId);

      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      setRecordTransferDeliveryAttempts(data.items);
      setRecordTransferDeliveryAttemptWarning(undefined);
    } catch (error) {
      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      if (
        isApiHttpError(error) &&
        error.status === 404 &&
        isMissingRecordTransferDeliveryAttemptsRoute(error.payload)
      ) {
        setRecordTransferDeliveryAttempts([]);
        setRecordTransferDeliveryAttemptWarning(
          "API lịch sử gửi chưa sẵn sàng trong runtime hiện tại. Gói chuyển vẫn hiển thị được, nhưng cần khởi động lại backend mới nhất để xem delivery attempt/outbox."
        );
        return;
      }

      setRecordTransferDeliveryAttempts([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải lịch sử gửi hồ sơ: ${error.message}`
          : "Không thể tải lịch sử gửi hồ sơ."
      );
    } finally {
      if (isCurrentRecordTransferSelection(recordTransferId)) {
        setIsLoadingRecordTransferDeliveryAttempts(false);
      }
    }
  }

  function isCurrentRecordTransferSelection(recordTransferId: string): boolean {
    return selectedRecordTransferIdRef.current === recordTransferId;
  }

  async function loadConsentFhirPreview(consentId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Consent",
      exportPreview: () => exportConsentFhir(clinicalApi, consentId),
      setPreview: setConsentFhirPreview
    });
  }

  function buildSelectedPatientMergedReadOnlyMessage(): string {
    if (!selectedPatient) {
      return "Chưa chọn hồ sơ bệnh nhân.";
    }

    const mergeTarget = selectedPatientMergeTarget
      ? `${selectedPatientMergeTarget.fullName} (${selectedPatientMergeTarget.id})`
      : (selectedPatient.mergedIntoPatientId ?? "hồ sơ đích không còn trong danh sách tải về");

    return `Hồ sơ này đã được merge vào ${mergeTarget}. Các thao tác ghi mới bị khóa để bảo toàn lịch sử và tránh ghi nhầm vào hồ sơ nguồn.`;
  }

  function ensureSelectedPatientWritable(): boolean {
    if (!selectedPatientWriteDisabled) {
      return true;
    }

    setStatusMessage(buildSelectedPatientMergedReadOnlyMessage());
    return false;
  }

  async function loadPatientFhirPreview(patientId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Patient",
      exportPreview: () =>
        exportPatientFhir(
          clinicalApi,
          patientId,
          isAuditOnlySession ? "AUDIT" : "TREATMENT"
        ),
      setPreview: setPatientFhirPreview
    });
  }

  async function loadPatientFhirBundlePreview(patientId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Bundle",
      exportPreview: () => exportPatientFhirBundle(clinicalApi, patientId),
      setPreview: setPatientFhirBundlePreview
    });
  }

  async function loadPatientFhirDocumentBundlePreview(patientId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR document Bundle",
      exportPreview: () => exportPatientFhirDocumentBundle(clinicalApi, patientId),
      setPreview: setPatientFhirDocumentBundlePreview
    });
  }

  async function loadEncounterFhirPreview(encounterId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Encounter",
      exportPreview: () => exportEncounterFhir(clinicalApi, encounterId),
      setPreview: setEncounterFhirPreview
    });
  }

  async function loadDocumentFhirPreview(documentId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR DocumentReference",
      exportPreview: () => exportClinicalDocumentFhir(clinicalApi, documentId),
      setPreview: setDocumentFhirPreview
    });
  }

  async function loadDocumentProvenanceFhirPreview(documentId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Provenance",
      exportPreview: () => exportClinicalDocumentProvenanceFhir(clinicalApi, documentId),
      setPreview: setDocumentProvenanceFhirPreview
    });
  }

  async function loadConditionFhirPreview(conditionId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Condition",
      exportPreview: () => exportConditionFhir(clinicalApi, conditionId),
      setPreview: setConditionFhirPreview
    });
  }

  async function loadAllergyIntoleranceFhirPreview(allergyIntoleranceId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR AllergyIntolerance",
      exportPreview: () =>
        exportAllergyIntoleranceFhir(clinicalApi, allergyIntoleranceId),
      setPreview: setAllergyIntoleranceFhirPreview
    });
  }

  async function loadObservationFhirPreview(observationId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Observation",
      exportPreview: () => exportObservationFhir(clinicalApi, observationId),
      setPreview: setObservationFhirPreview
    });
  }

  async function loadMedicationRequestFhirPreview(medicationRequestId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR MedicationRequest",
      exportPreview: () => exportMedicationRequestFhir(clinicalApi, medicationRequestId),
      setPreview: setMedicationRequestFhirPreview
    });
  }

  async function loadMedicationDispenseFhirPreview(medicationDispenseId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR MedicationDispense",
      exportPreview: () => exportMedicationDispenseFhir(clinicalApi, medicationDispenseId),
      setPreview: setMedicationDispenseFhirPreview
    });
  }

  async function loadMedicationAdministrationFhirPreview(
    medicationAdministrationId: string
  ) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR MedicationAdministration",
      exportPreview: () =>
        exportMedicationAdministrationFhir(clinicalApi, medicationAdministrationId),
      setPreview: setMedicationAdministrationFhirPreview
    });
  }

  async function loadServiceRequestFhirPreview(serviceRequestId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR ServiceRequest",
      exportPreview: () => exportServiceRequestFhir(clinicalApi, serviceRequestId),
      setPreview: setServiceRequestFhirPreview
    });
  }

  async function loadWorkflowTaskFhirPreview(taskId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Task",
      exportPreview: () => exportWorkflowTaskFhir(clinicalApi, taskId),
      setPreview: setWorkflowTaskFhirPreview
    });
  }

  async function loadProcedureFhirPreview(procedureId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR Procedure",
      exportPreview: () => exportProcedureFhir(clinicalApi, procedureId),
      setPreview: setProcedureFhirPreview
    });
  }

  async function loadDiagnosticReportFhirPreview(diagnosticReportId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR DiagnosticReport",
      exportPreview: () => exportDiagnosticReportFhir(clinicalApi, diagnosticReportId),
      setPreview: setDiagnosticReportFhirPreview
    });
  }

  async function loadImagingStudyFhirPreview(imagingStudyId: string) {
    await loadFhirPreview({
      errorMessage: "Không thể xuất FHIR ImagingStudy",
      exportPreview: () => exportImagingStudyFhir(clinicalApi, imagingStudyId),
      setPreview: setImagingStudyFhirPreview
    });
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
    setGlobalAuditEvents([]);
    setAuditIntegrityReport(undefined);
    setConsents([]);
    setRecordTransfers([]);
    setRecordTransferDeliveryAttempts([]);
    setRecordTransferDeliveryAttemptWarning(undefined);
    setApiRuntimeInfo(undefined);
    setApiRuntimeWarning(undefined);
    setProviderDirectory(undefined);
    setPatientFhirPreview(undefined);
    setPatientFhirBundlePreview(undefined);
    setPatientFhirDocumentBundlePreview(undefined);
    setCapabilityStatementPreview(undefined);
    setProviderDirectoryFhirPreview(undefined);
    setEncounterFhirPreview(undefined);
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
    setRecordTransferFhirTaskPreview(undefined);
    setSelectedPatientId(undefined);
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
    setTransitioningRecordTransferId(undefined);
  }

  async function handleCreatePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingPatient(true);

    const identifiers: PatientIdentifier[] = [
      {
        system: "urn:gov:vietnam:national-id",
        value: patientForm.nationalId,
        type: "national-id"
      },
      {
        system: "urn:benh-vien-so:mrn",
        value: patientForm.hospitalMrn,
        type: "hospital-mrn"
      }
    ];

    try {
      const createdPatient = await createPatient(clinicalApi, {
        identifiers,
        fullName: patientForm.fullName,
        birthDate: patientForm.birthDate || undefined,
        gender: patientForm.gender,
        address: patientForm.address || undefined,
        phone: patientForm.phone || undefined,
        managingOrganizationId: patientForm.managingOrganizationId
      });
      await loadPatients(createdPatient.id);
      setAppRoute("workspace");
      setStatusMessage(`Đã tạo hồ sơ ${createdPatient.fullName} và chọn ngay trên workspace.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo hồ sơ bệnh nhân: ${error.message}`
          : "Không thể tạo hồ sơ bệnh nhân."
      );
    } finally {
      setIsSubmittingPatient(false);
    }
  }

  async function handleMergeSelectedPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn hồ sơ nguồn trước khi merge.");
      return;
    }

    if (!canMergePatients) {
      setStatusMessage("Chỉ quản trị viên mới được merge hồ sơ bệnh nhân.");
      return;
    }

    if (selectedPatient.status !== "active") {
      setStatusMessage("Chỉ merge được hồ sơ nguồn đang hoạt động.");
      return;
    }

    if (!patientMergeTargetId) {
      setStatusMessage("Cần chọn hồ sơ đích trước khi merge.");
      return;
    }

    if (!patientMergeForm.reason.trim()) {
      setStatusMessage("Cần nhập lý do merge để phục vụ kiểm toán/MPI.");
      return;
    }

    if (!isPatientMergeConfirmationValid) {
      setStatusMessage(`Cần nhập đúng mã xác nhận "${patientMergeConfirmationCode}" trước khi merge.`);
      return;
    }

    setIsMergingPatient(true);

    try {
      const mergedPatient = await mergePatient(clinicalApi, selectedPatient.id, {
        targetPatientId: patientMergeTargetId,
        reason: patientMergeForm.reason.trim()
      });
      await loadPatients(mergedPatient.id);
      await loadPatientWorkspace(mergedPatient.id);
      setPatientMergeForm({
        ...patientMergeForm,
        confirmationText: ""
      });
      setStatusMessage(
        `Đã merge hồ sơ ${mergedPatient.fullName} vào hồ sơ đích ${mergedPatient.mergedIntoPatientId}. Hồ sơ nguồn đã chuyển sang chế độ chỉ đọc.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể merge hồ sơ bệnh nhân: ${error.message}`
          : "Không thể merge hồ sơ bệnh nhân."
      );
    } finally {
      setIsMergingPatient(false);
    }
  }

  async function handleCreateRecordTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo gói chuyển hồ sơ.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingRecordTransfer(true);

    try {
      const createdTransfer = await createRecordTransfer(
        clinicalApi,
        selectedPatient.id,
        recordTransferForm
      );
      await loadRecordTransfers(selectedPatient.id, createdTransfer.id);
      setStatusMessage(
        `Đã tạo gói chuyển hồ sơ ${createdTransfer.id} cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo gói chuyển hồ sơ: ${error.message}`
          : "Không thể tạo gói chuyển hồ sơ."
      );
    } finally {
      setIsSubmittingRecordTransfer(false);
    }
  }

  async function handleSendRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi gửi gói chuyển hồ sơ.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const updatedTransfer = await sendRecordTransfer(clinicalApi, recordTransfer.id, {
        note: "Đã gửi gói hồ sơ qua gateway liên thông demo."
      });
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã gửi gói chuyển hồ sơ ${updatedTransfer.id}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể gửi gói chuyển hồ sơ: ${error.message}`
          : "Không thể gửi gói chuyển hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleReceiveRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi xác nhận tiếp nhận hồ sơ.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const updatedTransfer = await receiveRecordTransfer(clinicalApi, recordTransfer.id, {
        note: "Bệnh viện nhận đã xác nhận tiếp nhận qua giao diện demo."
      });
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã xác nhận bệnh viện nhận tiếp nhận gói ${updatedTransfer.id}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể xác nhận tiếp nhận hồ sơ: ${error.message}`
          : "Không thể xác nhận tiếp nhận hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleGatewayAcknowledgementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const recordTransferId = gatewayAcknowledgementForm.recordTransferId.trim();
    const recipientOrganizationId =
      gatewayAcknowledgementForm.recipientOrganizationId.trim();
    const acknowledgementReference =
      gatewayAcknowledgementForm.acknowledgementReference.trim();

    if (!recordTransferId || !recipientOrganizationId || !acknowledgementReference) {
      setStatusMessage(
        "Callback gateway cần mã gói chuyển, cơ sở nhận và mã biên nhận tiếp nhận."
      );
      return;
    }

    setIsSubmittingGatewayAcknowledgement(true);
    setGatewayAcknowledgementResult(undefined);

    try {
      const acknowledgedTransfer = await acknowledgeRecordTransfer(
        clinicalApi,
        recordTransferId,
        {
          recipientOrganizationId,
          acknowledgementReference,
          receivedAt: gatewayAcknowledgementForm.receivedAt,
          receivedByActorId: gatewayAcknowledgementForm.receivedByActorId,
          targetEndpointId: gatewayAcknowledgementForm.targetEndpointId,
          deliveryIdempotencyKey: gatewayAcknowledgementForm.deliveryIdempotencyKey,
          note: gatewayAcknowledgementForm.note
        }
      );
      setGatewayAcknowledgementResult(acknowledgedTransfer);
      setStatusMessage(
        `Gateway đã xác nhận tiếp nhận gói ${acknowledgedTransfer.id} bằng biên nhận ${acknowledgedTransfer.acknowledgementReference ?? acknowledgementReference}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể gửi callback tiếp nhận: ${error.message}`
          : "Không thể gửi callback tiếp nhận."
      );
    } finally {
      setIsSubmittingGatewayAcknowledgement(false);
    }
  }

  async function handleFailRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận lỗi chuyển hồ sơ.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const updatedTransfer = await failRecordTransfer(clinicalApi, recordTransfer.id, {
        failureReason: "Gateway liên thông demo tạm thời không phản hồi.",
        note: "Đã ghi nhận lỗi gửi để thử lại sau."
      });
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã ghi nhận lỗi gửi gói chuyển hồ sơ ${updatedTransfer.id}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận lỗi chuyển hồ sơ: ${error.message}`
          : "Không thể ghi nhận lỗi chuyển hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleRetryRecordTransfer(recordTransfer: RecordTransfer) {
    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi thử gửi lại hồ sơ.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const updatedTransfer = await retryRecordTransfer(clinicalApi, recordTransfer.id, {
        note: "Đưa lại gói hồ sơ vào hàng đợi gửi."
      });
      await loadRecordTransfers(selectedPatient.id, updatedTransfer.id);
      await loadRecordTransferFhirTaskPreview(updatedTransfer.id);
      await loadRecordTransferDeliveryAttempts(updatedTransfer.id);
      setStatusMessage(`Đã đưa gói chuyển hồ sơ ${updatedTransfer.id} về hàng đợi gửi lại.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể thử gửi lại hồ sơ: ${error.message}`
          : "Không thể thử gửi lại hồ sơ."
      );
    } finally {
      setTransitioningRecordTransferId(undefined);
    }
  }

  async function handleCreateEncounter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi mở lượt khám.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingEncounter(true);

    try {
      const createdEncounter = await createEncounter(
        clinicalApi,
        selectedPatient.id,
        buildEncounterCommand(encounterForm)
      );
      await loadEncounters(selectedPatient.id, createdEncounter.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã mở lượt khám "${createdEncounter.serviceType}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể mở lượt khám: ${error.message}`
          : "Không thể mở lượt khám."
      );
    } finally {
      setIsSubmittingEncounter(false);
    }
  }

  async function handleFinishEncounter(encounterId: string) {
    if (!selectedPatient) {
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsFinishingEncounter(true);

    try {
      const finishedEncounter = await finishEncounter(clinicalApi, encounterId);
      await loadEncounters(selectedPatient.id, finishedEncounter.id);
      await loadEncounterFhirPreview(finishedEncounter.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setStatusMessage(`Đã kết thúc lượt khám "${finishedEncounter.serviceType}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể kết thúc lượt khám: ${error.message}`
          : "Không thể kết thúc lượt khám."
      );
    } finally {
      setIsFinishingEncounter(false);
    }
  }

  async function handleCreateAllergyIntolerance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận dị ứng/cảnh báo.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingAllergyIntolerance(true);

    try {
      const createdAllergyIntolerance = await createAllergyIntolerance(
        clinicalApi,
        selectedPatient.id,
        buildAllergyIntoleranceCommand(allergyIntoleranceForm)
      );
      await loadAllergyIntolerances(selectedPatient.id, createdAllergyIntolerance.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận dị ứng/cảnh báo "${createdAllergyIntolerance.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận dị ứng/cảnh báo: ${error.message}`
          : "Không thể ghi nhận dị ứng/cảnh báo."
      );
    } finally {
      setIsSubmittingAllergyIntolerance(false);
    }
  }

  async function handleCreateCondition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận chẩn đoán.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingCondition(true);

    try {
      const createdCondition = await createCondition(
        clinicalApi,
        selectedPatient.id,
        buildConditionCommand(conditionForm)
      );
      await loadConditions(selectedPatient.id, createdCondition.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã ghi nhận chẩn đoán "${createdCondition.code.display}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chẩn đoán: ${error.message}`
          : "Không thể ghi nhận chẩn đoán."
      );
    } finally {
      setIsSubmittingCondition(false);
    }
  }

  async function handleCreateObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận chỉ số lâm sàng.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    const numericValue = Number(observationForm.value);

    if (!Number.isFinite(numericValue)) {
      setStatusMessage("Giá trị chỉ số phải là số hợp lệ.");
      return;
    }

    setIsSubmittingObservation(true);

    try {
      const createdObservation = await createObservation(
        clinicalApi,
        selectedPatient.id,
        buildObservationCommand(observationForm, { numericValue })
      );
      await loadObservations(selectedPatient.id, createdObservation.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã ghi nhận "${createdObservation.code.display}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chỉ số lâm sàng: ${error.message}`
          : "Không thể ghi nhận chỉ số lâm sàng."
      );
    } finally {
      setIsSubmittingObservation(false);
    }
  }

  async function handleCreateMedicationRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi kê/chỉ định thuốc.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    const doseValue = Number(medicationRequestForm.doseValue);
    const frequency = Number(medicationRequestForm.frequency);
    const period = Number(medicationRequestForm.period);
    const expectedSupplyDurationDays = Number(
      medicationRequestForm.expectedSupplyDurationDays
    );

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      setStatusMessage("Liều lượng thuốc phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isFinite(period) || period <= 0) {
      setStatusMessage("Nhịp dùng thuốc phải có tần suất và chu kỳ lớn hơn 0.");
      return;
    }

    if (
      medicationRequestForm.expectedSupplyDurationDays &&
      (!Number.isFinite(expectedSupplyDurationDays) || expectedSupplyDurationDays <= 0)
    ) {
      setStatusMessage("Số ngày cấp thuốc phải là số lớn hơn 0.");
      return;
    }

    setIsSubmittingMedicationRequest(true);

    try {
      const createdMedicationRequest = await createMedicationRequest(
        clinicalApi,
        selectedPatient.id,
        buildMedicationRequestCommand(medicationRequestForm, {
          doseValue,
          expectedSupplyDurationDays,
          frequency,
          period
        })
      );
      await loadMedicationRequests(selectedPatient.id, createdMedicationRequest.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận chỉ định thuốc "${createdMedicationRequest.medicationCode.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chỉ định thuốc: ${error.message}`
          : "Không thể ghi nhận chỉ định thuốc."
      );
    } finally {
      setIsSubmittingMedicationRequest(false);
    }
  }

  async function handleCreateMedicationDispense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận cấp phát thuốc.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    const quantityValue = Number(medicationDispenseForm.quantityValue);
    const daysSupplyValue = Number(medicationDispenseForm.daysSupplyValue);
    const doseValue = Number(medicationDispenseForm.doseValue);
    const frequency = Number(medicationDispenseForm.frequency);
    const period = Number(medicationDispenseForm.period);

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      setStatusMessage("Số lượng thuốc cấp phát phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(daysSupplyValue) || daysSupplyValue <= 0) {
      setStatusMessage("Số ngày cấp thuốc phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      setStatusMessage("Liều hướng dẫn sau cấp phát phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isFinite(period) || period <= 0) {
      setStatusMessage("Nhịp dùng thuốc sau cấp phát phải có tần suất và chu kỳ lớn hơn 0.");
      return;
    }

    if (!medicationDispenseForm.whenHandedOver) {
      setStatusMessage("Cần nhập thời điểm bàn giao thuốc khi trạng thái là đã hoàn tất.");
      return;
    }

    setIsSubmittingMedicationDispense(true);

    try {
      const createdMedicationDispense = await createMedicationDispense(
        clinicalApi,
        selectedPatient.id,
        buildMedicationDispenseCommand(medicationDispenseForm, {
          daysSupplyValue,
          doseValue,
          frequency,
          period,
          quantityValue
        })
      );
      await loadMedicationDispenses(selectedPatient.id, createdMedicationDispense.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadPatientFhirDocumentBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận cấp phát thuốc "${createdMedicationDispense.medicationCode.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận cấp phát thuốc: ${error.message}`
          : "Không thể ghi nhận cấp phát thuốc."
      );
    } finally {
      setIsSubmittingMedicationDispense(false);
    }
  }

  async function handleCreateMedicationAdministration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận dùng thuốc thực tế.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    const doseValue = Number(medicationAdministrationForm.doseValue);

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      setStatusMessage("Liều dùng thực tế phải là số lớn hơn 0.");
      return;
    }

    if (!medicationAdministrationForm.effectiveStart) {
      setStatusMessage("Cần nhập thời điểm dùng thuốc thực tế.");
      return;
    }

    if (!medicationAdministrationForm.performerActorId.trim()) {
      setStatusMessage("Cần nhập người hoặc thiết bị xác nhận dùng thuốc.");
      return;
    }

    setIsSubmittingMedicationAdministration(true);

    try {
      const createdMedicationAdministration = await createMedicationAdministration(
        clinicalApi,
        selectedPatient.id,
        buildMedicationAdministrationCommand(medicationAdministrationForm, {
          doseValue
        })
      );
      await loadMedicationAdministrations(
        selectedPatient.id,
        createdMedicationAdministration.id
      );
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadPatientFhirDocumentBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận dùng thuốc "${createdMedicationAdministration.medicationCode.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận dùng thuốc thực tế: ${error.message}`
          : "Không thể ghi nhận dùng thuốc thực tế."
      );
    } finally {
      setIsSubmittingMedicationAdministration(false);
    }
  }

  async function handleCreateServiceRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo chỉ định dịch vụ.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingServiceRequest(true);

    try {
      const createdServiceRequest = await createServiceRequest(
        clinicalApi,
        selectedPatient.id,
        buildServiceRequestCommand(serviceRequestForm)
      );
      await loadServiceRequests(selectedPatient.id, createdServiceRequest.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã tạo chỉ định dịch vụ "${createdServiceRequest.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo chỉ định dịch vụ: ${error.message}`
          : "Không thể tạo chỉ định dịch vụ."
      );
    } finally {
      setIsSubmittingServiceRequest(false);
    }
  }

  async function handleCreateProcedure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận thủ thuật/hoạt động đã thực hiện.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingProcedure(true);

    try {
      const createdProcedure = await createProcedure(
        clinicalApi,
        selectedPatient.id,
        buildProcedureCommand(procedureForm)
      );
      await loadProcedures(selectedPatient.id, createdProcedure.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadPatientFhirDocumentBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận Procedure "${createdProcedure.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận thủ thuật/hoạt động: ${error.message}`
          : "Không thể ghi nhận thủ thuật/hoạt động."
      );
    } finally {
      setIsSubmittingProcedure(false);
    }
  }

  async function handleCreateDiagnosticReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo báo cáo kết quả.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingDiagnosticReport(true);

    try {
      const createdDiagnosticReport = await createDiagnosticReport(
        clinicalApi,
        selectedPatient.id,
        buildDiagnosticReportCommand(diagnosticReportForm)
      );
      await loadDiagnosticReports(selectedPatient.id, createdDiagnosticReport.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã tạo báo cáo kết quả "${createdDiagnosticReport.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo báo cáo kết quả: ${error.message}`
          : "Không thể tạo báo cáo kết quả."
      );
    } finally {
      setIsSubmittingDiagnosticReport(false);
    }
  }

  async function handleCreateImagingStudy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo nghiên cứu hình ảnh.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingImagingStudy(true);

    try {
      const createdImagingStudy = await createImagingStudy(
        clinicalApi,
        selectedPatient.id,
        buildImagingStudyCommand(imagingStudyForm)
      );
      await loadImagingStudies(selectedPatient.id, createdImagingStudy.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã tạo nghiên cứu hình ảnh "${createdImagingStudy.description ?? createdImagingStudy.studyInstanceUid}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo nghiên cứu hình ảnh: ${error.message}`
          : "Không thể tạo nghiên cứu hình ảnh."
      );
    } finally {
      setIsSubmittingImagingStudy(false);
    }
  }

  async function handleCreateClinicalDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo tài liệu bệnh án.");
      return;
    }

    if (!ensureSelectedPatientWritable()) {
      return;
    }

    setIsSubmittingDocument(true);

    try {
      const createdDocument = await createClinicalDocument(
        clinicalApi,
        selectedPatient.id,
        documentForm
      );
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
        panels={{
          allergyIntolerance: renderAllergyIntolerancePanel,
          audit: renderAuditPanel,
          clinicalDocument: renderDocumentPanel,
          condition: renderConditionPanel,
          consentInterop: renderConsentInteropPanel,
          createPatient: patientPanels.createPatient,
          diagnosticReport: renderDiagnosticReportPanel,
          encounter: renderEncounterPanel,
          globalAudit: renderGlobalAuditPanel,
          imagingStudy: renderImagingStudyPanel,
          medicationAdministration: renderMedicationAdministrationPanel,
          medicationDispense: renderMedicationDispensePanel,
          medicationRequest: renderMedicationRequestPanel,
          observation: renderObservationPanel,
          patientDetail: patientPanels.patientDetail,
          patientList: patientPanels.patientList,
          patientMerge: patientPanels.patientMerge,
          procedure: renderProcedurePanel,
          providerDirectory: renderProviderDirectoryPanel,
          recordTransferInterop: renderRecordTransferInteropPanel,
          serviceRequest: renderServiceRequestPanel,
          workflowTask: renderWorkflowTaskPanel
        }}
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

  function renderConsentInteropPanel(): ReactNode {
    return (
      <ConsentInteropPanel
        consents={consents}
        consentReference={defaultTransferContext.consentReference}
        isLoading={isLoadingConsents}
        isWriteDisabled={selectedPatientWriteDisabled}
        recipientOrganizationId={defaultTransferContext.recipientOrganizationId}
        revokingConsentId={revokingConsentId}
        onLoadFhirPreview={loadConsentFhirPreview}
        onRevokeConsent={handleRevokeConsent}
      />
    );
  }

  function renderRecordTransferInteropPanel(): ReactNode {
    return (
      <RecordTransferInteropPanel
        deliveryAttemptWarning={recordTransferDeliveryAttemptWarning}
        deliveryAttempts={recordTransferDeliveryAttempts}
        form={recordTransferForm}
        isLoadingDeliveryAttempts={isLoadingRecordTransferDeliveryAttempts}
        isLoadingRecordTransfers={isLoadingRecordTransfers}
        isPatientMerged={isSelectedPatientMerged}
        isSubmitting={isSubmittingRecordTransfer}
        isWriteDisabled={selectedPatientWriteDisabled}
        recordTransfers={recordTransfers}
        selectedRecordTransfer={workspaceSelection.selectedRecordTransfer}
        selectedRecordTransferId={selectedRecordTransferId}
        transitioningRecordTransferId={transitioningRecordTransferId}
        onCreateRecordTransfer={handleCreateRecordTransfer}
        onFailRecordTransfer={handleFailRecordTransfer}
        onFormChange={setRecordTransferForm}
        onReceiveRecordTransfer={handleReceiveRecordTransfer}
        onRetryRecordTransfer={handleRetryRecordTransfer}
        onSelectRecordTransfer={setSelectedRecordTransferId}
        onSendRecordTransfer={handleSendRecordTransfer}
      />
    );
  }

  function renderProviderDirectoryPanel(): ReactNode {
    return (
      <ProviderDirectoryPanel
        directory={providerDirectory}
        isLoading={isLoadingProviderDirectory}
        onRefresh={loadProviderDirectory}
      />
    );
  }

  function renderEncounterPanel(): ReactNode {
    return (
      <EncounterPanel
        encounters={encounters}
        form={encounterForm}
        isFinishing={isFinishingEncounter}
        isLoading={isLoadingEncounters}
        isSubmitting={isSubmittingEncounter}
        isWriteDisabled={selectedPatientWriteDisabled}
        selectedEncounter={workspaceSelection.selectedEncounter}
        selectedEncounterCounts={workspaceSelection.selectedEncounterCounts}
        selectedEncounterId={selectedEncounterId}
        onCreateEncounter={handleCreateEncounter}
        onFinishEncounter={handleFinishEncounter}
        onFormChange={setEncounterForm}
        onSelectEncounter={setSelectedEncounterId}
      />
    );
  }

  function renderAllergyIntolerancePanel(): ReactNode {
    return (
      <AllergyIntolerancePanel
        allergyIntolerances={allergyIntolerances}
        encounters={encounters}
        form={allergyIntoleranceForm}
        isLoading={isLoadingAllergyIntolerances}
        isSubmitting={isSubmittingAllergyIntolerance}
        isWriteDisabled={selectedPatientWriteDisabled}
        selectedAllergyIntolerance={workspaceSelection.selectedAllergyIntolerance}
        selectedAllergyIntoleranceId={selectedAllergyIntoleranceId}
        onCreateAllergyIntolerance={handleCreateAllergyIntolerance}
        onFormChange={setAllergyIntoleranceForm}
        onSelectAllergyIntolerance={setSelectedAllergyIntoleranceId}
      />
    );
  }

  function renderConditionPanel(): ReactNode {
    return (
      <ConditionPanel
        conditions={conditions}
        encounters={encounters}
        form={conditionForm}
        isLoading={isLoadingConditions}
        isSubmitting={isSubmittingCondition}
        isWriteDisabled={selectedPatientWriteDisabled}
        selectedCondition={workspaceSelection.selectedCondition}
        selectedConditionId={selectedConditionId}
        onCreateCondition={handleCreateCondition}
        onFormChange={setConditionForm}
        onSelectCondition={setSelectedConditionId}
      />
    );
  }

  function renderServiceRequestPanel(): ReactNode {
    return (
      <ServiceRequestPanel
        conditions={conditions}
        encounters={encounters}
        form={serviceRequestForm}
        isLoading={isLoadingServiceRequests}
        isSubmitting={isSubmittingServiceRequest}
        isWriteDisabled={selectedPatientWriteDisabled}
        selectedServiceRequest={workspaceSelection.selectedServiceRequest}
        selectedServiceRequestId={selectedServiceRequestId}
        serviceRequests={serviceRequests}
        onCreateServiceRequest={handleCreateServiceRequest}
        onFormChange={setServiceRequestForm}
        onSelectServiceRequest={setSelectedServiceRequestId}
      />
    );
  }

  function renderWorkflowTaskPanel(): ReactNode {
    return (
      <WorkflowTaskPanel
        isLoading={isLoadingWorkflowTasks}
        selectedWorkflowTask={workspaceSelection.selectedWorkflowTask}
        selectedWorkflowTaskId={selectedWorkflowTaskId}
        workflowTasks={workflowTasks}
        onSelectWorkflowTask={setSelectedWorkflowTaskId}
      />
    );
  }

  function renderProcedurePanel(): ReactNode {
    return (
      <ProcedurePanel
        conditions={conditions}
        diagnosticReports={diagnosticReports}
        encounters={encounters}
        form={procedureForm}
        isLoading={isLoadingProcedures}
        isSubmitting={isSubmittingProcedure}
        isWriteDisabled={selectedPatientWriteDisabled}
        procedures={procedures}
        selectedProcedure={workspaceSelection.selectedProcedure}
        selectedProcedureId={selectedProcedureId}
        serviceRequests={serviceRequests}
        onCreateProcedure={handleCreateProcedure}
        onFormChange={setProcedureForm}
        onSelectProcedure={setSelectedProcedureId}
      />
    );
  }

  function renderObservationPanel(): ReactNode {
    return (
      <ObservationPanel
        encounters={encounters}
        form={observationForm}
        isLoading={isLoadingObservations}
        isSubmitting={isSubmittingObservation}
        isWriteDisabled={selectedPatientWriteDisabled}
        observations={observations}
        selectedObservation={workspaceSelection.selectedObservation}
        selectedObservationId={selectedObservationId}
        onCreateObservation={handleCreateObservation}
        onFormChange={setObservationForm}
        onSelectObservation={setSelectedObservationId}
      />
    );
  }

  function renderDiagnosticReportPanel(): ReactNode {
    return (
      <DiagnosticReportPanel
        diagnosticReports={diagnosticReports}
        encounters={encounters}
        form={diagnosticReportForm}
        isLoading={isLoadingDiagnosticReports}
        isSubmitting={isSubmittingDiagnosticReport}
        isWriteDisabled={selectedPatientWriteDisabled}
        observations={observations}
        selectedDiagnosticReport={workspaceSelection.selectedDiagnosticReport}
        selectedDiagnosticReportId={selectedDiagnosticReportId}
        serviceRequests={serviceRequests}
        onCreateDiagnosticReport={handleCreateDiagnosticReport}
        onFormChange={setDiagnosticReportForm}
        onSelectDiagnosticReport={setSelectedDiagnosticReportId}
      />
    );
  }

  function renderImagingStudyPanel(): ReactNode {
    return (
      <ImagingStudyPanel
        diagnosticReports={diagnosticReports}
        encounters={encounters}
        form={imagingStudyForm}
        imagingStudies={imagingStudies}
        isLoading={isLoadingImagingStudies}
        isSubmitting={isSubmittingImagingStudy}
        isWriteDisabled={selectedPatientWriteDisabled}
        selectedImagingStudy={workspaceSelection.selectedImagingStudy}
        selectedImagingStudyId={selectedImagingStudyId}
        serviceRequests={serviceRequests}
        onCreateImagingStudy={handleCreateImagingStudy}
        onFormChange={setImagingStudyForm}
        onSelectImagingStudy={setSelectedImagingStudyId}
      />
    );
  }

  function renderMedicationRequestPanel(): ReactNode {
    return (
      <MedicationRequestPanel
        conditions={conditions}
        encounters={encounters}
        form={medicationRequestForm}
        isLoading={isLoadingMedicationRequests}
        isSubmitting={isSubmittingMedicationRequest}
        isWriteDisabled={selectedPatientWriteDisabled}
        medicationRequests={medicationRequests}
        selectedMedicationRequest={workspaceSelection.selectedMedicationRequest}
        selectedMedicationRequestId={selectedMedicationRequestId}
        onCreateMedicationRequest={handleCreateMedicationRequest}
        onFormChange={setMedicationRequestForm}
        onSelectMedicationRequest={setSelectedMedicationRequestId}
      />
    );
  }

  function renderMedicationDispensePanel(): ReactNode {
    return (
      <MedicationDispensePanel
        encounters={encounters}
        form={medicationDispenseForm}
        isLoading={isLoadingMedicationDispenses}
        isSubmitting={isSubmittingMedicationDispense}
        isWriteDisabled={selectedPatientWriteDisabled}
        medicationDispenses={medicationDispenses}
        medicationRequests={medicationRequests}
        selectedMedicationDispense={workspaceSelection.selectedMedicationDispense}
        selectedMedicationDispenseId={selectedMedicationDispenseId}
        onCreateMedicationDispense={handleCreateMedicationDispense}
        onFormChange={setMedicationDispenseForm}
        onSelectMedicationDispense={setSelectedMedicationDispenseId}
      />
    );
  }

  function renderMedicationAdministrationPanel(): ReactNode {
    return (
      <MedicationAdministrationPanel
        conditions={conditions}
        encounters={encounters}
        form={medicationAdministrationForm}
        isLoading={isLoadingMedicationAdministrations}
        isSubmitting={isSubmittingMedicationAdministration}
        isWriteDisabled={selectedPatientWriteDisabled}
        medicationAdministrations={medicationAdministrations}
        medicationRequests={medicationRequests}
        selectedMedicationAdministration={workspaceSelection.selectedMedicationAdministration}
        selectedMedicationAdministrationId={selectedMedicationAdministrationId}
        onCreateMedicationAdministration={handleCreateMedicationAdministration}
        onFormChange={setMedicationAdministrationForm}
        onSelectMedicationAdministration={setSelectedMedicationAdministrationId}
      />
    );
  }

  function renderDocumentPanel(): ReactNode {
    return (
      <ClinicalDocumentPanel
        clinicalDocuments={clinicalDocuments}
        documentTaxonomy={documentTaxonomy}
        encounters={encounters}
        form={documentForm}
        isLoading={isLoadingDocuments}
        isSelectedPatientMerged={isSelectedPatientMerged}
        isSigningDocument={isSigningDocument}
        isSubmitting={isSubmittingDocument}
        isWriteDisabled={selectedPatientWriteDisabled}
        selectedDocument={workspaceSelection.selectedDocument}
        selectedDocumentId={selectedDocumentId}
        onCreateDocument={handleCreateClinicalDocument}
        onFormChange={setDocumentForm}
        onSelectDocument={setSelectedDocumentId}
        onSignDocument={handleSignClinicalDocument}
      />
    );
  }

  function renderGlobalAuditPanel(): ReactNode {
    return (
      <GlobalAuditPanel
        auditEvents={globalAuditEvents}
        canReadAudit={canReadAudit}
        isLoading={isLoadingGlobalAuditEvents}
        onReload={() => void loadGlobalAuditEvents()}
      />
    );
  }

  function renderAuditPanel(): ReactNode {
    return (
      <PatientAuditPanel
        auditEvents={auditEvents}
        auditFhirBundlePreview={auditFhirBundlePreview}
        auditIntegrityReport={auditIntegrityReport}
        canReadAudit={canReadAudit}
        hasSelectedPatient={Boolean(selectedPatient)}
        isExportingAuditFhir={isExportingAuditFhir}
        isLoadingAuditEvents={isLoadingAuditEvents}
        isVerifyingAuditIntegrity={isVerifyingAuditIntegrity}
        onExportAuditFhir={() => selectedPatient && void loadAuditFhirBundle(selectedPatient.id)}
        onLoadAuditEvents={() => selectedPatient && void loadAuditEvents(selectedPatient.id)}
        onVerifyAuditIntegrity={() => selectedPatient && void verifyAuditIntegrity(selectedPatient.id)}
      />
    );
  }
}
