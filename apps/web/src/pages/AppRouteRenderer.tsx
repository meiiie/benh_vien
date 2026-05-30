import type { FormEvent, ReactNode } from "react";
import type { LoginForm } from "../auth/demoLogin.js";
import type {
  ApiRuntimeInfo,
  AppRoute,
  AuthSession,
  GatewayAcknowledgementForm,
  Patient,
  RecordTransfer
} from "../types/clinical.js";
import { AuditLogPage } from "./AuditLogPage.js";
import { DashboardPage, type DashboardMetrics } from "./DashboardPage.js";
import { DocumentsPage } from "./DocumentsPage.js";
import { GatewayAcknowledgementPage } from "./GatewayAcknowledgementPage.js";
import { InteropPage } from "./InteropPage.js";
import { SettingsPage } from "./SettingsPage.js";
import { WorkspacePage } from "./WorkspacePage.js";

type ReferenceSignal = {
  readonly name: string;
  readonly value: string;
};

type AppRoutePanels = {
  readonly allergyIntolerance: () => ReactNode;
  readonly audit: () => ReactNode;
  readonly clinicalDocument: () => ReactNode;
  readonly condition: () => ReactNode;
  readonly consentInterop: () => ReactNode;
  readonly createPatient: () => ReactNode;
  readonly diagnosticReport: () => ReactNode;
  readonly encounter: () => ReactNode;
  readonly globalAudit: () => ReactNode;
  readonly imagingStudy: () => ReactNode;
  readonly medicationAdministration: () => ReactNode;
  readonly medicationDispense: () => ReactNode;
  readonly medicationRequest: () => ReactNode;
  readonly observation: () => ReactNode;
  readonly patientDetail: () => ReactNode;
  readonly patientList: () => ReactNode;
  readonly patientMerge: () => ReactNode;
  readonly procedure: () => ReactNode;
  readonly providerDirectory: () => ReactNode;
  readonly recordTransferInterop: () => ReactNode;
  readonly serviceRequest: () => ReactNode;
  readonly workflowTask: () => ReactNode;
};

type FhirPreviewValues = {
  readonly allergyIntolerance: unknown;
  readonly capabilityStatement: unknown;
  readonly condition: unknown;
  readonly consent: unknown;
  readonly diagnosticReport: unknown;
  readonly document: unknown;
  readonly documentProvenance: unknown;
  readonly encounter: unknown;
  readonly imagingStudy: unknown;
  readonly medicationAdministration: unknown;
  readonly medicationDispense: unknown;
  readonly medicationRequest: unknown;
  readonly observation: unknown;
  readonly patient: unknown;
  readonly patientBundle: unknown;
  readonly patientDocumentBundle: unknown;
  readonly procedure: unknown;
  readonly providerDirectory: unknown;
  readonly recordTransferTask: unknown;
  readonly serviceRequest: unknown;
  readonly workflowTask: unknown;
};

type AppRouteRendererProps = {
  readonly apiBaseUrl: string;
  readonly apiRuntimeInfo?: ApiRuntimeInfo;
  readonly apiRuntimeWarning?: string;
  readonly appRoute: AppRoute;
  readonly authSession?: AuthSession;
  readonly canMergePatients: boolean;
  readonly canViewRuntimeInfo: boolean;
  readonly dashboardMetrics: DashboardMetrics;
  readonly fhirPreviews: FhirPreviewValues;
  readonly gatewayAcknowledgementForm: GatewayAcknowledgementForm;
  readonly gatewayAcknowledgementResult?: RecordTransfer;
  readonly isIntegrationSession: boolean;
  readonly isSubmittingGatewayAcknowledgement: boolean;
  readonly latestEncounterServiceType?: string;
  readonly loginForm: LoginForm;
  readonly panels: AppRoutePanels;
  readonly referenceSignals: readonly ReferenceSignal[];
  readonly selectedPatient?: Patient;
  readonly workflowSteps: readonly string[];
  readonly onGatewayAcknowledgementFormChange: (
    form: GatewayAcknowledgementForm
  ) => void;
  readonly onGatewayAcknowledgementSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  readonly onNavigate: (route: AppRoute) => void;
  readonly onReloadRuntimeInfo: () => void;
};

