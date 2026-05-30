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
  FhirPanel,
  Info,
  PageHeader
} from "./components/AppShell.js";
import {
  createClinicalDocument,
  exportClinicalDocumentFhir,
  exportClinicalDocumentProvenanceFhir,
  listClinicalDocuments,
  signClinicalDocument
} from "./features/clinical-documents/clinicalDocumentApi.js";
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
import { PatientListPanel } from "./features/patient-registry/PatientListPanel.js";
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
import {
  formatAuditAction,
  formatAuditIntegrityReason,
  formatAuditIntegrityStatus,
  formatAuditMetadataSummary,
  formatAuditResourceType
} from "./lib/auditFormatters.js";
import {
  buildRecordTransferOperationalSummary,
  formatAllergyCategory,
  formatAllergyClinicalStatus,
  formatAllergyCriticality,
  formatAllergyType,
  formatAllergyVerificationStatus,
  formatConditionCategory,
  formatConditionClinicalStatus,
  formatConditionSeverity,
  formatConditionVerificationStatus,
  formatDateTime,
  formatDiagnosticReportCategory,
  formatDiagnosticReportStatus,
  formatDocumentStatus,
  formatDocumentType,
  formatDosageInstruction,
  formatEncounterClass,
  formatEncounterStatus,
  formatGender,
  formatIdentifierType,
  formatImagingStudyStatus,
  formatMedicationAdministrationCategory,
  formatMedicationAdministrationDose,
  formatMedicationAdministrationPerformers,
  formatMedicationAdministrationPeriod,
  formatMedicationAdministrationStatus,
  formatMedicationDispenseCategory,
  formatMedicationDispenseQuantity,
  formatMedicationDispenseStatus,
  formatMedicationDispenseTime,
  formatMedicationRequestCategory,
  formatMedicationRequestIntent,
  formatMedicationRequestPriority,
  formatMedicationRequestStatus,
  formatObservationCategory,
  formatObservationStatus,
  formatObservationValue,
  formatPatientRecordStatus,
  formatProcedureCategory,
  formatProcedurePerformers,
  formatProcedureReferences,
  formatProcedureStatus,
  formatRecordTransferBundleType,
  formatRecordTransferDeliveryAttemptStatus,
  formatRecordTransferPriority,
  formatRecordTransferRetryCount,
  formatRecordTransferStatus,
  formatServiceRequestCategory,
  formatServiceRequestIntent,
  formatServiceRequestPriority,
  formatServiceRequestStatus,
  formatWorkflowTaskReferences,
  formatWorkflowTaskStatus,
  isMissingRecordTransferDeliveryAttemptsRoute,
  normalizeSearchText,
  resolveSelectedRecordTransferId,
  toApiDateTime
} from "./lib/clinicalFormatters.js";
import { LandingPage } from "./pages/LandingPage.js";
import { LoginPage } from "./pages/LoginPage.js";
import { AuditLogPage } from "./pages/AuditLogPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { DocumentsPage } from "./pages/DocumentsPage.js";
import { GatewayAcknowledgementPage } from "./pages/GatewayAcknowledgementPage.js";
import { InteropPage } from "./pages/InteropPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { WorkspacePage } from "./pages/WorkspacePage.js";

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
  PatientGender,
  EncounterClass,
  EncounterStatus,
  ClinicalDocumentType,
  ClinicalDocumentStatus,
  ConditionClinicalStatus,
  ConditionVerificationStatus,
  ConditionCategory,
  ConditionSeverity,
  AllergyClinicalStatus,
  AllergyVerificationStatus,
  AllergyType,
  AllergyCategory,
  AllergyCriticality,
  AllergyReactionSeverity,
  ObservationStatus,
  ObservationCategory,
  MedicationRequestStatus,
  MedicationRequestIntent,
  MedicationRequestCategory,
  MedicationRequestPriority,
  MedicationTimingUnit,
  MedicationDispenseStatus,
  MedicationDispenseCategory,
  MedicationAdministrationStatus,
  MedicationAdministrationCategory,
  MedicationAdministrationPerformerActorType,
  ServiceRequestStatus,
  ServiceRequestIntent,
  ServiceRequestCategory,
  ServiceRequestPriority,
  WorkflowTaskStatus,
  WorkflowTaskIntent,
  WorkflowTaskPriority,
  WorkflowTaskReferenceResourceType,
  ProcedureStatus,
  ProcedureCategory,
  ProcedurePerformerActorType,
  ProcedureReportReferenceResourceType,
  DiagnosticReportStatus,
  DiagnosticReportCategory,
  ImagingStudyStatus,
  ConsentStatus,
  ConsentCategory,
  RecordTransferStatus,
  RecordTransferPriority,
  RecordTransferBundleType,
  RecordTransferDeliveryAttemptStatus,
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
  WorkflowTaskCode,
  WorkflowTaskBusinessStatus,
  WorkflowTaskReference,
  WorkflowTaskExecutionPeriod,
  WorkflowTask,
  ProcedureCoding,
  ProcedurePerformedPeriod,
  ProcedurePerformer,
  ProcedureReportReference,
  Procedure,
  DiagnosticReportCode,
  DiagnosticReport,
  ImagingStudyCoding,
  ImagingStudySeries,
  ImagingStudy,
  AuditAction,
  AuditResourceType,
  AuditEvent,
  AuditIntegrityStatus,
  AuditIntegrityReport,
  Consent,
  RecordTransfer,
  RecordTransferDeliveryAttempt,
  RecordTransferOperationalSeverity,
  RecordTransferOperationalSummary,
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

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedPatientMergeTarget = selectedPatient?.mergedIntoPatientId
    ? patients.find((patient) => patient.id === selectedPatient.mergedIntoPatientId)
    : undefined;
  const isSelectedPatientMerged = selectedPatient?.status === "merged";
  const selectedPatientWriteDisabled = !selectedPatient || isSelectedPatientMerged;
  const canMergePatients = authSession?.actor.role === "admin";
  const isIntegrationSession = authSession?.actor.role === "integration";
  const patientMergeCandidates = selectedPatient
    ? patients.filter((patient) => patient.id !== selectedPatient.id && patient.status === "active")
    : [];
  const patientMergeTargetId = patientMergeCandidates.some(
    (patient) => patient.id === patientMergeForm.targetPatientId
  )
    ? patientMergeForm.targetPatientId
    : patientMergeCandidates[0]?.id ?? "";
  const patientMergeConfirmationCode =
    selectedPatient?.identifiers[0]?.value ?? selectedPatient?.id ?? "";
  const isPatientMergeConfirmationValid =
    Boolean(selectedPatient) &&
    patientMergeForm.confirmationText.trim() === patientMergeConfirmationCode;
  const normalizedPatientSearchTerm = normalizeSearchText(patientSearchTerm);
  const visiblePatients = patients.filter((patient) => {
    if (patientStatusFilter !== "all" && patient.status !== patientStatusFilter) {
      return false;
    }

    if (!normalizedPatientSearchTerm) {
      return true;
    }

    return [
      patient.id,
      patient.fullName,
      patient.address ?? "",
      patient.phone ?? "",
      patient.managingOrganizationId,
      formatPatientRecordStatus(patient.status),
      ...patient.identifiers.flatMap((identifier) => [
        identifier.value,
        identifier.system,
        formatIdentifierType(identifier.type)
      ])
    ].some((value) => normalizeSearchText(value).includes(normalizedPatientSearchTerm));
  });
  const hasPatientListFilter =
    Boolean(normalizedPatientSearchTerm) || patientStatusFilter !== "all";
  const selectedEncounter = encounters.find((encounter) => encounter.id === selectedEncounterId);
  const selectedDocument = clinicalDocuments.find((document) => document.id === selectedDocumentId);
  const selectedAllergyIntolerance = allergyIntolerances.find(
    (allergyIntolerance) => allergyIntolerance.id === selectedAllergyIntoleranceId
  );
  const selectedCondition = conditions.find((condition) => condition.id === selectedConditionId);
  const selectedObservation = observations.find((observation) => observation.id === selectedObservationId);
  const selectedMedicationRequest = medicationRequests.find(
    (medicationRequest) => medicationRequest.id === selectedMedicationRequestId
  );
  const selectedMedicationDispense = medicationDispenses.find(
    (medicationDispense) => medicationDispense.id === selectedMedicationDispenseId
  );
  const selectedMedicationAdministration = medicationAdministrations.find(
    (medicationAdministration) =>
      medicationAdministration.id === selectedMedicationAdministrationId
  );
  const selectedServiceRequest = serviceRequests.find(
    (serviceRequest) => serviceRequest.id === selectedServiceRequestId
  );
  const selectedWorkflowTask = workflowTasks.find((task) => task.id === selectedWorkflowTaskId);
  const selectedProcedure = procedures.find((procedure) => procedure.id === selectedProcedureId);
  const selectedDiagnosticReport = diagnosticReports.find(
    (diagnosticReport) => diagnosticReport.id === selectedDiagnosticReportId
  );
  const selectedImagingStudy = imagingStudies.find(
    (imagingStudy) => imagingStudy.id === selectedImagingStudyId
  );
  const selectedRecordTransfer = recordTransfers.find(
    (recordTransfer) => recordTransfer.id === selectedRecordTransferId
  );
  selectedRecordTransferIdRef.current = selectedRecordTransferId;
  const selectedEncounterDocuments = selectedEncounter
    ? clinicalDocuments.filter((document) => document.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterAllergyIntolerances = selectedEncounter
    ? allergyIntolerances.filter((allergyIntolerance) => allergyIntolerance.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterObservations = selectedEncounter
    ? observations.filter((observation) => observation.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterConditions = selectedEncounter
    ? conditions.filter((condition) => condition.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterMedicationRequests = selectedEncounter
    ? medicationRequests.filter((medicationRequest) => medicationRequest.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterMedicationDispenses = selectedEncounter
    ? medicationDispenses.filter(
        (medicationDispense) => medicationDispense.encounterId === selectedEncounter.id
      )
    : [];
  const selectedEncounterMedicationAdministrations = selectedEncounter
    ? medicationAdministrations.filter(
        (medicationAdministration) =>
          medicationAdministration.encounterId === selectedEncounter.id
      )
    : [];
  const selectedEncounterServiceRequests = selectedEncounter
    ? serviceRequests.filter((serviceRequest) => serviceRequest.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterWorkflowTasks = selectedEncounter
    ? workflowTasks.filter((task) => task.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterProcedures = selectedEncounter
    ? procedures.filter((procedure) => procedure.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterDiagnosticReports = selectedEncounter
    ? diagnosticReports.filter((diagnosticReport) => diagnosticReport.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterImagingStudies = selectedEncounter
    ? imagingStudies.filter((imagingStudy) => imagingStudy.encounterId === selectedEncounter.id)
    : [];
  const openEncounters = encounters.filter((encounter) => encounter.status === "in-progress");
  const signedDocuments = clinicalDocuments.filter((document) => document.status === "signed");
  const draftDocuments = clinicalDocuments.filter((document) => document.status === "draft");
  const canReadAudit = authSession?.actor.role === "auditor" || authSession?.actor.role === "admin";
  const canViewRuntimeInfo = canReadAudit;
  const isAuditOnlySession = authSession?.actor.role === "auditor";

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
    if (selectedDocument?.status === "signed") {
      void loadDocumentProvenanceFhirPreview(selectedDocumentId);
      return;
    }

    setDocumentProvenanceFhirPreview({
      note: "FHIR Provenance chỉ được xuất khi tài liệu đã ký/xác nhận."
    });
  }, [selectedDocumentId, selectedDocument?.status]);

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
    setIsLoadingEncounters(true);

    try {
      const data = await listEncounters(clinicalApi, patientId);
      setEncounters(data.items);
      setSelectedEncounterId(nextSelectedEncounterId ?? data.items[0]?.id);
    } catch (error) {
      setEncounters([]);
      setSelectedEncounterId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải lượt khám: ${error.message}`
          : "Không thể tải lượt khám."
      );
    } finally {
      setIsLoadingEncounters(false);
    }
  }

  async function loadClinicalDocuments(patientId: string, nextSelectedDocumentId?: string) {
    setIsLoadingDocuments(true);

    try {
      const data = await listClinicalDocuments(clinicalApi, patientId);
      setClinicalDocuments(data.items);
      setSelectedDocumentId(nextSelectedDocumentId ?? data.items[0]?.id);
    } catch (error) {
      setClinicalDocuments([]);
      setSelectedDocumentId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải tài liệu bệnh án: ${error.message}`
          : "Không thể tải tài liệu bệnh án."
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  async function loadAllergyIntolerances(
    patientId: string,
    nextSelectedAllergyIntoleranceId?: string
  ) {
    setIsLoadingAllergyIntolerances(true);

    try {
      const data = await listAllergyIntolerances(clinicalApi, patientId);
      setAllergyIntolerances(data.items);
      setSelectedAllergyIntoleranceId(nextSelectedAllergyIntoleranceId ?? data.items[0]?.id);
    } catch (error) {
      setAllergyIntolerances([]);
      setSelectedAllergyIntoleranceId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải dị ứng/cảnh báo: ${error.message}`
          : "Không thể tải dị ứng/cảnh báo."
      );
    } finally {
      setIsLoadingAllergyIntolerances(false);
    }
  }

  async function loadConditions(patientId: string, nextSelectedConditionId?: string) {
    setIsLoadingConditions(true);

    try {
      const data = await listConditions(clinicalApi, patientId);
      setConditions(data.items);
      setSelectedConditionId(nextSelectedConditionId ?? data.items[0]?.id);
    } catch (error) {
      setConditions([]);
      setSelectedConditionId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chẩn đoán/vấn đề sức khỏe: ${error.message}`
          : "Không thể tải chẩn đoán/vấn đề sức khỏe."
      );
    } finally {
      setIsLoadingConditions(false);
    }
  }

  async function loadObservations(patientId: string, nextSelectedObservationId?: string) {
    setIsLoadingObservations(true);

    try {
      const data = await listObservations(clinicalApi, patientId);
      setObservations(data.items);
      setSelectedObservationId(nextSelectedObservationId ?? data.items[0]?.id);
    } catch (error) {
      setObservations([]);
      setSelectedObservationId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ số lâm sàng: ${error.message}`
          : "Không thể tải chỉ số lâm sàng."
      );
    } finally {
      setIsLoadingObservations(false);
    }
  }

  async function loadMedicationRequests(
    patientId: string,
    nextSelectedMedicationRequestId?: string
  ) {
    setIsLoadingMedicationRequests(true);

    try {
      const data = await listMedicationRequests(clinicalApi, patientId);
      setMedicationRequests(data.items);
      setSelectedMedicationRequestId(nextSelectedMedicationRequestId ?? data.items[0]?.id);
    } catch (error) {
      setMedicationRequests([]);
      setSelectedMedicationRequestId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ định thuốc: ${error.message}`
          : "Không thể tải chỉ định thuốc."
      );
    } finally {
      setIsLoadingMedicationRequests(false);
    }
  }

  async function loadMedicationDispenses(
    patientId: string,
    nextSelectedMedicationDispenseId?: string
  ) {
    setIsLoadingMedicationDispenses(true);

    try {
      const data = await listMedicationDispenses(clinicalApi, patientId);
      setMedicationDispenses(data.items);
      setSelectedMedicationDispenseId(
        nextSelectedMedicationDispenseId ?? data.items[0]?.id
      );
    } catch (error) {
      setMedicationDispenses([]);
      setSelectedMedicationDispenseId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải cấp phát thuốc: ${error.message}`
          : "Không thể tải cấp phát thuốc."
      );
    } finally {
      setIsLoadingMedicationDispenses(false);
    }
  }

  async function loadMedicationAdministrations(
    patientId: string,
    nextSelectedMedicationAdministrationId?: string
  ) {
    setIsLoadingMedicationAdministrations(true);

    try {
      const data = await listMedicationAdministrations(clinicalApi, patientId);
      setMedicationAdministrations(data.items);
      setSelectedMedicationAdministrationId(
        nextSelectedMedicationAdministrationId ?? data.items[0]?.id
      );
    } catch (error) {
      setMedicationAdministrations([]);
      setSelectedMedicationAdministrationId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải lần dùng thuốc: ${error.message}`
          : "Không thể tải lần dùng thuốc."
      );
    } finally {
      setIsLoadingMedicationAdministrations(false);
    }
  }

  async function loadServiceRequests(
    patientId: string,
    nextSelectedServiceRequestId?: string
  ) {
    setIsLoadingServiceRequests(true);

    try {
      const data = await listServiceRequests(clinicalApi, patientId);
      setServiceRequests(data.items);
      setSelectedServiceRequestId(nextSelectedServiceRequestId ?? data.items[0]?.id);
    } catch (error) {
      setServiceRequests([]);
      setSelectedServiceRequestId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ định dịch vụ: ${error.message}`
          : "Không thể tải chỉ định dịch vụ."
      );
    } finally {
      setIsLoadingServiceRequests(false);
    }
  }

  async function loadWorkflowTasks(patientId: string, nextSelectedWorkflowTaskId?: string) {
    setIsLoadingWorkflowTasks(true);

    try {
      const data = await listWorkflowTasks(clinicalApi, patientId);
      setWorkflowTasks(data.items);
      setSelectedWorkflowTaskId(nextSelectedWorkflowTaskId ?? data.items[0]?.id);
    } catch (error) {
      setWorkflowTasks([]);
      setSelectedWorkflowTaskId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải hàng đợi công việc: ${error.message}`
          : "Không thể tải hàng đợi công việc."
      );
    } finally {
      setIsLoadingWorkflowTasks(false);
    }
  }

  async function loadProcedures(patientId: string, nextSelectedProcedureId?: string) {
    setIsLoadingProcedures(true);

    try {
      const data = await listProcedures(clinicalApi, patientId);
      setProcedures(data.items);
      setSelectedProcedureId(nextSelectedProcedureId ?? data.items[0]?.id);
    } catch (error) {
      setProcedures([]);
      setSelectedProcedureId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải thủ thuật/hoạt động đã thực hiện: ${error.message}`
          : "Không thể tải thủ thuật/hoạt động đã thực hiện."
      );
    } finally {
      setIsLoadingProcedures(false);
    }
  }

  async function loadDiagnosticReports(
    patientId: string,
    nextSelectedDiagnosticReportId?: string
  ) {
    setIsLoadingDiagnosticReports(true);

    try {
      const data = await listDiagnosticReports(clinicalApi, patientId);
      setDiagnosticReports(data.items);
      setSelectedDiagnosticReportId(nextSelectedDiagnosticReportId ?? data.items[0]?.id);
    } catch (error) {
      setDiagnosticReports([]);
      setSelectedDiagnosticReportId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải báo cáo kết quả: ${error.message}`
          : "Không thể tải báo cáo kết quả."
      );
    } finally {
      setIsLoadingDiagnosticReports(false);
    }
  }

  async function loadImagingStudies(patientId: string, nextSelectedImagingStudyId?: string) {
    setIsLoadingImagingStudies(true);

    try {
      const data = await listImagingStudies(clinicalApi, patientId);
      setImagingStudies(data.items);
      setSelectedImagingStudyId(nextSelectedImagingStudyId ?? data.items[0]?.id);
    } catch (error) {
      setImagingStudies([]);
      setSelectedImagingStudyId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải nghiên cứu hình ảnh/PACS: ${error.message}`
          : "Không thể tải nghiên cứu hình ảnh/PACS."
      );
    } finally {
      setIsLoadingImagingStudies(false);
    }
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
    try {
      setConsentFhirPreview(await exportConsentFhir(clinicalApi, consentId));
    } catch (error) {
      setConsentFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Consent: ${error.message}`
            : "Không thể xuất FHIR Consent."
      });
    }
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
    try {
      setPatientFhirPreview(
        await exportPatientFhir(clinicalApi, patientId, isAuditOnlySession ? "AUDIT" : "TREATMENT")
      );
    } catch (error) {
      setPatientFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Patient: ${error.message}`
            : "Không thể xuất FHIR Patient."
      });
    }
  }

  async function loadPatientFhirBundlePreview(patientId: string) {
    try {
      setPatientFhirBundlePreview(await exportPatientFhirBundle(clinicalApi, patientId));
    } catch (error) {
      setPatientFhirBundlePreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Bundle: ${error.message}`
            : "Không thể xuất FHIR Bundle."
      });
    }
  }

  async function loadPatientFhirDocumentBundlePreview(patientId: string) {
    try {
      setPatientFhirDocumentBundlePreview(
        await exportPatientFhirDocumentBundle(clinicalApi, patientId)
      );
    } catch (error) {
      setPatientFhirDocumentBundlePreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR document Bundle: ${error.message}`
            : "Không thể xuất FHIR document Bundle."
      });
    }
  }

  async function loadEncounterFhirPreview(encounterId: string) {
    try {
      setEncounterFhirPreview(await exportEncounterFhir(clinicalApi, encounterId));
    } catch (error) {
      setEncounterFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Encounter: ${error.message}`
            : "Không thể xuất FHIR Encounter."
      });
    }
  }

  async function loadDocumentFhirPreview(documentId: string) {
    try {
      setDocumentFhirPreview(await exportClinicalDocumentFhir(clinicalApi, documentId));
    } catch (error) {
      setDocumentFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR DocumentReference: ${error.message}`
            : "Không thể xuất FHIR DocumentReference."
      });
    }
  }

  async function loadDocumentProvenanceFhirPreview(documentId: string) {
    try {
      setDocumentProvenanceFhirPreview(
        await exportClinicalDocumentProvenanceFhir(clinicalApi, documentId)
      );
    } catch (error) {
      setDocumentProvenanceFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Provenance: ${error.message}`
            : "Không thể xuất FHIR Provenance."
      });
    }
  }

  async function loadConditionFhirPreview(conditionId: string) {
    try {
      setConditionFhirPreview(await exportConditionFhir(clinicalApi, conditionId));
    } catch (error) {
      setConditionFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Condition: ${error.message}`
            : "Không thể xuất FHIR Condition."
      });
    }
  }

  async function loadAllergyIntoleranceFhirPreview(allergyIntoleranceId: string) {
    try {
      setAllergyIntoleranceFhirPreview(
        await exportAllergyIntoleranceFhir(clinicalApi, allergyIntoleranceId)
      );
    } catch (error) {
      setAllergyIntoleranceFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR AllergyIntolerance: ${error.message}`
            : "Không thể xuất FHIR AllergyIntolerance."
      });
    }
  }

  async function loadObservationFhirPreview(observationId: string) {
    try {
      setObservationFhirPreview(await exportObservationFhir(clinicalApi, observationId));
    } catch (error) {
      setObservationFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Observation: ${error.message}`
            : "Không thể xuất FHIR Observation."
      });
    }
  }

  async function loadMedicationRequestFhirPreview(medicationRequestId: string) {
    try {
      setMedicationRequestFhirPreview(
        await exportMedicationRequestFhir(clinicalApi, medicationRequestId)
      );
    } catch (error) {
      setMedicationRequestFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR MedicationRequest: ${error.message}`
            : "Không thể xuất FHIR MedicationRequest."
      });
    }
  }

  async function loadMedicationDispenseFhirPreview(medicationDispenseId: string) {
    try {
      setMedicationDispenseFhirPreview(
        await exportMedicationDispenseFhir(clinicalApi, medicationDispenseId)
      );
    } catch (error) {
      setMedicationDispenseFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR MedicationDispense: ${error.message}`
            : "Không thể xuất FHIR MedicationDispense."
      });
    }
  }

  async function loadMedicationAdministrationFhirPreview(
    medicationAdministrationId: string
  ) {
    try {
      setMedicationAdministrationFhirPreview(
        await exportMedicationAdministrationFhir(clinicalApi, medicationAdministrationId)
      );
    } catch (error) {
      setMedicationAdministrationFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR MedicationAdministration: ${error.message}`
            : "Không thể xuất FHIR MedicationAdministration."
      });
    }
  }

  async function loadServiceRequestFhirPreview(serviceRequestId: string) {
    try {
      setServiceRequestFhirPreview(
        await exportServiceRequestFhir(clinicalApi, serviceRequestId)
      );
    } catch (error) {
      setServiceRequestFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR ServiceRequest: ${error.message}`
            : "Không thể xuất FHIR ServiceRequest."
      });
    }
  }

  async function loadWorkflowTaskFhirPreview(taskId: string) {
    try {
      setWorkflowTaskFhirPreview(await exportWorkflowTaskFhir(clinicalApi, taskId));
    } catch (error) {
      setWorkflowTaskFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Task: ${error.message}`
            : "Không thể xuất FHIR Task."
      });
    }
  }

  async function loadProcedureFhirPreview(procedureId: string) {
    try {
      setProcedureFhirPreview(await exportProcedureFhir(clinicalApi, procedureId));
    } catch (error) {
      setProcedureFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Procedure: ${error.message}`
            : "Không thể xuất FHIR Procedure."
      });
    }
  }

  async function loadDiagnosticReportFhirPreview(diagnosticReportId: string) {
    try {
      setDiagnosticReportFhirPreview(
        await exportDiagnosticReportFhir(clinicalApi, diagnosticReportId)
      );
    } catch (error) {
      setDiagnosticReportFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR DiagnosticReport: ${error.message}`
            : "Không thể xuất FHIR DiagnosticReport."
      });
    }
  }

  async function loadImagingStudyFhirPreview(imagingStudyId: string) {
    try {
      setImagingStudyFhirPreview(
        await exportImagingStudyFhir(clinicalApi, imagingStudyId)
      );
    } catch (error) {
      setImagingStudyFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR ImagingStudy: ${error.message}`
            : "Không thể xuất FHIR ImagingStudy."
      });
    }
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
      const createdEncounter = await createEncounter(clinicalApi, selectedPatient.id, {
        class: encounterForm.class,
        serviceType: encounterForm.serviceType,
        reasonText: encounterForm.reasonText,
        departmentId: encounterForm.departmentId || undefined,
        attendingPractitionerId: encounterForm.attendingPractitionerId,
        startedAt: toApiDateTime(encounterForm.startedAt)
      });
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

    const hasReaction =
      allergyIntoleranceForm.manifestationCode.trim() ||
      allergyIntoleranceForm.manifestationDisplay.trim() ||
      allergyIntoleranceForm.reactionDescription.trim();

    setIsSubmittingAllergyIntolerance(true);

    try {
      const createdAllergyIntolerance = await createAllergyIntolerance(
        clinicalApi,
        selectedPatient.id,
        {
          encounterId: allergyIntoleranceForm.encounterId || undefined,
          clinicalStatus: allergyIntoleranceForm.clinicalStatus,
          verificationStatus: allergyIntoleranceForm.verificationStatus,
          type: allergyIntoleranceForm.type,
          category: allergyIntoleranceForm.category,
          criticality: allergyIntoleranceForm.criticality || undefined,
          code: {
            system: allergyIntoleranceForm.codeSystem,
            code: allergyIntoleranceForm.code,
            display: allergyIntoleranceForm.codeDisplay
          },
          reaction: hasReaction
            ? {
                manifestation: {
                  system: allergyIntoleranceForm.manifestationSystem,
                  code: allergyIntoleranceForm.manifestationCode,
                  display: allergyIntoleranceForm.manifestationDisplay
                },
                severity: allergyIntoleranceForm.reactionSeverity || undefined,
                description: allergyIntoleranceForm.reactionDescription || undefined
            }
            : undefined,
          recordedAt: allergyIntoleranceForm.recordedAt
            ? toApiDateTime(allergyIntoleranceForm.recordedAt)
            : undefined,
          recorderPractitionerId: allergyIntoleranceForm.recorderPractitionerId,
          note: allergyIntoleranceForm.note || undefined
        }
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
      const createdCondition = await createCondition(clinicalApi, selectedPatient.id, {
        encounterId: conditionForm.encounterId || undefined,
        clinicalStatus: conditionForm.clinicalStatus,
        verificationStatus: conditionForm.verificationStatus,
        category: conditionForm.category,
        code: {
          system: conditionForm.codeSystem,
          code: conditionForm.code,
          display: conditionForm.codeDisplay
        },
        severity: conditionForm.severity || undefined,
        onsetAt: conditionForm.onsetAt ? toApiDateTime(conditionForm.onsetAt) : undefined,
        recorderPractitionerId: conditionForm.recorderPractitionerId,
        note: conditionForm.note || undefined
      });
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
      const createdObservation = await createObservation(clinicalApi, selectedPatient.id, {
        encounterId: observationForm.encounterId || undefined,
        category: observationForm.category,
        code: {
          system: observationForm.codeSystem,
          code: observationForm.code,
          display: observationForm.codeDisplay
        },
        effectiveAt: toApiDateTime(observationForm.effectiveAt),
        valueQuantity: {
          value: numericValue,
          unit: observationForm.unit,
          system: observationForm.unitSystem || undefined,
          code: observationForm.unitCode || undefined
        },
        performerPractitionerId: observationForm.performerPractitionerId || undefined
      });
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
        {
          encounterId: medicationRequestForm.encounterId || undefined,
          reasonConditionId: medicationRequestForm.reasonConditionId || undefined,
          category: medicationRequestForm.category,
          priority: medicationRequestForm.priority,
          medicationCode: {
            system: medicationRequestForm.medicationSystem,
            code: medicationRequestForm.medicationCode,
            display: medicationRequestForm.medicationDisplay
          },
          dosageInstruction: {
            text: medicationRequestForm.dosageText,
            route: medicationRequestForm.route || undefined,
            doseQuantity: {
              value: doseValue,
              unit: medicationRequestForm.doseUnit,
              system: "http://unitsofmeasure.org",
              code: medicationRequestForm.doseUnit
            },
            frequency,
            period,
            periodUnit: medicationRequestForm.periodUnit
          },
          authoredOn: medicationRequestForm.authoredOn
            ? toApiDateTime(medicationRequestForm.authoredOn)
            : undefined,
          requesterPractitionerId: medicationRequestForm.requesterPractitionerId,
          expectedSupplyDurationDays: medicationRequestForm.expectedSupplyDurationDays
            ? expectedSupplyDurationDays
            : undefined,
          note: medicationRequestForm.note || undefined
        }
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
        {
          encounterId: medicationDispenseForm.encounterId || undefined,
          medicationRequestId: medicationDispenseForm.medicationRequestId || undefined,
          status: "completed",
          category: medicationDispenseForm.category,
          medicationCode: {
            system: medicationDispenseForm.medicationSystem,
            code: medicationDispenseForm.medicationCode,
            display: medicationDispenseForm.medicationDisplay
          },
          quantity: {
            value: quantityValue,
            unit: medicationDispenseForm.quantityUnit,
            system: "http://unitsofmeasure.org",
            code: medicationDispenseForm.quantityUnit
          },
          daysSupply: {
            value: daysSupplyValue,
            unit: "ngày",
            system: "http://unitsofmeasure.org",
            code: "d"
          },
          whenPrepared: medicationDispenseForm.whenPrepared
            ? toApiDateTime(medicationDispenseForm.whenPrepared)
            : undefined,
          whenHandedOver: toApiDateTime(medicationDispenseForm.whenHandedOver),
          dispenserPractitionerId:
            medicationDispenseForm.dispenserPractitionerId || undefined,
          receiverPractitionerId:
            medicationDispenseForm.receiverPractitionerId || undefined,
          dosageInstruction: {
            text: medicationDispenseForm.dosageText,
            route: medicationDispenseForm.route || undefined,
            doseQuantity: {
              value: doseValue,
              unit: medicationDispenseForm.doseUnit,
              system: "http://unitsofmeasure.org",
              code: medicationDispenseForm.doseUnit
            },
            frequency,
            period,
            periodUnit: medicationDispenseForm.periodUnit
          },
          note: medicationDispenseForm.note || undefined
        }
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
        {
          encounterId: medicationAdministrationForm.encounterId || undefined,
          medicationRequestId:
            medicationAdministrationForm.medicationRequestId || undefined,
          reasonConditionId: medicationAdministrationForm.reasonConditionId || undefined,
          status: "completed",
          category: medicationAdministrationForm.category,
          medicationCode: {
            system: medicationAdministrationForm.medicationSystem,
            code: medicationAdministrationForm.medicationCode,
            display: medicationAdministrationForm.medicationDisplay
          },
          effectivePeriod: {
            start: toApiDateTime(medicationAdministrationForm.effectiveStart)
          },
          performers: [
            {
              actorType: medicationAdministrationForm.performerActorType,
              actorId: medicationAdministrationForm.performerActorId,
              function: medicationAdministrationForm.performerFunctionDisplay
                ? {
                    system:
                      "urn:wiiicare:nexus:medication-admin-performer-function",
                    code: "medication-administration-recorder",
                    display: medicationAdministrationForm.performerFunctionDisplay
                  }
                : undefined
            }
          ],
          dosage: {
            text: medicationAdministrationForm.dosageText || undefined,
            route: medicationAdministrationForm.routeCode
              ? {
                  system: medicationAdministrationForm.routeSystem,
                  code: medicationAdministrationForm.routeCode,
                  display: medicationAdministrationForm.routeDisplay
                }
              : undefined,
            doseQuantity: {
              value: doseValue,
              unit: medicationAdministrationForm.doseUnit,
              system: "http://unitsofmeasure.org",
              code: medicationAdministrationForm.doseUnit
            }
          },
          note: medicationAdministrationForm.note || undefined
        }
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
        {
          encounterId: serviceRequestForm.encounterId || undefined,
          reasonConditionId: serviceRequestForm.reasonConditionId || undefined,
          category: serviceRequestForm.category,
          priority: serviceRequestForm.priority,
          code: {
            system: serviceRequestForm.codeSystem,
            code: serviceRequestForm.code,
            display: serviceRequestForm.codeDisplay
          },
          occurrenceAt: serviceRequestForm.occurrenceAt
            ? toApiDateTime(serviceRequestForm.occurrenceAt)
            : undefined,
          authoredOn: serviceRequestForm.authoredOn
            ? toApiDateTime(serviceRequestForm.authoredOn)
            : undefined,
          requesterPractitionerId: serviceRequestForm.requesterPractitionerId,
          performerOrganizationId: serviceRequestForm.performerOrganizationId || undefined,
          patientInstruction: serviceRequestForm.patientInstruction || undefined,
          note: serviceRequestForm.note || undefined
        }
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

    const reportReferences =
      procedureForm.reportReferenceId.trim().length > 0
        ? [
            {
              resourceType: procedureForm.reportReferenceType,
              id: procedureForm.reportReferenceId
            }
          ]
        : [];

    try {
      const createdProcedure = await createProcedure(clinicalApi, selectedPatient.id, {
        encounterId: procedureForm.encounterId || undefined,
        basedOnServiceRequestId: procedureForm.basedOnServiceRequestId || undefined,
        reasonConditionId: procedureForm.reasonConditionId || undefined,
        category: procedureForm.category,
        status: procedureForm.status,
        code: {
          system: procedureForm.codeSystem,
          code: procedureForm.code,
          display: procedureForm.codeDisplay
        },
        performedPeriod:
          procedureForm.performedStart || procedureForm.performedEnd
            ? {
                start: procedureForm.performedStart
                  ? toApiDateTime(procedureForm.performedStart)
                  : undefined,
                end: procedureForm.performedEnd
                  ? toApiDateTime(procedureForm.performedEnd)
                  : undefined
              }
            : undefined,
        performers: procedureForm.performerActorId
          ? [
              {
                actorType: procedureForm.performerActorType,
                actorId: procedureForm.performerActorId,
                function:
                  procedureForm.performerFunctionCode && procedureForm.performerFunctionDisplay
                    ? {
                        system: procedureForm.performerFunctionSystem,
                        code: procedureForm.performerFunctionCode,
                        display: procedureForm.performerFunctionDisplay
                      }
                    : undefined,
                onBehalfOfOrganizationId: procedureForm.onBehalfOfOrganizationId || undefined
              }
            ]
          : [],
        recorderPractitionerId: procedureForm.recorderPractitionerId || undefined,
        asserterPractitionerId: procedureForm.asserterPractitionerId || undefined,
        bodySite:
          procedureForm.bodySiteCode && procedureForm.bodySiteDisplay
            ? {
                system: procedureForm.bodySiteSystem,
                code: procedureForm.bodySiteCode,
                display: procedureForm.bodySiteDisplay
              }
            : undefined,
        outcome:
          procedureForm.outcomeCode && procedureForm.outcomeDisplay
            ? {
                system: procedureForm.outcomeSystem,
                code: procedureForm.outcomeCode,
                display: procedureForm.outcomeDisplay
              }
            : undefined,
        reportReferences,
        note: procedureForm.note || undefined
      });
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
        {
          encounterId: diagnosticReportForm.encounterId || undefined,
          basedOnServiceRequestId: diagnosticReportForm.basedOnServiceRequestId || undefined,
          category: diagnosticReportForm.category,
          code: {
            system: diagnosticReportForm.codeSystem,
            code: diagnosticReportForm.code,
            display: diagnosticReportForm.codeDisplay
          },
          effectiveAt: toApiDateTime(diagnosticReportForm.effectiveAt),
          issuedAt: diagnosticReportForm.issuedAt
            ? toApiDateTime(diagnosticReportForm.issuedAt)
            : undefined,
          performerOrganizationId: diagnosticReportForm.performerOrganizationId || undefined,
          resultsInterpreterPractitionerId:
            diagnosticReportForm.resultsInterpreterPractitionerId || undefined,
          resultObservationIds: diagnosticReportForm.resultObservationIds,
          conclusion: diagnosticReportForm.conclusion || undefined,
          presentedFormUrl: diagnosticReportForm.presentedFormUrl || undefined,
          presentedFormTitle: diagnosticReportForm.presentedFormTitle || undefined
        }
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
        {
          encounterId: imagingStudyForm.encounterId || undefined,
          basedOnServiceRequestId: imagingStudyForm.basedOnServiceRequestId || undefined,
          diagnosticReportId: imagingStudyForm.diagnosticReportId || undefined,
          studyInstanceUid: imagingStudyForm.studyInstanceUid,
          accessionNumber: imagingStudyForm.accessionNumber || undefined,
          description: imagingStudyForm.description || undefined,
          startedAt: imagingStudyForm.startedAt
            ? toApiDateTime(imagingStudyForm.startedAt)
            : undefined,
          referrerPractitionerId: imagingStudyForm.referrerPractitionerId || undefined,
          interpreterPractitionerId: imagingStudyForm.interpreterPractitionerId || undefined,
          endpointId: imagingStudyForm.endpointId || undefined,
          series: [
            {
              uid: imagingStudyForm.seriesUid,
              number: imagingStudyForm.seriesNumber
                ? Number.parseInt(imagingStudyForm.seriesNumber, 10)
                : undefined,
              modality: {
                system: imagingStudyForm.modalitySystem,
                code: imagingStudyForm.modalityCode,
                display: imagingStudyForm.modalityDisplay
              },
              description: imagingStudyForm.seriesDescription || undefined,
              numberOfInstances: imagingStudyForm.numberOfInstances
                ? Number.parseInt(imagingStudyForm.numberOfInstances, 10)
                : undefined,
              bodySite:
                imagingStudyForm.bodySiteCode || imagingStudyForm.bodySiteDisplay
                  ? {
                      system: imagingStudyForm.bodySiteSystem,
                      code: imagingStudyForm.bodySiteCode,
                      display: imagingStudyForm.bodySiteDisplay
                    }
                  : undefined
            }
          ]
        }
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
      {renderCurrentRoute()}
    </AuthenticatedLayout>
  );

  function renderCurrentRoute(): ReactNode {
    if (isIntegrationSession) {
      return (
        <GatewayAcknowledgementPage
          apiBaseUrl={apiBaseUrl}
          authSession={authSession}
          form={gatewayAcknowledgementForm}
          isSubmitting={isSubmittingGatewayAcknowledgement}
          onFormChange={setGatewayAcknowledgementForm}
          onSubmit={(event) => void handleGatewayAcknowledgementSubmit(event)}
          result={gatewayAcknowledgementResult}
        />
      );
    }

    if (appRoute === "workspace") {
      return (
        <WorkspacePage
          allergyIntolerancePanel={renderAllergyIntolerancePanel()}
          conditionPanel={renderConditionPanel()}
          createPatientPanel={renderCreatePatientPanel()}
          diagnosticReportPanel={renderDiagnosticReportPanel()}
          encounterPanel={renderEncounterPanel()}
          imagingStudyPanel={renderImagingStudyPanel()}
          medicationAdministrationPanel={renderMedicationAdministrationPanel()}
          medicationDispensePanel={renderMedicationDispensePanel()}
          medicationRequestPanel={renderMedicationRequestPanel()}
          observationPanel={renderObservationPanel()}
          patientDetailPanel={renderPatientDetailPanel()}
          patientListPanel={renderPatientListPanel()}
          patientMergePanel={canMergePatients ? renderPatientMergePanel() : undefined}
          procedurePanel={renderProcedurePanel()}
          serviceRequestPanel={renderServiceRequestPanel()}
          workflowTaskPanel={renderWorkflowTaskPanel()}
        />
      );
    }

    if (appRoute === "documents") {
      return (
        <DocumentsPage
          documentFhirPreview={documentFhirPreview}
          documentPanel={renderDocumentPanel()}
          documentProvenanceFhirPreview={documentProvenanceFhirPreview}
          patientListPanel={renderPatientListPanel()}
        />
      );
    }

    if (appRoute === "audit") {
      return (
        <AuditLogPage
          auditPanel={renderAuditPanel()}
          globalAuditPanel={renderGlobalAuditPanel()}
        />
      );
    }

    if (appRoute === "interop") {
      return (
        <InteropPage
          allergyIntoleranceFhirPreview={allergyIntoleranceFhirPreview}
          capabilityStatementPreview={capabilityStatementPreview}
          conditionFhirPreview={conditionFhirPreview}
          consentFhirPreview={consentFhirPreview}
          consentInteropPanel={renderConsentInteropPanel()}
          diagnosticReportFhirPreview={diagnosticReportFhirPreview}
          documentFhirPreview={documentFhirPreview}
          documentProvenanceFhirPreview={documentProvenanceFhirPreview}
          encounterFhirPreview={encounterFhirPreview}
          imagingStudyFhirPreview={imagingStudyFhirPreview}
          medicationAdministrationFhirPreview={medicationAdministrationFhirPreview}
          medicationDispenseFhirPreview={medicationDispenseFhirPreview}
          medicationRequestFhirPreview={medicationRequestFhirPreview}
          observationFhirPreview={observationFhirPreview}
          patientFhirBundlePreview={patientFhirBundlePreview}
          patientFhirDocumentBundlePreview={patientFhirDocumentBundlePreview}
          patientFhirPreview={patientFhirPreview}
          procedureFhirPreview={procedureFhirPreview}
          providerDirectoryFhirPreview={providerDirectoryFhirPreview}
          providerDirectoryPanel={renderProviderDirectoryPanel()}
          recordTransferFhirTaskPreview={recordTransferFhirTaskPreview}
          recordTransferInteropPanel={renderRecordTransferInteropPanel()}
          referenceSignals={referenceSignals}
          serviceRequestFhirPreview={serviceRequestFhirPreview}
          workflowSteps={workflowSteps}
          workflowTaskFhirPreview={workflowTaskFhirPreview}
        />
      );
    }

    if (appRoute === "settings") {
      return (
        <SettingsPage
          apiBaseUrl={apiBaseUrl}
          apiRuntimeInfo={apiRuntimeInfo}
          apiRuntimeWarning={apiRuntimeWarning}
          authSession={authSession}
          canViewRuntimeInfo={canViewRuntimeInfo}
          loginForm={loginForm}
          onReloadRuntimeInfo={() => void loadApiRuntimeInfo()}
        />
      );
    }

    return (
      <DashboardPage
        latestEncounterServiceType={encounters[0]?.serviceType}
        metrics={{
          allergyIntolerances: allergyIntolerances.length,
          clinicalDocuments: clinicalDocuments.length,
          conditions: conditions.length,
          diagnosticReports: diagnosticReports.length,
          draftDocuments: draftDocuments.length,
          imagingStudies: imagingStudies.length,
          medicationAdministrations: medicationAdministrations.length,
          medicationDispenses: medicationDispenses.length,
          medicationRequests: medicationRequests.length,
          observations: observations.length,
          openEncounters: openEncounters.length,
          patients: patients.length,
          procedures: procedures.length,
          providerEndpoints: providerDirectory?.endpoints.length ?? 0,
          providerOrganizations: providerDirectory?.organizations.length ?? 0,
          recordTransfers: recordTransfers.length,
          serviceRequests: serviceRequests.length,
          workflowTasks: workflowTasks.length
        }}
        onNavigate={setAppRoute}
        selectedPatient={selectedPatient}
      />
    );
  }

  function renderPatientListPanel(): ReactNode {
    return (
      <PatientListPanel
        patients={patients}
        visiblePatients={visiblePatients}
        selectedPatientId={selectedPatientId}
        searchTerm={patientSearchTerm}
        statusFilter={patientStatusFilter}
        hasFilter={hasPatientListFilter}
        isLoading={isLoadingPatients}
        onClearFilters={() => {
          setPatientSearchTerm("");
          setPatientStatusFilter("all");
        }}
        onRefresh={loadPatients}
        onSearchTermChange={setPatientSearchTerm}
        onSelectPatient={setSelectedPatientId}
        onStatusFilterChange={setPatientStatusFilter}
      />
    );
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
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Chuyển hồ sơ liên viện</p>
            <h2>Gói chuyển hồ sơ</h2>
          </div>
          <span className="pill cyan">
            {isLoadingRecordTransfers
              ? "đang tải"
              : `${recordTransfers.length} gói`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {recordTransfers.map((recordTransfer) => (
              <button
                className={
                  recordTransfer.id === selectedRecordTransferId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={recordTransfer.id}
                type="button"
                onClick={() => setSelectedRecordTransferId(recordTransfer.id)}
              >
                <span>{formatRecordTransferStatus(recordTransfer.status)}</span>
                <strong>{formatRecordTransferBundleType(recordTransfer.bundleType)}</strong>
                <small>
                  {recordTransfer.recipientOrganizationId} · {formatDateTime(recordTransfer.requestedAt)}
                </small>
              </button>
            ))}
            {recordTransfers.length === 0 ? (
              <p className="empty-state">
                Chưa có gói chuyển hồ sơ. API sẽ kiểm consent trước khi cho tạo yêu cầu chuyển.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedRecordTransfer ? (
              <>
                {renderRecordTransferOperationalSummary(
                  selectedRecordTransfer,
                  recordTransferDeliveryAttempts
                )}
                <div className="document-meta">
                  <Info label="Trạng thái" value={formatRecordTransferStatus(selectedRecordTransfer.status)} />
                  <Info label="Độ ưu tiên" value={formatRecordTransferPriority(selectedRecordTransfer.priority)} />
                  <Info label="Bundle" value={selectedRecordTransfer.bundleId} />
                  <Info label="Loại gói" value={formatRecordTransferBundleType(selectedRecordTransfer.bundleType)} />
                  <Info label="Cơ sở gửi" value={selectedRecordTransfer.sourceOrganizationId} />
                  <Info label="Cơ sở nhận" value={selectedRecordTransfer.recipientOrganizationId} />
                  <Info label="Consent" value={selectedRecordTransfer.consentReference} />
                  <Info label="Người tạo" value={selectedRecordTransfer.requestedByActorId} />
                  <Info label="Thời điểm gửi" value={selectedRecordTransfer.sentAt ? formatDateTime(selectedRecordTransfer.sentAt) : "Chưa gửi"} />
                  <Info label="Thời điểm nhận" value={selectedRecordTransfer.receivedAt ? formatDateTime(selectedRecordTransfer.receivedAt) : "Chưa xác nhận"} />
                  <Info label="Người xác nhận nhận" value={selectedRecordTransfer.receivedByActorId ?? "Chưa xác nhận"} />
                  <Info label="Biên nhận tiếp nhận" value={selectedRecordTransfer.acknowledgementReference ?? "Chưa phát sinh"} />
                  <Info label="Lỗi gửi" value={selectedRecordTransfer.failureReason ?? "Chưa ghi nhận"} />
                  <Info label="Thử lại" value={formatRecordTransferRetryCount(selectedRecordTransfer.retryCount)} />
                  <Info label="Hẹn gửi lại" value={selectedRecordTransfer.nextRetryAt ? formatDateTime(selectedRecordTransfer.nextRetryAt) : "Chưa hẹn"} />
                  <Info label="Hàng lỗi cuối" value={selectedRecordTransfer.deadLetteredAt ? formatDateTime(selectedRecordTransfer.deadLetteredAt) : "Chưa đưa vào"} />
                </div>
                <div className="panel-actions">
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      isSelectedPatientMerged ||
                      Boolean(selectedRecordTransfer.sentAt) ||
                      ["completed", "cancelled", "failed", "dead-lettered"].includes(selectedRecordTransfer.status) ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleSendRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Đánh dấu đã gửi"}
                  </button>
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      isSelectedPatientMerged ||
                      !selectedRecordTransfer.sentAt ||
                      selectedRecordTransfer.status !== "in-progress" ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleReceiveRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Xác nhận đã nhận"}
                  </button>
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      isSelectedPatientMerged ||
                      selectedRecordTransfer.status === "completed" ||
                      selectedRecordTransfer.status === "cancelled" ||
                      selectedRecordTransfer.status === "failed" ||
                      selectedRecordTransfer.status === "dead-lettered" ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleFailRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Ghi nhận lỗi gửi"}
                  </button>
                  <button
                    className="ghost-button compact-button"
                    type="button"
                    disabled={
                      isSelectedPatientMerged ||
                      selectedRecordTransfer.status !== "failed" ||
                      transitioningRecordTransferId === selectedRecordTransfer.id
                    }
                    onClick={() => void handleRetryRecordTransfer(selectedRecordTransfer)}
                  >
                    {transitioningRecordTransferId === selectedRecordTransfer.id
                      ? "Đang cập nhật..."
                      : "Đưa vào hàng đợi gửi lại"}
                  </button>
                </div>
                <p className="empty-state">
                  RecordTransfer là lớp điều phối nội bộ: sản phẩm dùng nó để theo dõi gửi/nhận,
                  còn khi liên thông chuẩn sẽ xuất thành FHIR Task trỏ tới Bundle và consent tương ứng.
                </p>
                {selectedRecordTransfer.status === "dead-lettered" ? (
                  <p className="transfer-alert">
                    Gói này đã vượt quá số lần thử gửi tự động. Cần kiểm tra endpoint FHIR,
                    consent, mạng hoặc cấu hình bên nhận trước khi tạo luồng xử lý tiếp theo.
                  </p>
                ) : null}
                {renderRecordTransferDeliveryAttemptList()}
              </>
            ) : (
              <p className="empty-state">Chọn một gói chuyển để xem siêu dữ liệu và xuất FHIR Task.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateRecordTransfer(event)}>
          <label>
            Độ ưu tiên
            <select
              value={recordTransferForm.priority}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  priority: event.target.value as RecordTransferPriority
                })
              }
            >
              <option value="routine">Thường quy</option>
              <option value="urgent">Khẩn</option>
              <option value="asap">Càng sớm càng tốt</option>
              <option value="stat">Cấp cứu</option>
            </select>
          </label>
          <label>
            Loại Bundle
            <select
              value={recordTransferForm.bundleType}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  bundleType: event.target.value as RecordTransferBundleType
                })
              }
            >
              <option value="document">Document Bundle</option>
              <option value="collection">Collection Bundle</option>
            </select>
          </label>
          <label>
            Cơ sở gửi
            <input
              value={recordTransferForm.sourceOrganizationId}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  sourceOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label>
            Cơ sở nhận
            <input
              value={recordTransferForm.recipientOrganizationId}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  recipientOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label>
            Consent
            <input
              value={recordTransferForm.consentReference}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  consentReference: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Lý do chuyển hồ sơ
            <input
              value={recordTransferForm.reason}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  reason: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú vận hành
            <input
              value={recordTransferForm.note}
              onChange={(event) =>
                setRecordTransferForm({
                  ...recordTransferForm,
                  note: event.target.value
                })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={selectedPatientWriteDisabled || isSubmittingRecordTransfer}
          >
            {isSubmittingRecordTransfer ? "Đang tạo..." : "Tạo gói chuyển hồ sơ"}
          </button>
        </form>
      </article>
    );
  }

  function renderRecordTransferDeliveryAttemptList(): ReactNode {
    return (
      <div className="delivery-attempts">
        <div className="subsection-heading">
          <div>
            <strong>Lịch sử gửi qua endpoint</strong>
            <span>
              Outbox vận hành cho biết hệ thống đã xếp hàng, gửi thành công hay lỗi từng lần.
            </span>
          </div>
          <span className="pill cyan">
            {isLoadingRecordTransferDeliveryAttempts
              ? "đang tải"
              : `${recordTransferDeliveryAttempts.length} lần`}
          </span>
        </div>

        {recordTransferDeliveryAttemptWarning ? (
          <p className="transfer-alert">{recordTransferDeliveryAttemptWarning}</p>
        ) : null}

        {recordTransferDeliveryAttempts.map((attempt) => (
          <div
            className={`delivery-attempt delivery-attempt--${attempt.status}`}
            key={attempt.id}
          >
            <div>
              <span>Lần gửi</span>
              <strong>#{attempt.attemptNumber}</strong>
            </div>
            <div>
              <span>Trạng thái</span>
              <strong>{formatRecordTransferDeliveryAttemptStatus(attempt.status)}</strong>
            </div>
            <div>
              <span>HTTP</span>
              <strong>{attempt.httpStatus ? `HTTP ${attempt.httpStatus}` : "Chưa có"}</strong>
            </div>
            <div>
              <span>Xếp hàng</span>
              <strong>{formatDateTime(attempt.queuedAt)}</strong>
            </div>
            <div>
              <span>Hoàn tất</span>
              <strong>{attempt.completedAt ? formatDateTime(attempt.completedAt) : "Đang chờ"}</strong>
            </div>
            <div className="delivery-attempt-wide">
              <span>Endpoint đích</span>
              <strong>{attempt.targetEndpointAddress}</strong>
            </div>
            <div className="delivery-attempt-wide">
              <span>Idempotency key</span>
              <strong className="hash-text">{attempt.idempotencyKey}</strong>
            </div>
            {attempt.errorMessage || attempt.responseBodyPreview ? (
              <div className="delivery-attempt-wide">
                <span>{attempt.errorMessage ? "Lỗi" : "Phản hồi"}</span>
                <strong>{attempt.errorMessage ?? attempt.responseBodyPreview}</strong>
              </div>
            ) : null}
          </div>
        ))}

        {!isLoadingRecordTransferDeliveryAttempts &&
        recordTransferDeliveryAttempts.length === 0 ? (
          <p className="empty-state">
            Chưa có lần gửi nào. Khi bấm gửi, API sẽ tạo delivery attempt kèm endpoint,
            Bundle và idempotency key để worker xử lý.
          </p>
        ) : null}
      </div>
    );
  }

  function renderRecordTransferOperationalSummary(
    recordTransfer: RecordTransfer,
    attempts: readonly RecordTransferDeliveryAttempt[]
  ): ReactNode {
    const summary = buildRecordTransferOperationalSummary(recordTransfer, attempts);

    return (
      <div className={`transfer-ops-summary transfer-ops-summary--${summary.severity}`}>
        <div className="transfer-ops-headline">
          <span>Tình trạng vận hành</span>
          <strong>{summary.title}</strong>
          <p>{summary.description}</p>
        </div>
        <div className="transfer-ops-grid">
          <Info label="Tín hiệu kỹ thuật" value={summary.technicalSignal} />
          <Info label="Số lần gửi" value={`${summary.attemptCount}`} />
          <Info label="Lần lỗi" value={`${summary.failedAttemptCount}`} />
          <Info label="HTTP gần nhất" value={summary.lastHttpStatus} />
          <Info label="Lịch retry" value={summary.nextRetry} />
        </div>
        <div className="transfer-ops-action">
          <span>Việc cần làm tiếp</span>
          <strong>{summary.nextAction}</strong>
        </div>
      </div>
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

  function renderPatientDetailPanel(): ReactNode {
    return (
      <article className="panel patient-detail">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Patient chart</p>
            <h2>Hồ sơ đang chọn</h2>
          </div>
          {selectedPatient ? (
            <span className={`pill ${isSelectedPatientMerged ? "gold" : ""}`}>
              {formatPatientRecordStatus(selectedPatient.status)}
            </span>
          ) : null}
        </div>

        {selectedPatient && isSelectedPatientMerged ? (
          <div className="merged-patient-banner" role="status">
            <p className="eyebrow">Master Patient Index</p>
            <h3>Hồ sơ đã được merge và chuyển sang chế độ chỉ đọc</h3>
            <p>
              Không ghi thêm dữ liệu lâm sàng vào hồ sơ nguồn này. Các lượt khám, chỉ định,
              kết quả, thuốc và tài liệu mới cần được tạo trên hồ sơ đích để tránh phân mảnh
              bệnh án điện tử.
            </p>
            <div className="detail-grid compact">
              <Info
                label="Hồ sơ đích"
                value={
                  selectedPatientMergeTarget
                    ? `${selectedPatientMergeTarget.fullName} (${selectedPatient.mergedIntoPatientId})`
                    : selectedPatient.mergedIntoPatientId ?? "Chưa ghi nhận"
                }
              />
              <Info
                label="Thời điểm merge"
                value={selectedPatient.mergedAt ? formatDateTime(selectedPatient.mergedAt) : "Chưa ghi nhận"}
              />
              <Info label="Người thực hiện" value={selectedPatient.mergedByActorId ?? "Chưa ghi nhận"} />
              <Info label="Lý do" value={selectedPatient.mergeReason ?? "Chưa ghi nhận"} />
            </div>
          </div>
        ) : null}

        {selectedPatient ? (
          <div className="detail-grid">
            <Info label="Họ tên" value={selectedPatient.fullName} />
            <Info label="Ngày sinh" value={selectedPatient.birthDate ?? "Chưa có"} />
            <Info label="Giới tính" value={formatGender(selectedPatient.gender)} />
            <Info label="Điện thoại" value={selectedPatient.phone ?? "Chưa có"} />
            <Info label="Cơ sở quản lý" value={selectedPatient.managingOrganizationId} />
            <Info label="Cập nhật" value={formatDateTime(selectedPatient.updatedAt)} />
            <div className="identifiers">
              <span>Định danh</span>
              {selectedPatient.identifiers.map((identifier) => (
                <code key={`${identifier.system}:${identifier.value}`}>
                  {formatIdentifierType(identifier.type)} · {identifier.value}
                </code>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state">Chưa có bệnh nhân nào để hiển thị.</p>
        )}
      </article>
    );
  }

  function renderPatientMergePanel(): ReactNode {
    const canMergeSelectedPatient = Boolean(selectedPatient && selectedPatient.status === "active");

    return (
      <article className="panel patient-merge-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">MPI Governance</p>
            <h2>Đối soát và merge hồ sơ</h2>
          </div>
          <span className="pill gold">Admin-only</span>
        </div>

        <p className="empty-state">
          Dùng khi phát hiện hồ sơ đăng ký trùng. Hệ thống giữ lại hồ sơ nguồn để kiểm toán,
          đánh dấu chỉ đọc và ghi liên kết tới hồ sơ đích theo hướng Master Patient Index.
        </p>

        {selectedPatient ? (
          <div className="detail-grid compact">
            <Info
              label="Hồ sơ nguồn"
              value={`${selectedPatient.fullName} (${selectedPatient.identifiers[0]?.value ?? selectedPatient.id})`}
            />
            <Info label="Trạng thái nguồn" value={formatPatientRecordStatus(selectedPatient.status)} />
            <Info label="Mã xác nhận merge" value={patientMergeConfirmationCode} />
          </div>
        ) : null}

        <form className="patient-form" onSubmit={(event) => void handleMergeSelectedPatient(event)}>
          <label>
            Hồ sơ đích
            <select
              value={patientMergeTargetId}
              onChange={(event) =>
                setPatientMergeForm({
                  ...patientMergeForm,
                  targetPatientId: event.target.value
                })
              }
              disabled={!canMergeSelectedPatient || isMergingPatient || patientMergeCandidates.length === 0}
            >
              {patientMergeCandidates.length === 0 ? (
                <option value="">Không có hồ sơ đích khả dụng</option>
              ) : (
                patientMergeCandidates.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName} · {patient.identifiers[0]?.value ?? patient.id}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="wide-field">
            Lý do merge
            <input
              value={patientMergeForm.reason}
              onChange={(event) =>
                setPatientMergeForm({
                  ...patientMergeForm,
                  reason: event.target.value
                })
              }
              placeholder="Ví dụ: Trùng CCCD/BHYT sau khi đối soát MPI."
            />
          </label>

          <label className="wide-field">
            Nhập lại mã xác nhận của hồ sơ nguồn
            <input
              value={patientMergeForm.confirmationText}
              onChange={(event) =>
                setPatientMergeForm({
                  ...patientMergeForm,
                  confirmationText: event.target.value
                })
              }
              placeholder={patientMergeConfirmationCode || "Chọn hồ sơ nguồn trước"}
            />
          </label>

          {selectedPatient && patientMergeForm.confirmationText.trim() && !isPatientMergeConfirmationValid ? (
            <p className="transfer-alert wide-field">
              Mã xác nhận chưa khớp. Để tránh merge nhầm bệnh án, hãy nhập đúng{" "}
              <strong>{patientMergeConfirmationCode}</strong>.
            </p>
          ) : null}

          {selectedPatient && selectedPatient.status !== "active" ? (
            <p className="transfer-alert wide-field">
              Hồ sơ đang chọn không còn ở trạng thái hoạt động nên không thể dùng làm hồ sơ nguồn để merge.
            </p>
          ) : null}

          <button
            className="primary-button"
            type="submit"
            disabled={
              !canMergeSelectedPatient ||
              !patientMergeTargetId ||
              !patientMergeForm.reason.trim() ||
              !isPatientMergeConfirmationValid ||
              isMergingPatient
            }
          >
            {isMergingPatient ? "Đang merge..." : "Merge hồ sơ nguồn"}
          </button>
        </form>
      </article>
    );
  }

  function renderEncounterPanel(): ReactNode {
    return (
      <article className="panel encounter-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Encounter timeline</p>
            <h2>Lượt khám và đợt điều trị</h2>
          </div>
          <span className="pill cyan">{isLoadingEncounters ? "đang tải" : `${encounters.length} lượt`}</span>
        </div>

        <div className="encounter-layout">
          <div className="timeline">
            {encounters.map((encounter) => (
              <button
                className={encounter.id === selectedEncounterId ? "timeline-item selected" : "timeline-item"}
                key={encounter.id}
                type="button"
                onClick={() => setSelectedEncounterId(encounter.id)}
              >
                <span>{formatDateTime(encounter.startedAt)}</span>
                <strong>{encounter.serviceType}</strong>
                <small>
                  {formatEncounterClass(encounter.class)} · {formatEncounterStatus(encounter.status)}
                </small>
              </button>
            ))}
            {encounters.length === 0 ? (
              <p className="empty-state">Chưa có lượt khám nào cho bệnh nhân này.</p>
            ) : null}
          </div>

          <div className="encounter-summary">
            {selectedEncounter ? (
              <>
                <div className="document-meta">
                  <Info label="Lý do khám" value={selectedEncounter.reasonText} />
                  <Info label="Khoa/phòng" value={selectedEncounter.departmentId ?? "Chưa gắn"} />
                  <Info label="Nhân sự phụ trách" value={selectedEncounter.attendingPractitionerId} />
                  <Info label="Dị ứng gắn lượt khám" value={`${selectedEncounterAllergyIntolerances.length}`} />
                  <Info label="Chẩn đoán gắn lượt khám" value={`${selectedEncounterConditions.length}`} />
                  <Info label="Chỉ định dịch vụ gắn lượt khám" value={`${selectedEncounterServiceRequests.length}`} />
                  <Info label="Công việc thực thi gắn lượt khám" value={`${selectedEncounterWorkflowTasks.length}`} />
                  <Info label="Thủ thuật/hoạt động gắn lượt khám" value={`${selectedEncounterProcedures.length}`} />
                  <Info label="Chỉ số gắn lượt khám" value={`${selectedEncounterObservations.length}`} />
                  <Info label="Báo cáo kết quả gắn lượt khám" value={`${selectedEncounterDiagnosticReports.length}`} />
                  <Info label="Ảnh y khoa gắn lượt khám" value={`${selectedEncounterImagingStudies.length}`} />
                  <Info label="Thuốc gắn lượt khám" value={`${selectedEncounterMedicationRequests.length}`} />
                  <Info label="Cấp phát thuốc gắn lượt khám" value={`${selectedEncounterMedicationDispenses.length}`} />
                  <Info label="Dùng thuốc gắn lượt khám" value={`${selectedEncounterMedicationAdministrations.length}`} />
                  <Info label="Tài liệu gắn lượt khám" value={`${selectedEncounterDocuments.length}`} />
                </div>
                <div className="action-row">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={
                      isSelectedPatientMerged ||
                      selectedEncounter.status !== "in-progress" ||
                      isFinishingEncounter
                    }
                    onClick={() => void handleFinishEncounter(selectedEncounter.id)}
                  >
                    {isFinishingEncounter ? "Đang kết thúc..." : "Kết thúc lượt khám"}
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một lượt khám để xem chi tiết và xuất FHIR Encounter.</p>
            )}
          </div>
        </div>

        <form className="encounter-form" onSubmit={(event) => void handleCreateEncounter(event)}>
          <label>
            Loại lượt khám
            <select
              value={encounterForm.class}
              onChange={(event) =>
                setEncounterForm({ ...encounterForm, class: event.target.value as EncounterClass })
              }
            >
              <option value="ambulatory">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="emergency">Cấp cứu</option>
              <option value="virtual">Khám từ xa</option>
            </select>
          </label>
          <label>
            Dịch vụ/khoa khám
            <input
              value={encounterForm.serviceType}
              onChange={(event) => setEncounterForm({ ...encounterForm, serviceType: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Lý do khám
            <input
              value={encounterForm.reasonText}
              onChange={(event) => setEncounterForm({ ...encounterForm, reasonText: event.target.value })}
            />
          </label>
          <label>
            Khoa/phòng
            <input
              value={encounterForm.departmentId}
              onChange={(event) => setEncounterForm({ ...encounterForm, departmentId: event.target.value })}
            />
          </label>
          <label>
            Nhân sự phụ trách
            <input
              value={encounterForm.attendingPractitionerId}
              onChange={(event) =>
                setEncounterForm({ ...encounterForm, attendingPractitionerId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Thời điểm bắt đầu
            <input
              type="datetime-local"
              value={encounterForm.startedAt}
              onChange={(event) => setEncounterForm({ ...encounterForm, startedAt: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingEncounter}>
            {isSubmittingEncounter ? "Đang mở..." : "Mở lượt khám"}
          </button>
        </form>
      </article>
    );
  }

  function renderAllergyIntolerancePanel(): ReactNode {
    return (
      <article className="panel allergy-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Allergy safety</p>
            <h2>Dị ứng và cảnh báo an toàn</h2>
          </div>
          <span className="pill cyan">
            {isLoadingAllergyIntolerances ? "đang tải" : `${allergyIntolerances.length} cảnh báo`}
          </span>
        </div>

        <div className="document-layout">
          <div className="allergy-cards">
            {allergyIntolerances.map((allergyIntolerance) => (
              <button
                className={
                  allergyIntolerance.id === selectedAllergyIntoleranceId
                    ? "allergy-card selected"
                    : "allergy-card"
                }
                key={allergyIntolerance.id}
                type="button"
                onClick={() => setSelectedAllergyIntoleranceId(allergyIntolerance.id)}
              >
                <span>{formatAllergyCategory(allergyIntolerance.category)}</span>
                <strong>{allergyIntolerance.code.display}</strong>
                <small>
                  {formatAllergyCriticality(allergyIntolerance.criticality)} ·{" "}
                  {formatDateTime(allergyIntolerance.recordedAt)}
                </small>
              </button>
            ))}
            {allergyIntolerances.length === 0 ? (
              <p className="empty-state">
                Chưa có dị ứng/cảnh báo có cấu trúc. Khi kê thuốc, đây là vùng cần kiểm tra trước tiên.
              </p>
            ) : null}
          </div>

          <div className="allergy-summary">
            {selectedAllergyIntolerance ? (
              <>
                <div className="document-meta">
                  <Info label="Tác nhân" value={selectedAllergyIntolerance.code.display} />
                  <Info label="Loại" value={formatAllergyType(selectedAllergyIntolerance.type)} />
                  <Info label="Nhóm" value={formatAllergyCategory(selectedAllergyIntolerance.category)} />
                  <Info label="Mức cảnh báo" value={formatAllergyCriticality(selectedAllergyIntolerance.criticality)} />
                  <Info label="Lâm sàng" value={formatAllergyClinicalStatus(selectedAllergyIntolerance.clinicalStatus)} />
                  <Info label="Xác minh" value={formatAllergyVerificationStatus(selectedAllergyIntolerance.verificationStatus)} />
                  <Info label="Biểu hiện" value={selectedAllergyIntolerance.reaction?.manifestation.display ?? "Chưa ghi"} />
                  <Info label="Encounter" value={selectedAllergyIntolerance.encounterId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  AllergyIntolerance giúp hệ thống cảnh báo trước khi kê thuốc hoặc chuyển hồ sơ, tránh để dị ứng chỉ nằm trong ghi chú tự do.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một dị ứng/cảnh báo để xem siêu dữ liệu và xuất FHIR AllergyIntolerance.</p>
            )}
          </div>
        </div>

        <form className="allergy-form" onSubmit={(event) => void handleCreateAllergyIntolerance(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={allergyIntoleranceForm.encounterId}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại
            <select
              value={allergyIntoleranceForm.type}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, type: event.target.value as AllergyType })
              }
            >
              <option value="allergy">Dị ứng</option>
              <option value="intolerance">Không dung nạp</option>
            </select>
          </label>
          <label>
            Nhóm
            <select
              value={allergyIntoleranceForm.category}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  category: event.target.value as AllergyCategory
                })
              }
            >
              <option value="medication">Thuốc</option>
              <option value="food">Thực phẩm</option>
              <option value="environment">Môi trường</option>
              <option value="biologic">Sinh phẩm</option>
            </select>
          </label>
          <label>
            Mức cảnh báo
            <select
              value={allergyIntoleranceForm.criticality}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  criticality: event.target.value as "" | AllergyCriticality
                })
              }
            >
              <option value="">Chưa đánh giá</option>
              <option value="low">Thấp</option>
              <option value="high">Cao</option>
              <option value="unable-to-assess">Chưa thể đánh giá</option>
            </select>
          </label>
          <label>
            Trạng thái lâm sàng
            <select
              value={allergyIntoleranceForm.clinicalStatus}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  clinicalStatus: event.target.value as AllergyClinicalStatus
                })
              }
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </label>
          <label>
            Trạng thái xác minh
            <select
              value={allergyIntoleranceForm.verificationStatus}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  verificationStatus: event.target.value as AllergyVerificationStatus
                })
              }
            >
              <option value="confirmed">Đã xác nhận</option>
              <option value="unconfirmed">Chưa xác nhận</option>
              <option value="refuted">Đã loại trừ</option>
              <option value="entered-in-error">Nhập lỗi</option>
            </select>
          </label>
          <label>
            Hệ mã tác nhân
            <input
              value={allergyIntoleranceForm.codeSystem}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, codeSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã tác nhân
            <input
              value={allergyIntoleranceForm.code}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, code: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên tác nhân
            <input
              value={allergyIntoleranceForm.codeDisplay}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, codeDisplay: event.target.value })
              }
            />
          </label>
          <label>
            Mã biểu hiện
            <input
              value={allergyIntoleranceForm.manifestationCode}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  manifestationCode: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Biểu hiện phản ứng
            <input
              value={allergyIntoleranceForm.manifestationDisplay}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  manifestationDisplay: event.target.value
                })
              }
            />
          </label>
          <label>
            Mức độ phản ứng
            <select
              value={allergyIntoleranceForm.reactionSeverity}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  reactionSeverity: event.target.value as "" | AllergyReactionSeverity
                })
              }
            >
              <option value="">Chưa ghi</option>
              <option value="mild">Nhẹ</option>
              <option value="moderate">Trung bình</option>
              <option value="severe">Nặng</option>
            </select>
          </label>
          <label>
            Thời điểm ghi nhận
            <input
              type="datetime-local"
              value={allergyIntoleranceForm.recordedAt}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, recordedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Người ghi nhận
            <input
              value={allergyIntoleranceForm.recorderPractitionerId}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  recorderPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả phản ứng
            <input
              value={allergyIntoleranceForm.reactionDescription}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  reactionDescription: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={allergyIntoleranceForm.note}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, note: event.target.value })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={selectedPatientWriteDisabled || isSubmittingAllergyIntolerance}
          >
            {isSubmittingAllergyIntolerance ? "Đang ghi nhận..." : "Ghi nhận dị ứng/cảnh báo"}
          </button>
        </form>
      </article>
    );
  }

  function renderConditionPanel(): ReactNode {
    return (
      <article className="panel condition-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Conditions</p>
            <h2>Chẩn đoán và vấn đề sức khỏe</h2>
          </div>
          <span className="pill cyan">{isLoadingConditions ? "đang tải" : `${conditions.length} chẩn đoán`}</span>
        </div>

        <div className="document-layout">
          <div className="condition-cards">
            {conditions.map((condition) => (
              <button
                className={condition.id === selectedConditionId ? "condition-card selected" : "condition-card"}
                key={condition.id}
                type="button"
                onClick={() => setSelectedConditionId(condition.id)}
              >
                <span>{formatConditionCategory(condition.category)}</span>
                <strong>{condition.code.display}</strong>
                <small>
                  {formatConditionClinicalStatus(condition.clinicalStatus)} ·{" "}
                  {formatDateTime(condition.recordedAt)}
                </small>
              </button>
            ))}
            {conditions.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chẩn đoán có cấu trúc. Hãy ghi nhận vấn đề sức khỏe đầu tiên.
              </p>
            ) : null}
          </div>

          <div className="condition-summary">
            {selectedCondition ? (
              <>
                <div className="document-meta">
                  <Info label="Nhóm" value={formatConditionCategory(selectedCondition.category)} />
                  <Info label="Lâm sàng" value={formatConditionClinicalStatus(selectedCondition.clinicalStatus)} />
                  <Info label="Xác minh" value={formatConditionVerificationStatus(selectedCondition.verificationStatus)} />
                  <Info label="Mã chuẩn" value={`${selectedCondition.code.system} · ${selectedCondition.code.code}`} />
                  <Info label="Mức độ" value={selectedCondition.severity ? formatConditionSeverity(selectedCondition.severity) : "Chưa gắn"} />
                  <Info label="Encounter" value={selectedCondition.encounterId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Condition giúp bên nhận hiểu chẩn đoán/vấn đề sức khỏe ở dạng có cấu trúc, thay vì chỉ đọc thủ công trong file PDF.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chẩn đoán để xem siêu dữ liệu và xuất FHIR Condition.</p>
            )}
          </div>
        </div>

        <form className="condition-form" onSubmit={(event) => void handleCreateCondition(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={conditionForm.encounterId}
              onChange={(event) => setConditionForm({ ...conditionForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại chẩn đoán
            <select
              value={conditionForm.category}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, category: event.target.value as ConditionCategory })
              }
            >
              <option value="encounter-diagnosis">Chẩn đoán theo lượt khám</option>
              <option value="problem-list-item">Vấn đề sức khỏe dài hạn</option>
            </select>
          </label>
          <label>
            Trạng thái lâm sàng
            <select
              value={conditionForm.clinicalStatus}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, clinicalStatus: event.target.value as ConditionClinicalStatus })
              }
            >
              <option value="active">Đang hoạt động</option>
              <option value="recurrence">Tái phát</option>
              <option value="relapse">Diễn tiến lại</option>
              <option value="inactive">Không hoạt động</option>
              <option value="remission">Thuyên giảm</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </label>
          <label>
            Trạng thái xác minh
            <select
              value={conditionForm.verificationStatus}
              onChange={(event) =>
                setConditionForm({
                  ...conditionForm,
                  verificationStatus: event.target.value as ConditionVerificationStatus
                })
              }
            >
              <option value="confirmed">Đã xác nhận</option>
              <option value="provisional">Tạm thời</option>
              <option value="differential">Chẩn đoán phân biệt</option>
              <option value="unconfirmed">Chưa xác nhận</option>
              <option value="refuted">Đã loại trừ</option>
              <option value="entered-in-error">Nhập lỗi</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={conditionForm.codeSystem}
              onChange={(event) => setConditionForm({ ...conditionForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã chẩn đoán
            <input
              value={conditionForm.code}
              onChange={(event) => setConditionForm({ ...conditionForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên chẩn đoán
            <input
              value={conditionForm.codeDisplay}
              onChange={(event) => setConditionForm({ ...conditionForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Mức độ
            <select
              value={conditionForm.severity}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, severity: event.target.value as "" | ConditionSeverity })
              }
            >
              <option value="">Chưa gắn</option>
              <option value="mild">Nhẹ</option>
              <option value="moderate">Trung bình</option>
              <option value="severe">Nặng</option>
            </select>
          </label>
          <label>
            Thời điểm khởi phát
            <input
              type="datetime-local"
              value={conditionForm.onsetAt}
              onChange={(event) => setConditionForm({ ...conditionForm, onsetAt: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Nhân sự ghi nhận
            <input
              value={conditionForm.recorderPractitionerId}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, recorderPractitionerId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={conditionForm.note}
              onChange={(event) => setConditionForm({ ...conditionForm, note: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingCondition}>
            {isSubmittingCondition ? "Đang ghi nhận..." : "Ghi nhận chẩn đoán"}
          </button>
        </form>
      </article>
    );
  }

  function renderServiceRequestPanel(): ReactNode {
    return (
      <article className="panel service-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Service requests</p>
            <h2>Chỉ định xét nghiệm, hình ảnh và dịch vụ</h2>
          </div>
          <span className="pill cyan">
            {isLoadingServiceRequests ? "đang tải" : `${serviceRequests.length} chỉ định`}
          </span>
        </div>

        <div className="document-layout">
          <div className="service-cards">
            {serviceRequests.map((serviceRequest) => (
              <button
                className={serviceRequest.id === selectedServiceRequestId ? "service-card selected" : "service-card"}
                key={serviceRequest.id}
                type="button"
                onClick={() => setSelectedServiceRequestId(serviceRequest.id)}
              >
                <span>{formatServiceRequestCategory(serviceRequest.category)}</span>
                <strong>{serviceRequest.code.display}</strong>
                <small>
                  {formatServiceRequestPriority(serviceRequest.priority)} ·{" "}
                  {formatDateTime(serviceRequest.authoredOn)}
                </small>
              </button>
            ))}
            {serviceRequests.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ định dịch vụ. Hãy tạo ServiceRequest để nối luồng EMR với LIS/PACS.
              </p>
            ) : null}
          </div>

          <div className="service-summary">
            {selectedServiceRequest ? (
              <>
                <div className="document-meta">
                  <Info label="Dịch vụ" value={selectedServiceRequest.code.display} />
                  <Info label="Mã dịch vụ" value={`${selectedServiceRequest.code.system} · ${selectedServiceRequest.code.code}`} />
                  <Info label="Nhóm" value={formatServiceRequestCategory(selectedServiceRequest.category)} />
                  <Info label="Trạng thái" value={formatServiceRequestStatus(selectedServiceRequest.status)} />
                  <Info label="Mục đích" value={formatServiceRequestIntent(selectedServiceRequest.intent)} />
                  <Info label="Ưu tiên" value={formatServiceRequestPriority(selectedServiceRequest.priority)} />
                  <Info label="Khoa thực hiện" value={selectedServiceRequest.performerOrganizationId ?? "Chưa gắn"} />
                  <Info label="Dự kiến thực hiện" value={selectedServiceRequest.occurrenceAt ? formatDateTime(selectedServiceRequest.occurrenceAt) : "Chưa gắn"} />
                  <Info label="Chẩn đoán liên quan" value={selectedServiceRequest.reasonConditionId ?? "Chưa gắn"} />
                  <Info label="Người chỉ định" value={selectedServiceRequest.requesterPractitionerId} />
                </div>
                <p className="empty-state">
                  ServiceRequest là y lệnh dịch vụ máy đọc được: xét nghiệm đi sang LIS, chẩn đoán hình ảnh đi sang PACS/RIS, còn kết quả về sau có thể gom bằng Observation hoặc DiagnosticReport.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ định dịch vụ để xem siêu dữ liệu và xuất FHIR ServiceRequest.</p>
            )}
          </div>
        </div>

        <form className="service-form" onSubmit={(event) => void handleCreateServiceRequest(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={serviceRequestForm.encounterId}
              onChange={(event) =>
                setServiceRequestForm({ ...serviceRequestForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán liên quan
            <select
              value={serviceRequestForm.reasonConditionId}
              onChange={(event) =>
                setServiceRequestForm({ ...serviceRequestForm, reasonConditionId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm dịch vụ
            <select
              value={serviceRequestForm.category}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  category: event.target.value as ServiceRequestCategory
                })
              }
            >
              <option value="laboratory">Xét nghiệm</option>
              <option value="imaging">Chẩn đoán hình ảnh</option>
              <option value="procedure">Thủ thuật</option>
              <option value="consultation">Hội chẩn/tư vấn</option>
              <option value="therapy">Điều trị/phục hồi</option>
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              value={serviceRequestForm.priority}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  priority: event.target.value as ServiceRequestPriority
                })
              }
            >
              <option value="routine">Thông thường</option>
              <option value="urgent">Khẩn</option>
              <option value="asap">Càng sớm càng tốt</option>
              <option value="stat">Cấp cứu ngay</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={serviceRequestForm.codeSystem}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã dịch vụ
            <input
              value={serviceRequestForm.code}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên dịch vụ
            <input
              value={serviceRequestForm.codeDisplay}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Thời điểm chỉ định
            <input
              type="datetime-local"
              value={serviceRequestForm.authoredOn}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, authoredOn: event.target.value })}
            />
          </label>
          <label>
            Dự kiến thực hiện
            <input
              type="datetime-local"
              value={serviceRequestForm.occurrenceAt}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, occurrenceAt: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Người chỉ định
            <input
              value={serviceRequestForm.requesterPractitionerId}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  requesterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Khoa/phòng thực hiện
            <input
              value={serviceRequestForm.performerOrganizationId}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  performerOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Hướng dẫn cho người bệnh
            <input
              value={serviceRequestForm.patientInstruction}
              onChange={(event) =>
                setServiceRequestForm({
                  ...serviceRequestForm,
                  patientInstruction: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={serviceRequestForm.note}
              onChange={(event) => setServiceRequestForm({ ...serviceRequestForm, note: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingServiceRequest}>
            {isSubmittingServiceRequest ? "Đang tạo..." : "Tạo chỉ định dịch vụ"}
          </button>
        </form>
      </article>
    );
  }

  function renderWorkflowTaskPanel(): ReactNode {
    return (
      <article className="panel service-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Task queue</p>
            <h2>Luồng công việc thực thi y lệnh</h2>
          </div>
          <span className="pill cyan">
            {isLoadingWorkflowTasks ? "đang tải" : `${workflowTasks.length} công việc`}
          </span>
        </div>

        <div className="document-layout">
          <div className="service-cards">
            {workflowTasks.map((task) => (
              <button
                className={task.id === selectedWorkflowTaskId ? "service-card selected" : "service-card"}
                key={task.id}
                type="button"
                onClick={() => setSelectedWorkflowTaskId(task.id)}
              >
                <span>{formatWorkflowTaskStatus(task.status)}</span>
                <strong>{task.code.display}</strong>
                <small>
                  {formatServiceRequestPriority(task.priority)} · {formatDateTime(task.lastModified)}
                </small>
              </button>
            ))}
            {workflowTasks.length === 0 ? (
              <p className="empty-state">
                Chưa có Task cho bệnh nhân này. Task dùng để theo dõi y lệnh đang ở hàng đợi LIS/PACS, ai phụ trách và kết quả nào đã quay về EMR.
              </p>
            ) : null}
          </div>

          <div className="service-summary">
            {selectedWorkflowTask ? (
              <>
                <div className="document-meta">
                  <Info label="Công việc" value={selectedWorkflowTask.code.display} />
                  <Info label="Trạng thái FHIR" value={formatWorkflowTaskStatus(selectedWorkflowTask.status)} />
                  <Info label="Trạng thái nghiệp vụ" value={selectedWorkflowTask.businessStatus?.display ?? "Chưa gắn"} />
                  <Info label="Y lệnh gốc" value={selectedWorkflowTask.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Khoa/phòng phụ trách" value={selectedWorkflowTask.ownerOrganizationId ?? "Chưa gắn"} />
                  <Info label="Người phụ trách" value={selectedWorkflowTask.ownerPractitionerId ?? "Chưa gắn"} />
                  <Info label="Tạo lúc" value={formatDateTime(selectedWorkflowTask.authoredOn)} />
                  <Info label="Cập nhật" value={formatDateTime(selectedWorkflowTask.lastModified)} />
                  <Info
                    label="Bắt đầu"
                    value={
                      selectedWorkflowTask.executionPeriod?.start
                        ? formatDateTime(selectedWorkflowTask.executionPeriod.start)
                        : "Chưa gắn"
                    }
                  />
                  <Info
                    label="Kết thúc"
                    value={
                      selectedWorkflowTask.executionPeriod?.end
                        ? formatDateTime(selectedWorkflowTask.executionPeriod.end)
                        : "Chưa gắn"
                    }
                  />
                </div>
                <div className="reference-list compact-list">
                  <div>
                    <strong>Input</strong>
                    <span>{formatWorkflowTaskReferences(selectedWorkflowTask.inputReferences)}</span>
                  </div>
                  <div>
                    <strong>Output</strong>
                    <span>{formatWorkflowTaskReferences(selectedWorkflowTask.outputReferences)}</span>
                  </div>
                </div>
                <p className="empty-state">
                  FHIR Task không thay thế ServiceRequest; nó theo dõi việc thực thi ServiceRequest qua từng hàng đợi, chủ sở hữu, thời gian xử lý và kết quả đầu ra.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một công việc để xem siêu dữ liệu và xuất FHIR Task.</p>
            )}
          </div>
        </div>
      </article>
    );
  }

  function renderProcedurePanel(): ReactNode {
    return (
      <article className="panel service-request-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Clinical procedures</p>
            <h2>Thủ thuật và hoạt động đã thực hiện</h2>
          </div>
          <span className="pill cyan">
            {isLoadingProcedures ? "đang tải" : `${procedures.length} bản ghi`}
          </span>
        </div>

        <div className="document-layout">
          <div className="service-cards">
            {procedures.map((procedure) => (
              <button
                className={procedure.id === selectedProcedureId ? "service-card selected" : "service-card"}
                key={procedure.id}
                type="button"
                onClick={() => setSelectedProcedureId(procedure.id)}
              >
                <span>{formatProcedureCategory(procedure.category)}</span>
                <strong>{procedure.code.display}</strong>
                <small>
                  {formatProcedureStatus(procedure.status)} ·{" "}
                  {procedure.performedPeriod?.start
                    ? formatDateTime(procedure.performedPeriod.start)
                    : formatDateTime(procedure.updatedAt)}
                </small>
              </button>
            ))}
            {procedures.length === 0 ? (
              <p className="empty-state">
                Chưa có Procedure cho bệnh nhân này. Procedure ghi lại hành động y tế đã thực hiện, còn ServiceRequest là y lệnh và Task là hàng đợi xử lý.
              </p>
            ) : null}
          </div>

          <div className="service-summary">
            {selectedProcedure ? (
              <>
                <div className="document-meta">
                  <Info label="Hoạt động" value={selectedProcedure.code.display} />
                  <Info label="Mã chuẩn" value={`${selectedProcedure.code.system} · ${selectedProcedure.code.code}`} />
                  <Info label="Nhóm" value={formatProcedureCategory(selectedProcedure.category)} />
                  <Info label="Trạng thái FHIR" value={formatProcedureStatus(selectedProcedure.status)} />
                  <Info label="Y lệnh gốc" value={selectedProcedure.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Chẩn đoán/lý do" value={selectedProcedure.reasonConditionId ?? "Chưa gắn"} />
                  <Info
                    label="Bắt đầu"
                    value={
                      selectedProcedure.performedPeriod?.start
                        ? formatDateTime(selectedProcedure.performedPeriod.start)
                        : "Chưa gắn"
                    }
                  />
                  <Info
                    label="Kết thúc"
                    value={
                      selectedProcedure.performedPeriod?.end
                        ? formatDateTime(selectedProcedure.performedPeriod.end)
                        : "Chưa gắn"
                    }
                  />
                  <Info label="Người ghi nhận" value={selectedProcedure.recorderPractitionerId ?? "Chưa gắn"} />
                  <Info label="Người xác nhận" value={selectedProcedure.asserterPractitionerId ?? "Chưa gắn"} />
                  <Info label="Vị trí/cơ quan" value={selectedProcedure.bodySite?.display ?? "Chưa gắn"} />
                  <Info label="Kết quả thủ thuật" value={selectedProcedure.outcome?.display ?? "Chưa gắn"} />
                </div>
                <div className="reference-list compact-list">
                  <div>
                    <strong>Người/đơn vị thực hiện</strong>
                    <span>{formatProcedurePerformers(selectedProcedure.performers)}</span>
                  </div>
                  <div>
                    <strong>Báo cáo liên quan</strong>
                    <span>{formatProcedureReferences(selectedProcedure.reportReferences)}</span>
                  </div>
                </div>
                <p className="empty-state">
                  Procedure là lớp “đã làm gì cho người bệnh”: ví dụ chụp X-quang, thủ thuật, tư vấn hoặc phục hồi chức năng. Nó giúp Bundle không chỉ có y lệnh và kết quả, mà còn có dấu vết lâm sàng của hành động đã diễn ra.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một thủ thuật/thao tác y khoa để xem siêu dữ liệu và xuất FHIR Procedure.</p>
            )}
          </div>
        </div>

        <form className="service-form" onSubmit={(event) => void handleCreateProcedure(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={procedureForm.encounterId}
              onChange={(event) => setProcedureForm({ ...procedureForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Y lệnh gốc
            <select
              value={procedureForm.basedOnServiceRequestId}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, basedOnServiceRequestId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {serviceRequests.map((serviceRequest) => (
                <option key={serviceRequest.id} value={serviceRequest.id}>
                  {serviceRequest.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán/lý do
            <select
              value={procedureForm.reasonConditionId}
              onChange={(event) => setProcedureForm({ ...procedureForm, reasonConditionId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm Procedure
            <select
              value={procedureForm.category}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, category: event.target.value as ProcedureCategory })
              }
            >
              <option value="diagnostic">Chẩn đoán</option>
              <option value="therapeutic">Điều trị</option>
              <option value="surgical">Phẫu thuật</option>
              <option value="counseling">Tư vấn</option>
              <option value="rehabilitation">Phục hồi chức năng</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label>
            Trạng thái
            <select
              value={procedureForm.status}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, status: event.target.value as ProcedureStatus })
              }
            >
              <option value="completed">Hoàn tất</option>
              <option value="in-progress">Đang thực hiện</option>
              <option value="preparation">Chuẩn bị</option>
              <option value="not-done">Không thực hiện</option>
              <option value="on-hold">Tạm giữ</option>
              <option value="stopped">Đã dừng</option>
              <option value="unknown">Chưa rõ</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={procedureForm.codeSystem}
              onChange={(event) => setProcedureForm({ ...procedureForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã Procedure
            <input
              value={procedureForm.code}
              onChange={(event) => setProcedureForm({ ...procedureForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên Procedure
            <input
              value={procedureForm.codeDisplay}
              onChange={(event) => setProcedureForm({ ...procedureForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Bắt đầu
            <input
              type="datetime-local"
              value={procedureForm.performedStart}
              onChange={(event) => setProcedureForm({ ...procedureForm, performedStart: event.target.value })}
            />
          </label>
          <label>
            Kết thúc
            <input
              type="datetime-local"
              value={procedureForm.performedEnd}
              onChange={(event) => setProcedureForm({ ...procedureForm, performedEnd: event.target.value })}
            />
          </label>
          <label>
            Người/đơn vị thực hiện
            <input
              value={procedureForm.performerActorId}
              onChange={(event) => setProcedureForm({ ...procedureForm, performerActorId: event.target.value })}
            />
          </label>
          <label>
            Đại diện khoa/phòng
            <input
              value={procedureForm.onBehalfOfOrganizationId}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, onBehalfOfOrganizationId: event.target.value })
              }
            />
          </label>
          <label>
            Chức năng thực hiện
            <input
              value={procedureForm.performerFunctionDisplay}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, performerFunctionDisplay: event.target.value })
              }
            />
          </label>
          <label>
            Người ghi nhận
            <input
              value={procedureForm.recorderPractitionerId}
              onChange={(event) =>
                setProcedureForm({ ...procedureForm, recorderPractitionerId: event.target.value })
              }
            />
          </label>
          <label>
            Vị trí/cơ quan
            <input
              value={procedureForm.bodySiteDisplay}
              onChange={(event) => setProcedureForm({ ...procedureForm, bodySiteDisplay: event.target.value })}
            />
          </label>
          <label>
            Kết quả
            <input
              value={procedureForm.outcomeDisplay}
              onChange={(event) => setProcedureForm({ ...procedureForm, outcomeDisplay: event.target.value })}
            />
          </label>
          <label>
            Báo cáo liên quan
            <select
              value={procedureForm.reportReferenceId}
              onChange={(event) => setProcedureForm({ ...procedureForm, reportReferenceId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {diagnosticReports.map((diagnosticReport) => (
                <option key={diagnosticReport.id} value={diagnosticReport.id}>
                  {diagnosticReport.code.display}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            Ghi chú
            <textarea
              value={procedureForm.note}
              onChange={(event) => setProcedureForm({ ...procedureForm, note: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingProcedure}>
            {isSubmittingProcedure ? "Đang ghi nhận..." : "Ghi nhận Procedure"}
          </button>
        </form>
      </article>
    );
  }

  function renderObservationPanel(): ReactNode {
    return (
      <article className="panel observation-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Clinical observations</p>
            <h2>Chỉ số lâm sàng và xét nghiệm</h2>
          </div>
          <span className="pill cyan">{isLoadingObservations ? "đang tải" : `${observations.length} chỉ số`}</span>
        </div>

        <div className="document-layout">
          <div className="observation-cards">
            {observations.map((observation) => (
              <button
                className={observation.id === selectedObservationId ? "observation-card selected" : "observation-card"}
                key={observation.id}
                type="button"
                onClick={() => setSelectedObservationId(observation.id)}
              >
                <span>{formatObservationCategory(observation.category)}</span>
                <strong>{observation.code.display}</strong>
                <small>
                  {formatObservationValue(observation)} · {formatDateTime(observation.effectiveAt)}
                </small>
              </button>
            ))}
            {observations.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ số có cấu trúc. Hãy ghi nhận sinh hiệu hoặc kết quả xét nghiệm đầu tiên.
              </p>
            ) : null}
          </div>

          <div className="observation-summary">
            {selectedObservation ? (
              <>
                <div className="document-meta">
                  <Info label="Nhóm" value={formatObservationCategory(selectedObservation.category)} />
                  <Info label="Trạng thái" value={formatObservationStatus(selectedObservation.status)} />
                  <Info label="Mã chuẩn" value={`${selectedObservation.code.system} · ${selectedObservation.code.code}`} />
                  <Info label="Giá trị" value={formatObservationValue(selectedObservation)} />
                  <Info label="Encounter" value={selectedObservation.encounterId ?? "Chưa gắn"} />
                  <Info label="Người ghi nhận" value={selectedObservation.performerPractitionerId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Observation là dữ liệu lâm sàng có cấu trúc; khi xuất Bundle sẽ đi cùng Patient, Encounter và
                  DocumentReference để bên nhận có thể xử lý máy đọc được.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ số để xem siêu dữ liệu và xuất FHIR Observation.</p>
            )}
          </div>
        </div>

        <form className="observation-form" onSubmit={(event) => void handleCreateObservation(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={observationForm.encounterId}
              onChange={(event) => setObservationForm({ ...observationForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm chỉ số
            <select
              value={observationForm.category}
              onChange={(event) =>
                setObservationForm({ ...observationForm, category: event.target.value as ObservationCategory })
              }
            >
              <option value="laboratory">Xét nghiệm</option>
              <option value="vital-signs">Sinh hiệu</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={observationForm.codeSystem}
              onChange={(event) => setObservationForm({ ...observationForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã chỉ số
            <input
              value={observationForm.code}
              onChange={(event) => setObservationForm({ ...observationForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên chỉ số
            <input
              value={observationForm.codeDisplay}
              onChange={(event) => setObservationForm({ ...observationForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Giá trị
            <input
              type="number"
              step="any"
              value={observationForm.value}
              onChange={(event) => setObservationForm({ ...observationForm, value: event.target.value })}
            />
          </label>
          <label>
            Đơn vị
            <input
              value={observationForm.unit}
              onChange={(event) => setObservationForm({ ...observationForm, unit: event.target.value })}
            />
          </label>
          <label>
            Hệ đơn vị
            <input
              value={observationForm.unitSystem}
              onChange={(event) => setObservationForm({ ...observationForm, unitSystem: event.target.value })}
            />
          </label>
          <label>
            Mã đơn vị
            <input
              value={observationForm.unitCode}
              onChange={(event) => setObservationForm({ ...observationForm, unitCode: event.target.value })}
            />
          </label>
          <label>
            Thời điểm ghi nhận
            <input
              type="datetime-local"
              value={observationForm.effectiveAt}
              onChange={(event) => setObservationForm({ ...observationForm, effectiveAt: event.target.value })}
            />
          </label>
          <label>
            Nhân sự ghi nhận
            <input
              value={observationForm.performerPractitionerId}
              onChange={(event) =>
                setObservationForm({ ...observationForm, performerPractitionerId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingObservation}>
            {isSubmittingObservation ? "Đang ghi nhận..." : "Ghi nhận chỉ số"}
          </button>
        </form>
      </article>
    );
  }

  function renderDiagnosticReportPanel(): ReactNode {
    return (
      <article className="panel diagnostic-report-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Diagnostic reports</p>
            <h2>Báo cáo kết quả xét nghiệm và hình ảnh</h2>
          </div>
          <span className="pill cyan">
            {isLoadingDiagnosticReports ? "đang tải" : `${diagnosticReports.length} báo cáo`}
          </span>
        </div>

        <div className="document-layout">
          <div className="diagnostic-report-cards">
            {diagnosticReports.map((diagnosticReport) => (
              <button
                className={
                  diagnosticReport.id === selectedDiagnosticReportId
                    ? "diagnostic-report-card selected"
                    : "diagnostic-report-card"
                }
                key={diagnosticReport.id}
                type="button"
                onClick={() => setSelectedDiagnosticReportId(diagnosticReport.id)}
              >
                <span>{formatDiagnosticReportCategory(diagnosticReport.category)}</span>
                <strong>{diagnosticReport.code.display}</strong>
                <small>
                  {formatDiagnosticReportStatus(diagnosticReport.status)} ·{" "}
                  {formatDateTime(diagnosticReport.issuedAt)}
                </small>
              </button>
            ))}
            {diagnosticReports.length === 0 ? (
              <p className="empty-state">
                Chưa có báo cáo kết quả. Khi LIS/RIS/PACS trả kết quả, hãy tạo DiagnosticReport để đóng vòng y lệnh.
              </p>
            ) : null}
          </div>

          <div className="diagnostic-report-summary">
            {selectedDiagnosticReport ? (
              <>
                <div className="document-meta">
                  <Info label="Báo cáo" value={selectedDiagnosticReport.code.display} />
                  <Info label="Mã báo cáo" value={`${selectedDiagnosticReport.code.system} · ${selectedDiagnosticReport.code.code}`} />
                  <Info label="Nhóm" value={formatDiagnosticReportCategory(selectedDiagnosticReport.category)} />
                  <Info label="Trạng thái" value={formatDiagnosticReportStatus(selectedDiagnosticReport.status)} />
                  <Info label="Y lệnh gốc" value={selectedDiagnosticReport.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Observation kết quả" value={`${selectedDiagnosticReport.resultObservationIds.length}`} />
                  <Info label="Khoa phát hành" value={selectedDiagnosticReport.performerOrganizationId ?? "Chưa gắn"} />
                  <Info label="Người diễn giải" value={selectedDiagnosticReport.resultsInterpreterPractitionerId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  {selectedDiagnosticReport.conclusion ??
                    "DiagnosticReport gom các Observation hoặc báo cáo dạng tệp để bên nhận hiểu đây là kết quả của một y lệnh ServiceRequest."}
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một báo cáo để xem siêu dữ liệu và xuất FHIR DiagnosticReport.</p>
            )}
          </div>
        </div>

        <form className="diagnostic-report-form" onSubmit={(event) => void handleCreateDiagnosticReport(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={diagnosticReportForm.encounterId}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Y lệnh gốc
            <select
              value={diagnosticReportForm.basedOnServiceRequestId}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  basedOnServiceRequestId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {serviceRequests.map((serviceRequest) => (
                <option key={serviceRequest.id} value={serviceRequest.id}>
                  {serviceRequest.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm báo cáo
            <select
              value={diagnosticReportForm.category}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  category: event.target.value as DiagnosticReportCategory
                })
              }
            >
              <option value="laboratory">Xét nghiệm</option>
              <option value="imaging">Chẩn đoán hình ảnh</option>
              <option value="pathology">Giải phẫu bệnh</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={diagnosticReportForm.codeSystem}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, codeSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã báo cáo
            <input
              value={diagnosticReportForm.code}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, code: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên báo cáo
            <input
              value={diagnosticReportForm.codeDisplay}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, codeDisplay: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm hiệu lực
            <input
              type="datetime-local"
              value={diagnosticReportForm.effectiveAt}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, effectiveAt: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm phát hành
            <input
              type="datetime-local"
              value={diagnosticReportForm.issuedAt}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, issuedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Khoa/phòng phát hành
            <input
              value={diagnosticReportForm.performerOrganizationId}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  performerOrganizationId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Người diễn giải kết quả
            <input
              value={diagnosticReportForm.resultsInterpreterPractitionerId}
              onChange={(event) =>
                setDiagnosticReportForm({
                  ...diagnosticReportForm,
                  resultsInterpreterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <div className="wide-field checkbox-list">
            <span>Observation kết quả</span>
            {observations.map((observation) => {
              const isChecked = diagnosticReportForm.resultObservationIds.includes(observation.id);

              return (
                <label className="check-option" key={observation.id}>
                  <input
                    checked={isChecked}
                    type="checkbox"
                    onChange={(event) => {
                      const nextIds = event.target.checked
                        ? [...diagnosticReportForm.resultObservationIds, observation.id]
                        : diagnosticReportForm.resultObservationIds.filter((id) => id !== observation.id);
                      setDiagnosticReportForm({
                        ...diagnosticReportForm,
                        resultObservationIds: nextIds
                      });
                    }}
                  />
                  <span>{observation.code.display} · {formatObservationValue(observation)}</span>
                </label>
              );
            })}
            {observations.length === 0 ? (
              <small>Chưa có Observation để gắn. Có thể dùng kết luận hoặc tệp báo cáo.</small>
            ) : null}
          </div>
          <label className="wide-field">
            Kết luận
            <input
              value={diagnosticReportForm.conclusion}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, conclusion: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Đường dẫn tệp báo cáo
            <input
              value={diagnosticReportForm.presentedFormUrl}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, presentedFormUrl: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tiêu đề tệp báo cáo
            <input
              value={diagnosticReportForm.presentedFormTitle}
              onChange={(event) =>
                setDiagnosticReportForm({ ...diagnosticReportForm, presentedFormTitle: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingDiagnosticReport}>
            {isSubmittingDiagnosticReport ? "Đang tạo..." : "Tạo báo cáo kết quả"}
          </button>
        </form>
      </article>
    );
  }

  function renderImagingStudyPanel(): ReactNode {
    return (
      <article className="panel imaging-study-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PACS / DICOM</p>
            <h2>Nghiên cứu hình ảnh y khoa</h2>
          </div>
          <span className="pill cyan">
            {isLoadingImagingStudies ? "đang tải" : `${imagingStudies.length} nghiên cứu`}
          </span>
        </div>

        <div className="document-layout">
          <div className="imaging-study-cards">
            {imagingStudies.map((imagingStudy) => (
              <button
                className={
                  imagingStudy.id === selectedImagingStudyId
                    ? "imaging-study-card selected"
                    : "imaging-study-card"
                }
                key={imagingStudy.id}
                type="button"
                onClick={() => setSelectedImagingStudyId(imagingStudy.id)}
              >
                <span>{formatImagingStudyStatus(imagingStudy.status)}</span>
                <strong>{imagingStudy.description ?? imagingStudy.studyInstanceUid}</strong>
                <small>
                  {imagingStudy.series[0]?.modality.display ?? "DICOM"} ·{" "}
                  {imagingStudy.startedAt ? formatDateTime(imagingStudy.startedAt) : "Chưa có thời điểm"}
                </small>
              </button>
            ))}
            {imagingStudies.length === 0 ? (
              <p className="empty-state">
                Chưa có FHIR ImagingStudy. Khi PACS/RIS có siêu dữ liệu DICOM, hãy tạo nghiên cứu hình ảnh để Bundle không chỉ có báo cáo PDF mà còn có chỉ mục ảnh máy đọc được.
              </p>
            ) : null}
          </div>

          <div className="imaging-study-summary">
            {selectedImagingStudy ? (
              <>
                <div className="document-meta">
                  <Info label="Mô tả" value={selectedImagingStudy.description ?? "Chưa có mô tả"} />
                  <Info label="Study UID" value={selectedImagingStudy.studyInstanceUid} />
                  <Info label="Accession" value={selectedImagingStudy.accessionNumber ?? "Chưa gắn"} />
                  <Info label="Trạng thái" value={formatImagingStudyStatus(selectedImagingStudy.status)} />
                  <Info label="Y lệnh gốc" value={selectedImagingStudy.basedOnServiceRequestId ?? "Chưa gắn"} />
                  <Info label="Báo cáo liên quan" value={selectedImagingStudy.diagnosticReportId ?? "Chưa gắn"} />
                  <Info label="Endpoint PACS" value={selectedImagingStudy.endpointId ?? "Chưa gắn"} />
                  <Info label="Số ảnh" value={`${selectedImagingStudy.numberOfInstances} ảnh / ${selectedImagingStudy.numberOfSeries} series`} />
                </div>
                <div className="reference-list">
                  {selectedImagingStudy.series.map((series) => (
                    <div key={series.uid}>
                      <strong>
                        Series {series.number ?? "-"} · {series.modality.display}
                      </strong>
                      <span>
                        UID {series.uid}; {series.numberOfInstances} ảnh
                        {series.bodySite ? `; vùng chụp ${series.bodySite.display}` : ""}.
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một nghiên cứu hình ảnh để xem siêu dữ liệu PACS/DICOM và xuất FHIR ImagingStudy.</p>
            )}
          </div>
        </div>

        <form className="imaging-study-form" onSubmit={(event) => void handleCreateImagingStudy(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={imagingStudyForm.encounterId}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Y lệnh gốc
            <select
              value={imagingStudyForm.basedOnServiceRequestId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  basedOnServiceRequestId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {serviceRequests.map((serviceRequest) => (
                <option key={serviceRequest.id} value={serviceRequest.id}>
                  {serviceRequest.code.display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Báo cáo liên quan
            <select
              value={imagingStudyForm.diagnosticReportId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  diagnosticReportId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {diagnosticReports.map((diagnosticReport) => (
                <option key={diagnosticReport.id} value={diagnosticReport.id}>
                  {diagnosticReport.code.display}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            DICOM Study Instance UID
            <input
              value={imagingStudyForm.studyInstanceUid}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, studyInstanceUid: event.target.value })
              }
            />
          </label>
          <label>
            Accession number
            <input
              value={imagingStudyForm.accessionNumber}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, accessionNumber: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm bắt đầu
            <input
              type="datetime-local"
              value={imagingStudyForm.startedAt}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, startedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả nghiên cứu
            <input
              value={imagingStudyForm.description}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, description: event.target.value })
              }
            />
          </label>
          <label>
            Bác sĩ chỉ định
            <input
              value={imagingStudyForm.referrerPractitionerId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  referrerPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label>
            Bác sĩ đọc ảnh
            <input
              value={imagingStudyForm.interpreterPractitionerId}
              onChange={(event) =>
                setImagingStudyForm({
                  ...imagingStudyForm,
                  interpreterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Endpoint PACS/DICOMweb
            <input
              value={imagingStudyForm.endpointId}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, endpointId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            DICOM Series Instance UID
            <input
              value={imagingStudyForm.seriesUid}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, seriesUid: event.target.value })
              }
            />
          </label>
          <label>
            Số thứ tự series
            <input
              value={imagingStudyForm.seriesNumber}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, seriesNumber: event.target.value })
              }
            />
          </label>
          <label>
            Số ảnh
            <input
              value={imagingStudyForm.numberOfInstances}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, numberOfInstances: event.target.value })
              }
            />
          </label>
          <label>
            Hệ mã modality
            <input
              value={imagingStudyForm.modalitySystem}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, modalitySystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã modality
            <input
              value={imagingStudyForm.modalityCode}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, modalityCode: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên modality
            <input
              value={imagingStudyForm.modalityDisplay}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, modalityDisplay: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả series
            <input
              value={imagingStudyForm.seriesDescription}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, seriesDescription: event.target.value })
              }
            />
          </label>
          <label>
            Hệ mã vùng chụp
            <input
              value={imagingStudyForm.bodySiteSystem}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, bodySiteSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã vùng chụp
            <input
              value={imagingStudyForm.bodySiteCode}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, bodySiteCode: event.target.value })
              }
            />
          </label>
          <label>
            Tên vùng chụp
            <input
              value={imagingStudyForm.bodySiteDisplay}
              onChange={(event) =>
                setImagingStudyForm({ ...imagingStudyForm, bodySiteDisplay: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingImagingStudy}>
            {isSubmittingImagingStudy ? "Đang tạo..." : "Tạo ImagingStudy"}
          </button>
        </form>
      </article>
    );
  }

  function renderMedicationRequestPanel(): ReactNode {
    return (
      <article className="panel medication-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Medication requests</p>
            <h2>Chỉ định thuốc và đơn thuốc</h2>
          </div>
          <span className="pill cyan">
            {isLoadingMedicationRequests ? "đang tải" : `${medicationRequests.length} chỉ định`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {medicationRequests.map((medicationRequest) => (
              <button
                className={
                  medicationRequest.id === selectedMedicationRequestId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={medicationRequest.id}
                type="button"
                onClick={() => setSelectedMedicationRequestId(medicationRequest.id)}
              >
                <span>{formatMedicationRequestCategory(medicationRequest.category)}</span>
                <strong>{medicationRequest.medicationCode.display}</strong>
                <small>
                  {formatMedicationRequestStatus(medicationRequest.status)} ·{" "}
                  {formatDateTime(medicationRequest.authoredOn)}
                </small>
              </button>
            ))}
            {medicationRequests.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ định thuốc có cấu trúc. Hãy ghi nhận thuốc đầu tiên để Bundle có thêm MedicationRequest.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedMedicationRequest ? (
              <>
                <div className="document-meta">
                  <Info label="Thuốc" value={selectedMedicationRequest.medicationCode.display} />
                  <Info label="Mã thuốc" value={`${selectedMedicationRequest.medicationCode.system} · ${selectedMedicationRequest.medicationCode.code}`} />
                  <Info label="Trạng thái" value={formatMedicationRequestStatus(selectedMedicationRequest.status)} />
                  <Info label="Mục đích" value={formatMedicationRequestIntent(selectedMedicationRequest.intent)} />
                  <Info label="Ưu tiên" value={formatMedicationRequestPriority(selectedMedicationRequest.priority)} />
                  <Info label="Liều dùng" value={formatDosageInstruction(selectedMedicationRequest.dosageInstruction)} />
                  <Info label="Chẩn đoán liên quan" value={selectedMedicationRequest.reasonConditionId ?? "Chưa gắn"} />
                  <Info label="Người kê" value={selectedMedicationRequest.requesterPractitionerId} />
                </div>
                <p className="empty-state">
                  MedicationRequest thể hiện yêu cầu dùng thuốc ở dạng máy đọc được; trong luồng liên viện, nó giúp bên nhận thấy thuốc đang được chỉ định thay vì chỉ đọc trong tài liệu PDF.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ định thuốc để xem siêu dữ liệu và xuất FHIR MedicationRequest.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateMedicationRequest(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={medicationRequestForm.encounterId}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán liên quan
            <select
              value={medicationRequestForm.reasonConditionId}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, reasonConditionId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display} · {condition.code.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại chỉ định
            <select
              value={medicationRequestForm.category}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  category: event.target.value as MedicationRequestCategory
                })
              }
            >
              <option value="outpatient">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="community">Cộng đồng</option>
              <option value="discharge">Ra viện</option>
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              value={medicationRequestForm.priority}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  priority: event.target.value as MedicationRequestPriority
                })
              }
            >
              <option value="routine">Thường quy</option>
              <option value="urgent">Khẩn</option>
              <option value="asap">Càng sớm càng tốt</option>
              <option value="stat">Ngay lập tức</option>
            </select>
          </label>
          <label>
            Hệ mã thuốc
            <input
              value={medicationRequestForm.medicationSystem}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã thuốc
            <input
              value={medicationRequestForm.medicationCode}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationCode: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên thuốc
            <input
              value={medicationRequestForm.medicationDisplay}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationDisplay: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Hướng dẫn dùng
            <input
              value={medicationRequestForm.dosageText}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, dosageText: event.target.value })
              }
            />
          </label>
          <label>
            Đường dùng
            <input
              value={medicationRequestForm.route}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, route: event.target.value })
              }
            />
          </label>
          <label>
            Liều lượng
            <input
              type="number"
              step="any"
              value={medicationRequestForm.doseValue}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, doseValue: event.target.value })
              }
            />
          </label>
          <label>
            Đơn vị liều
            <input
              value={medicationRequestForm.doseUnit}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, doseUnit: event.target.value })
              }
            />
          </label>
          <label>
            Tần suất
            <input
              type="number"
              value={medicationRequestForm.frequency}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, frequency: event.target.value })
              }
            />
          </label>
          <label>
            Chu kỳ
            <input
              type="number"
              step="any"
              value={medicationRequestForm.period}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, period: event.target.value })
              }
            />
          </label>
          <label>
            Đơn vị chu kỳ
            <select
              value={medicationRequestForm.periodUnit}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  periodUnit: event.target.value as MedicationTimingUnit
                })
              }
            >
              <option value="h">Giờ</option>
              <option value="d">Ngày</option>
              <option value="wk">Tuần</option>
            </select>
          </label>
          <label>
            Thời điểm kê
            <input
              type="datetime-local"
              value={medicationRequestForm.authoredOn}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, authoredOn: event.target.value })
              }
            />
          </label>
          <label>
            Số ngày cấp
            <input
              type="number"
              value={medicationRequestForm.expectedSupplyDurationDays}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  expectedSupplyDurationDays: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Người kê
            <input
              value={medicationRequestForm.requesterPractitionerId}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  requesterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={medicationRequestForm.note}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, note: event.target.value })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={selectedPatientWriteDisabled || isSubmittingMedicationRequest}
          >
            {isSubmittingMedicationRequest ? "Đang ghi nhận..." : "Ghi nhận chỉ định thuốc"}
          </button>
        </form>
      </article>
    );
  }

  function renderMedicationDispensePanel(): ReactNode {
    return (
      <article className="panel medication-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">FHIR MedicationDispense</p>
            <h2>Cấp phát thuốc</h2>
          </div>
          <span className="pill cyan">
            {isLoadingMedicationDispenses
              ? "đang tải"
              : `${medicationDispenses.length} lần cấp`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {medicationDispenses.map((medicationDispense) => (
              <button
                className={
                  medicationDispense.id === selectedMedicationDispenseId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={medicationDispense.id}
                type="button"
                onClick={() => setSelectedMedicationDispenseId(medicationDispense.id)}
              >
                <span>{formatMedicationDispenseCategory(medicationDispense.category)}</span>
                <strong>{medicationDispense.medicationCode.display}</strong>
                <small>
                  {formatMedicationDispenseStatus(medicationDispense.status)} ·{" "}
                  {formatDateTime(
                    medicationDispense.whenHandedOver ??
                      medicationDispense.whenPrepared ??
                      medicationDispense.updatedAt
                  )}
                </small>
              </button>
            ))}
            {medicationDispenses.length === 0 ? (
              <p className="empty-state">
                Chưa có bản ghi cấp phát thuốc. Bước này nằm giữa kê đơn và dùng thuốc,
                giúp phân biệt “đã chỉ định” với “khoa dược/kho đã bàn giao thuốc”.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedMedicationDispense ? (
              <>
                <div className="document-meta">
                  <Info label="Thuốc" value={selectedMedicationDispense.medicationCode.display} />
                  <Info label="Trạng thái" value={formatMedicationDispenseStatus(selectedMedicationDispense.status)} />
                  <Info label="Loại cấp phát" value={formatMedicationDispenseCategory(selectedMedicationDispense.category)} />
                  <Info label="Số lượng" value={formatMedicationDispenseQuantity(selectedMedicationDispense.quantity)} />
                  <Info label="Số ngày cấp" value={formatMedicationDispenseQuantity(selectedMedicationDispense.daysSupply)} />
                  <Info label="Thời điểm" value={formatMedicationDispenseTime(selectedMedicationDispense)} />
                  <Info label="Gắn chỉ định" value={selectedMedicationDispense.medicationRequestId ?? "Chưa gắn"} />
                  <Info label="Người cấp phát" value={selectedMedicationDispense.dispenserPractitionerId ?? "Chưa gắn"} />
                  <Info label="Người nhận" value={selectedMedicationDispense.receiverPractitionerId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Tài nguyên FHIR MedicationDispense mô tả sự kiện cấp phát thuốc, thường do khoa dược
                  hoặc kho thuốc thực hiện. Các trường trên là siêu dữ liệu giúp hồ sơ liên viện
                  biết thuốc đã được cấp bao nhiêu, vào lúc nào và dựa trên chỉ định nào.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một lần cấp phát để xem siêu dữ liệu và xuất FHIR MedicationDispense.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateMedicationDispense(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={medicationDispenseForm.encounterId}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  encounterId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Gắn chỉ định thuốc (MedicationRequest)
            <select
              value={medicationDispenseForm.medicationRequestId}
              onChange={(event) => {
                const medicationRequest = medicationRequests.find(
                  (request) => request.id === event.target.value
                );
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationRequestId: event.target.value,
                  medicationSystem:
                    medicationRequest?.medicationCode.system ??
                    medicationDispenseForm.medicationSystem,
                  medicationCode:
                    medicationRequest?.medicationCode.code ??
                    medicationDispenseForm.medicationCode,
                  medicationDisplay:
                    medicationRequest?.medicationCode.display ??
                    medicationDispenseForm.medicationDisplay,
                  dosageText:
                    medicationRequest?.dosageInstruction.text ??
                    medicationDispenseForm.dosageText,
                  route:
                    medicationRequest?.dosageInstruction.route ??
                    medicationDispenseForm.route,
                  doseValue:
                    medicationRequest?.dosageInstruction.doseQuantity?.value.toString() ??
                    medicationDispenseForm.doseValue,
                  doseUnit:
                    medicationRequest?.dosageInstruction.doseQuantity?.unit ??
                    medicationDispenseForm.doseUnit,
                  frequency:
                    medicationRequest?.dosageInstruction.frequency?.toString() ??
                    medicationDispenseForm.frequency,
                  period:
                    medicationRequest?.dosageInstruction.period?.toString() ??
                    medicationDispenseForm.period,
                  periodUnit:
                    medicationRequest?.dosageInstruction.periodUnit ??
                    medicationDispenseForm.periodUnit,
                  daysSupplyValue:
                    medicationRequest?.expectedSupplyDurationDays?.toString() ??
                    medicationDispenseForm.daysSupplyValue
                });
              }}
            >
              <option value="">Không gắn</option>
              {medicationRequests.map((medicationRequest) => (
                <option key={medicationRequest.id} value={medicationRequest.id}>
                  {medicationRequest.medicationCode.display} · {formatDateTime(medicationRequest.authoredOn)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại cấp phát
            <select
              value={medicationDispenseForm.category}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  category: event.target.value as MedicationDispenseCategory
                })
              }
            >
              <option value="outpatient">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="community">Cộng đồng</option>
              <option value="discharge">Ra viện</option>
            </select>
          </label>
          <label className="wide-field">
            Tên thuốc
            <input
              value={medicationDispenseForm.medicationDisplay}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationDisplay: event.target.value
                })
              }
            />
          </label>
          <label>
            Hệ mã thuốc
            <input
              value={medicationDispenseForm.medicationSystem}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationSystem: event.target.value
                })
              }
            />
          </label>
          <label>
            Mã thuốc
            <input
              value={medicationDispenseForm.medicationCode}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  medicationCode: event.target.value
                })
              }
            />
          </label>
          <label>
            Số lượng cấp
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.quantityValue}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  quantityValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị cấp
            <input
              value={medicationDispenseForm.quantityUnit}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  quantityUnit: event.target.value
                })
              }
            />
          </label>
          <label>
            Số ngày cấp
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.daysSupplyValue}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  daysSupplyValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Chuẩn bị thuốc
            <input
              type="datetime-local"
              value={medicationDispenseForm.whenPrepared}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  whenPrepared: event.target.value
                })
              }
            />
          </label>
          <label>
            Bàn giao thuốc
            <input
              type="datetime-local"
              value={medicationDispenseForm.whenHandedOver}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  whenHandedOver: event.target.value
                })
              }
            />
          </label>
          <label>
            Người cấp phát
            <input
              value={medicationDispenseForm.dispenserPractitionerId}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  dispenserPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label>
            Người nhận thuốc
            <input
              value={medicationDispenseForm.receiverPractitionerId}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  receiverPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Hướng dẫn sau cấp phát
            <input
              value={medicationDispenseForm.dosageText}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  dosageText: event.target.value
                })
              }
            />
          </label>
          <label>
            Đường dùng
            <input
              value={medicationDispenseForm.route}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  route: event.target.value
                })
              }
            />
          </label>
          <label>
            Liều
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.doseValue}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  doseValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị liều
            <input
              value={medicationDispenseForm.doseUnit}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  doseUnit: event.target.value
                })
              }
            />
          </label>
          <label>
            Tần suất
            <input
              type="number"
              value={medicationDispenseForm.frequency}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  frequency: event.target.value
                })
              }
            />
          </label>
          <label>
            Chu kỳ
            <input
              type="number"
              step="any"
              value={medicationDispenseForm.period}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  period: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị chu kỳ
            <select
              value={medicationDispenseForm.periodUnit}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  periodUnit: event.target.value as MedicationTimingUnit
                })
              }
            >
              <option value="h">Giờ</option>
              <option value="d">Ngày</option>
              <option value="wk">Tuần</option>
            </select>
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={medicationDispenseForm.note}
              onChange={(event) =>
                setMedicationDispenseForm({
                  ...medicationDispenseForm,
                  note: event.target.value
                })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={selectedPatientWriteDisabled || isSubmittingMedicationDispense}
          >
            {isSubmittingMedicationDispense
              ? "Đang ghi nhận..."
              : "Ghi nhận cấp phát thuốc"}
          </button>
        </form>
      </article>
    );
  }

  function renderMedicationAdministrationPanel(): ReactNode {
    return (
      <article className="panel medication-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Medication administrations</p>
            <h2>Dùng thuốc thực tế</h2>
          </div>
          <span className="pill cyan">
            {isLoadingMedicationAdministrations
              ? "đang tải"
              : `${medicationAdministrations.length} lần dùng`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {medicationAdministrations.map((medicationAdministration) => (
              <button
                className={
                  medicationAdministration.id === selectedMedicationAdministrationId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={medicationAdministration.id}
                type="button"
                onClick={() => setSelectedMedicationAdministrationId(medicationAdministration.id)}
              >
                <span>{formatMedicationAdministrationCategory(medicationAdministration.category)}</span>
                <strong>{medicationAdministration.medicationCode.display}</strong>
                <small>
                  {formatMedicationAdministrationStatus(medicationAdministration.status)} ·{" "}
                  {formatDateTime(
                    medicationAdministration.effectivePeriod.start ??
                      medicationAdministration.updatedAt
                  )}
                </small>
              </button>
            ))}
            {medicationAdministrations.length === 0 ? (
              <p className="empty-state">
                Chưa có bản ghi dùng thuốc thực tế. Hãy xác nhận sau khi có
                MedicationRequest để phân biệt “chỉ định” với “đã dùng”.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedMedicationAdministration ? (
              <>
                <div className="document-meta">
                  <Info label="Thuốc" value={selectedMedicationAdministration.medicationCode.display} />
                  <Info label="Trạng thái" value={formatMedicationAdministrationStatus(selectedMedicationAdministration.status)} />
                  <Info label="Bối cảnh" value={formatMedicationAdministrationCategory(selectedMedicationAdministration.category)} />
                  <Info label="Thời điểm" value={formatMedicationAdministrationPeriod(selectedMedicationAdministration.effectivePeriod)} />
                  <Info label="Liều thực tế" value={formatMedicationAdministrationDose(selectedMedicationAdministration.dosage)} />
                  <Info label="Gắn đơn thuốc" value={selectedMedicationAdministration.medicationRequestId ?? "Chưa gắn"} />
                  <Info label="Người xác nhận" value={formatMedicationAdministrationPerformers(selectedMedicationAdministration.performers)} />
                  <Info label="Chẩn đoán liên quan" value={selectedMedicationAdministration.reasonConditionId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  MedicationAdministration là sự kiện thuốc đã được dùng hoặc
                  được xác nhận dùng. Đây là phần giúp EMR đóng vòng điều trị:
                  bác sĩ kê, hệ thống lưu chỉ định, nhân sự y tế xác nhận dùng
                  và FHIR Bundle có thể chuyển sang bệnh viện khác.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một lần dùng thuốc để xem siêu dữ liệu và xuất FHIR MedicationAdministration.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateMedicationAdministration(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={medicationAdministrationForm.encounterId}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  encounterId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Gắn chỉ định thuốc (MedicationRequest)
            <select
              value={medicationAdministrationForm.medicationRequestId}
              onChange={(event) => {
                const medicationRequest = medicationRequests.find(
                  (request) => request.id === event.target.value
                );
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationRequestId: event.target.value,
                  reasonConditionId:
                    medicationRequest?.reasonConditionId ??
                    medicationAdministrationForm.reasonConditionId,
                  medicationSystem:
                    medicationRequest?.medicationCode.system ??
                    medicationAdministrationForm.medicationSystem,
                  medicationCode:
                    medicationRequest?.medicationCode.code ??
                    medicationAdministrationForm.medicationCode,
                  medicationDisplay:
                    medicationRequest?.medicationCode.display ??
                    medicationAdministrationForm.medicationDisplay,
                  dosageText:
                    medicationRequest?.dosageInstruction.text ??
                    medicationAdministrationForm.dosageText,
                  doseValue:
                    medicationRequest?.dosageInstruction.doseQuantity?.value.toString() ??
                    medicationAdministrationForm.doseValue,
                  doseUnit:
                    medicationRequest?.dosageInstruction.doseQuantity?.unit ??
                    medicationAdministrationForm.doseUnit
                });
              }}
            >
              <option value="">Không gắn</option>
              {medicationRequests.map((medicationRequest) => (
                <option key={medicationRequest.id} value={medicationRequest.id}>
                  {medicationRequest.medicationCode.display} · {formatDateTime(medicationRequest.authoredOn)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán liên quan
            <select
              value={medicationAdministrationForm.reasonConditionId}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  reasonConditionId: event.target.value
                })
              }
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display} · {condition.code.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Bối cảnh dùng thuốc
            <select
              value={medicationAdministrationForm.category}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  category: event.target.value as MedicationAdministrationCategory
                })
              }
            >
              <option value="outpatient">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="community">Cộng đồng</option>
              <option value="patient-specified">Bệnh nhân tự khai</option>
            </select>
          </label>
          <label>
            Thời điểm dùng
            <input
              type="datetime-local"
              value={medicationAdministrationForm.effectiveStart}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  effectiveStart: event.target.value
                })
              }
            />
          </label>
          <label>
            Người/thiết bị xác nhận
            <input
              value={medicationAdministrationForm.performerActorId}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  performerActorId: event.target.value
                })
              }
            />
          </label>
          <label>
            Vai trò xác nhận
            <input
              value={medicationAdministrationForm.performerFunctionDisplay}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  performerFunctionDisplay: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Tên thuốc
            <input
              value={medicationAdministrationForm.medicationDisplay}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationDisplay: event.target.value
                })
              }
            />
          </label>
          <label>
            Hệ mã thuốc
            <input
              value={medicationAdministrationForm.medicationSystem}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationSystem: event.target.value
                })
              }
            />
          </label>
          <label>
            Mã thuốc
            <input
              value={medicationAdministrationForm.medicationCode}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  medicationCode: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả liều thực tế
            <input
              value={medicationAdministrationForm.dosageText}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  dosageText: event.target.value
                })
              }
            />
          </label>
          <label>
            Liều
            <input
              type="number"
              step="any"
              value={medicationAdministrationForm.doseValue}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  doseValue: event.target.value
                })
              }
            />
          </label>
          <label>
            Đơn vị
            <input
              value={medicationAdministrationForm.doseUnit}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  doseUnit: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={medicationAdministrationForm.note}
              onChange={(event) =>
                setMedicationAdministrationForm({
                  ...medicationAdministrationForm,
                  note: event.target.value
                })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={selectedPatientWriteDisabled || isSubmittingMedicationAdministration}
          >
            {isSubmittingMedicationAdministration
              ? "Đang ghi nhận..."
              : "Ghi nhận dùng thuốc"}
          </button>
        </form>
      </article>
    );
  }

  function renderDocumentPanel(): ReactNode {
    return (
      <article className="panel document-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Document center</p>
            <h2>Tài liệu bệnh án</h2>
          </div>
          <span className="pill cyan">{isLoadingDocuments ? "đang tải" : `${clinicalDocuments.length} tài liệu`}</span>
        </div>

        <div className="taxonomy-strip" aria-label="Phân loại tài liệu tham chiếu OpenEMR">
          {documentTaxonomy.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="document-layout">
          <div className="document-cards">
            {clinicalDocuments.map((document) => (
              <button
                className={document.id === selectedDocumentId ? "document-card selected" : "document-card"}
                key={document.id}
                type="button"
                onClick={() => setSelectedDocumentId(document.id)}
              >
                <span>{formatDocumentType(document.type)}</span>
                <strong>{document.title}</strong>
                <small>
                  {formatDocumentStatus(document.status)} ·{" "}
                  {document.encounterId ? `Encounter ${document.encounterId}` : "Chưa gắn encounter"}
                </small>
              </button>
            ))}
            {clinicalDocuments.length === 0 ? (
              <p className="empty-state">Bệnh nhân này chưa có tài liệu bệnh án.</p>
            ) : null}
          </div>

          <div className="document-summary">
            {selectedDocument ? (
              <>
                <div className="document-meta">
                  <Info label="Loại tài liệu" value={formatDocumentType(selectedDocument.type)} />
                  <Info label="Trạng thái" value={formatDocumentStatus(selectedDocument.status)} />
                  <Info label="Encounter" value={selectedDocument.encounterId ?? "Chưa gắn"} />
                  <Info label="Người tạo" value={selectedDocument.authorPractitionerId} />
                  <Info label="Định dạng" value={selectedDocument.attachmentContentType ?? "Chưa có"} />
                  <Info
                    label="Dung lượng"
                    value={
                      selectedDocument.attachmentSizeBytes !== undefined
                        ? `${selectedDocument.attachmentSizeBytes.toLocaleString("vi-VN")} byte`
                        : "Chưa có"
                    }
                  />
                  <Info
                    label="Hash SHA-1"
                    value={selectedDocument.attachmentHashSha1Base64 ?? "Chưa có"}
                  />
                </div>
                <code>{selectedDocument.storageUri}</code>
                <div className="action-row">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={isSelectedPatientMerged || selectedDocument.status !== "draft" || isSigningDocument}
                    onClick={() => void handleSignClinicalDocument(selectedDocument.id)}
                  >
                    {isSigningDocument ? "Đang ký..." : "Ký tài liệu nháp"}
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một tài liệu để xem siêu dữ liệu và thao tác ký.</p>
            )}
          </div>
        </div>

        <form className="document-form" onSubmit={(event) => void handleCreateClinicalDocument(event)}>
          <label>
            Loại tài liệu
            <select
              value={documentForm.type}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, type: event.target.value as ClinicalDocumentType })
              }
            >
              <option value="referral-letter">Giấy chuyển tuyến</option>
              <option value="discharge-summary">Tóm tắt ra viện</option>
              <option value="lab-report">Kết quả xét nghiệm</option>
              <option value="imaging-report">Kết quả chẩn đoán hình ảnh</option>
              <option value="admission-note">Phiếu nhập viện</option>
              <option value="consent-form">Phiếu đồng ý điều trị</option>
              <option value="advance-directive">Chỉ dẫn chăm sóc trước</option>
              <option value="ccda">CCDA</option>
              <option value="ccr">CCR</option>
              <option value="medical-record">Hồ sơ bệnh án</option>
              <option value="patient-information">Thông tin bệnh nhân</option>
            </select>
          </label>
          <label>
            Gắn với lượt khám
            <select
              value={documentForm.encounterId}
              onChange={(event) => setDocumentForm({ ...documentForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            Tiêu đề tài liệu
            <input
              value={documentForm.title}
              onChange={(event) => setDocumentForm({ ...documentForm, title: event.target.value })}
            />
          </label>
          <label className="wide-field">
            URI lưu trữ
            <input
              value={documentForm.storageUri}
              onChange={(event) => setDocumentForm({ ...documentForm, storageUri: event.target.value })}
            />
          </label>
          <label>
            Định dạng MIME
            <input
              value={documentForm.attachmentContentType}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentContentType: event.target.value })
              }
            />
          </label>
          <label>
            Dung lượng byte
            <input
              inputMode="numeric"
              min="0"
              type="number"
              value={documentForm.attachmentSizeBytes}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentSizeBytes: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Hash SHA-1 Base64
            <input
              value={documentForm.attachmentHashSha1Base64}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentHashSha1Base64: event.target.value })
              }
            />
          </label>
          <label>
            Thời điểm tạo tệp
            <input
              type="datetime-local"
              value={documentForm.attachmentCreatedAt}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, attachmentCreatedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Mã bác sĩ/người tạo
            <input
              value={documentForm.authorPractitionerId}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, authorPractitionerId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={selectedPatientWriteDisabled || isSubmittingDocument}>
            {isSubmittingDocument ? "Đang tạo..." : "Tạo tài liệu bệnh án"}
          </button>
        </form>
      </article>
    );
  }

  function renderGlobalAuditPanel(): ReactNode {
    const loginEventCount = globalAuditEvents.filter((event) =>
      event.action.startsWith("auth.login.")
    ).length;
    const deniedEventCount = globalAuditEvents.filter(
      (event) => event.action === "access.denied"
    ).length;
    const latestEvent = globalAuditEvents[0];

    return (
      <article className="panel audit-panel global-audit-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Vận hành bảo mật</p>
            <h2>Nhật ký bảo mật toàn hệ thống</h2>
            <p className="panel-note">
              Theo dõi đăng nhập, truy cập bị chặn và các bản ghi kiểm toán không gắn trực tiếp với
              một bệnh nhân cụ thể.
            </p>
          </div>
          <div className="panel-actions">
            <button
              className="ghost-button"
              type="button"
              disabled={isLoadingGlobalAuditEvents || !canReadAudit}
              onClick={() => void loadGlobalAuditEvents()}
            >
              {isLoadingGlobalAuditEvents
                ? "Đang tải..."
                : canReadAudit
                  ? "Tải nhật ký toàn hệ thống"
                  : "Cần quyền kiểm toán"}
            </button>
          </div>
        </div>

        <div className="security-audit-summary">
          <div>
            <span>Tổng bản ghi</span>
            <strong>{globalAuditEvents.length}</strong>
          </div>
          <div>
            <span>Đăng nhập</span>
            <strong>{loginEventCount}</strong>
          </div>
          <div>
            <span>Bị chặn</span>
            <strong>{deniedEventCount}</strong>
          </div>
          <div>
            <span>Mới nhất</span>
            <strong>{latestEvent ? formatDateTime(latestEvent.occurredAt) : "Chưa có"}</strong>
          </div>
        </div>

        <div className="audit-list">
          {globalAuditEvents.slice(0, 12).map((event) => (
            <div className="audit-item audit-item--global" key={event.id ?? `${event.occurredAt}:${event.action}`}>
              <div>
                <span>{formatDateTime(event.occurredAt)}</span>
                <strong>{formatAuditAction(event.action)}</strong>
              </div>
              <div>
                <span>Tác nhân</span>
                <strong>{event.actorId}</strong>
              </div>
              <div>
                <span>Tài nguyên</span>
                <strong>
                  {formatAuditResourceType(event.resourceType)} · {event.resourceId}
                </strong>
              </div>
              <div>
                <span>Phạm vi</span>
                <strong>{event.patientId ? `Bệnh nhân ${event.patientId}` : "Toàn hệ thống"}</strong>
              </div>
              <div>
                <span>Chi tiết</span>
                <strong>{formatAuditMetadataSummary(event)}</strong>
              </div>
            </div>
          ))}
          {globalAuditEvents.length === 0 ? (
            <p className="empty-state">
              {canReadAudit
                ? "Chưa có bản ghi kiểm toán toàn hệ thống. Hãy đăng nhập lại, thử truy cập bị chặn hoặc tải nhật ký theo bệnh nhân để phát sinh log."
                : "Nhật ký bảo mật toàn hệ thống chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  function renderAuditPanel(): ReactNode {
    return (
      <>
        <article className="panel audit-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Security trace</p>
              <h2>Nhật ký kiểm toán</h2>
            </div>
            <div className="panel-actions">
              <button
                className="ghost-button"
                type="button"
                disabled={!selectedPatient || isLoadingAuditEvents || !canReadAudit}
                onClick={() => selectedPatient && void loadAuditEvents(selectedPatient.id)}
              >
                {isLoadingAuditEvents ? "Đang tải..." : canReadAudit ? "Tải audit" : "Cần quyền kiểm toán"}
              </button>
              <button
                className="ghost-button"
                type="button"
                disabled={!selectedPatient || isVerifyingAuditIntegrity || !canReadAudit}
                onClick={() => selectedPatient && void verifyAuditIntegrity(selectedPatient.id)}
              >
                {isVerifyingAuditIntegrity ? "Đang xác minh..." : "Kiểm tra toàn vẹn"}
              </button>
              <button
                className="ghost-button"
                type="button"
                disabled={!selectedPatient || isExportingAuditFhir || !canReadAudit}
                onClick={() => selectedPatient && void loadAuditFhirBundle(selectedPatient.id)}
              >
                {isExportingAuditFhir ? "Đang xuất..." : "Xuất FHIR AuditEvent"}
              </button>
            </div>
          </div>

          {auditIntegrityReport ? (
            <div className={`integrity-card integrity-card--${auditIntegrityReport.status}`}>
              <div>
                <span>Trạng thái chuỗi băm</span>
                <strong>{formatAuditIntegrityStatus(auditIntegrityReport.status)}</strong>
              </div>
              <div>
                <span>Số bản ghi đã kiểm</span>
                <strong>
                  {auditIntegrityReport.sealedEvents}/{auditIntegrityReport.totalEvents}
                </strong>
              </div>
              <div>
                <span>Lần kiểm tra</span>
                <strong>{formatDateTime(auditIntegrityReport.checkedAt)}</strong>
              </div>
              <div>
                <span>Hash mới nhất</span>
                <strong className="hash-text">{auditIntegrityReport.latestHash ?? "Chưa có"}</strong>
              </div>
              {auditIntegrityReport.verified ? null : (
                <p>
                  Điểm cần kiểm tra: {auditIntegrityReport.brokenAtEventId ?? "không xác định"} ·{" "}
                  {formatAuditIntegrityReason(auditIntegrityReport.brokenReason)}
                </p>
              )}
            </div>
          ) : null}

          <div className="audit-list">
            {auditEvents.map((event) => (
              <div className="audit-item" key={event.id ?? `${event.occurredAt}:${event.action}`}>
                <div>
                  <span>{formatDateTime(event.occurredAt)}</span>
                  <strong>{formatAuditAction(event.action)}</strong>
                </div>
                <div>
                  <span>Actor</span>
                  <strong>{event.actorId}</strong>
                </div>
                <div>
                  <span>Tài nguyên</span>
                  <strong>
                    {formatAuditResourceType(event.resourceType)} · {event.resourceId}
                  </strong>
                </div>
                <div>
                  <span>Mục đích</span>
                  <strong>
                    {event.purposeOfUse ?? "Chưa khai báo"}
                    {typeof event.metadata.actorRole === "string" ? ` · ${event.metadata.actorRole}` : ""}
                  </strong>
                </div>
                <div>
                  <span>Toàn vẹn</span>
                  <strong>{event.integrityHash ? "Đã niêm phong" : "Chưa niêm phong"}</strong>
                </div>
              </div>
            ))}
            {auditEvents.length === 0 ? (
              <p className="empty-state">
                {canReadAudit
                  ? "Chưa có audit event cho bệnh nhân đang chọn. Hãy xem FHIR, mở lượt khám hoặc ký tài liệu để phát sinh log."
                  : "Nhật ký kiểm toán chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
              </p>
            ) : null}
          </div>
        </article>
        <FhirPanel title="FHIR AuditEvent Bundle JSON" badge="AuditEvent" value={auditFhirBundlePreview} />
      </>
    );
  }

  function renderCreatePatientPanel(): ReactNode {
    return (
      <article className="panel create-panel">
        <div>
          <p className="eyebrow">Intake</p>
          <h2>Tạo nhanh hồ sơ mới</h2>
        </div>

        <form className="patient-form" onSubmit={(event) => void handleCreatePatient(event)}>
          <label>
            Họ tên
            <input
              value={patientForm.fullName}
              onChange={(event) => setPatientForm({ ...patientForm, fullName: event.target.value })}
            />
          </label>
          <label>
            Số định danh
            <input
              value={patientForm.nationalId}
              onChange={(event) => setPatientForm({ ...patientForm, nationalId: event.target.value })}
            />
          </label>
          <label>
            Mã hồ sơ bệnh viện
            <input
              value={patientForm.hospitalMrn}
              onChange={(event) => setPatientForm({ ...patientForm, hospitalMrn: event.target.value })}
            />
          </label>
          <label>
            Ngày sinh
            <input
              type="date"
              value={patientForm.birthDate}
              onChange={(event) => setPatientForm({ ...patientForm, birthDate: event.target.value })}
            />
          </label>
          <label>
            Giới tính
            <select
              value={patientForm.gender}
              onChange={(event) => setPatientForm({ ...patientForm, gender: event.target.value as PatientGender })}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
              <option value="unknown">Chưa rõ</option>
            </select>
          </label>
          <label>
            Điện thoại
            <input
              value={patientForm.phone}
              onChange={(event) => setPatientForm({ ...patientForm, phone: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Địa chỉ
            <input
              value={patientForm.address}
              onChange={(event) => setPatientForm({ ...patientForm, address: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Cơ sở quản lý
            <input
              value={patientForm.managingOrganizationId}
              onChange={(event) =>
                setPatientForm({ ...patientForm, managingOrganizationId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmittingPatient}>
            {isSubmittingPatient ? "Đang tạo..." : "Tạo hồ sơ bệnh nhân"}
          </button>
        </form>
      </article>
    );
  }
}