export function AppRouteRenderer({
  apiBaseUrl,
  apiRuntimeInfo,
  apiRuntimeWarning,
  appRoute,
  authSession,
  canMergePatients,
  canViewRuntimeInfo,
  dashboardMetrics,
  fhirPreviews,
  gatewayAcknowledgementForm,
  gatewayAcknowledgementResult,
  isIntegrationSession,
  isSubmittingGatewayAcknowledgement,
  latestEncounterServiceType,
  loginForm,
  panels,
  referenceSignals,
  selectedPatient,
  workflowSteps,
  onGatewayAcknowledgementFormChange,
  onGatewayAcknowledgementSubmit,
  onNavigate,
  onReloadRuntimeInfo
}: AppRouteRendererProps) {
  if (isIntegrationSession) {
    return (
      <GatewayAcknowledgementPage
        apiBaseUrl={apiBaseUrl}
        authSession={authSession}
        form={gatewayAcknowledgementForm}
        isSubmitting={isSubmittingGatewayAcknowledgement}
        onFormChange={onGatewayAcknowledgementFormChange}
        onSubmit={onGatewayAcknowledgementSubmit}
        result={gatewayAcknowledgementResult}
      />
    );
  }

  if (appRoute === "workspace") {
    return (
      <WorkspacePage
        allergyIntolerancePanel={panels.allergyIntolerance()}
        conditionPanel={panels.condition()}
        createPatientPanel={panels.createPatient()}
        diagnosticReportPanel={panels.diagnosticReport()}
        encounterPanel={panels.encounter()}
        imagingStudyPanel={panels.imagingStudy()}
        medicationAdministrationPanel={panels.medicationAdministration()}
        medicationDispensePanel={panels.medicationDispense()}
        medicationRequestPanel={panels.medicationRequest()}
        observationPanel={panels.observation()}
        patientDetailPanel={panels.patientDetail()}
        patientListPanel={panels.patientList()}
        patientMergePanel={canMergePatients ? panels.patientMerge() : undefined}
        procedurePanel={panels.procedure()}
        serviceRequestPanel={panels.serviceRequest()}
        workflowTaskPanel={panels.workflowTask()}
      />
    );
  }

  if (appRoute === "documents") {
    return (
      <DocumentsPage
        documentFhirPreview={fhirPreviews.document}
        documentPanel={panels.clinicalDocument()}
        documentProvenanceFhirPreview={fhirPreviews.documentProvenance}
        patientListPanel={panels.patientList()}
      />
    );
  }

  if (appRoute === "audit") {
    return (
      <AuditLogPage
        auditPanel={panels.audit()}
        globalAuditPanel={panels.globalAudit()}
      />
    );
  }

  if (appRoute === "interop") {
    return (
      <InteropPage
        allergyIntoleranceFhirPreview={fhirPreviews.allergyIntolerance}
        capabilityStatementPreview={fhirPreviews.capabilityStatement}
        conditionFhirPreview={fhirPreviews.condition}
        consentFhirPreview={fhirPreviews.consent}
        consentInteropPanel={panels.consentInterop()}
        diagnosticReportFhirPreview={fhirPreviews.diagnosticReport}
        documentFhirPreview={fhirPreviews.document}
        documentProvenanceFhirPreview={fhirPreviews.documentProvenance}
        encounterFhirPreview={fhirPreviews.encounter}
        imagingStudyFhirPreview={fhirPreviews.imagingStudy}
        medicationAdministrationFhirPreview={fhirPreviews.medicationAdministration}
        medicationDispenseFhirPreview={fhirPreviews.medicationDispense}
        medicationRequestFhirPreview={fhirPreviews.medicationRequest}
        observationFhirPreview={fhirPreviews.observation}
        patientFhirBundlePreview={fhirPreviews.patientBundle}
        patientFhirDocumentBundlePreview={fhirPreviews.patientDocumentBundle}
        patientFhirPreview={fhirPreviews.patient}
        procedureFhirPreview={fhirPreviews.procedure}
        providerDirectoryFhirPreview={fhirPreviews.providerDirectory}
        providerDirectoryPanel={panels.providerDirectory()}
        recordTransferFhirTaskPreview={fhirPreviews.recordTransferTask}
        recordTransferInteropPanel={panels.recordTransferInterop()}
        referenceSignals={referenceSignals}
        serviceRequestFhirPreview={fhirPreviews.serviceRequest}
        workflowSteps={workflowSteps}
        workflowTaskFhirPreview={fhirPreviews.workflowTask}
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
        onReloadRuntimeInfo={onReloadRuntimeInfo}
      />
    );
  }

  return (
    <DashboardPage
      latestEncounterServiceType={latestEncounterServiceType}
      metrics={dashboardMetrics}
      onNavigate={onNavigate}
      selectedPatient={selectedPatient}
    />
  );
}
