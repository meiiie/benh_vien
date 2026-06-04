import { AuditLogPage } from "./AuditLogPage.js";
import { DashboardPage } from "./DashboardPage.js";
import { DocumentsPage } from "./DocumentsPage.js";
import { IntegrationGatewayRouteRenderer } from "./IntegrationGatewayRouteRenderer.js";
import { InteropRouteRenderer } from "./InteropRouteRenderer.js";
import { SettingsPage } from "./SettingsPage.js";
import { WorkspaceRouteRenderer } from "./WorkspaceRouteRenderer.js";
import type { AppRouteRendererProps } from "./AppRouteRendererTypes.js";

export function AppRouteRenderer(props: AppRouteRendererProps) {
  if (props.isIntegrationSession) {
    return (
      <IntegrationGatewayRouteRenderer
        apiBaseUrl={props.apiBaseUrl}
        authSession={props.authSession}
        gatewayAcknowledgementForm={props.gatewayAcknowledgementForm}
        gatewayAcknowledgementResult={props.gatewayAcknowledgementResult}
        isSubmittingGatewayAcknowledgement={
          props.isSubmittingGatewayAcknowledgement
        }
        onGatewayAcknowledgementFormChange={
          props.onGatewayAcknowledgementFormChange
        }
        onGatewayAcknowledgementSubmit={props.onGatewayAcknowledgementSubmit}
      />
    );
  }

  if (props.appRoute === "workspace") {
    return (
      <WorkspaceRouteRenderer
        canMergePatients={props.canMergePatients}
        panels={props.panels}
      />
    );
  }

  if (props.appRoute === "documents") {
    return (
      <DocumentsPage
        documentFhirPreview={props.fhirPreviews.document}
        documentPanel={props.panels.clinicalDocument()}
        documentProvenanceFhirPreview={props.fhirPreviews.documentProvenance}
        patientListPanel={props.panels.patientList()}
      />
    );
  }

  if (props.appRoute === "audit") {
    return (
      <AuditLogPage
        auditPanel={props.panels.audit()}
        globalAuditPanel={props.panels.globalAudit()}
      />
    );
  }

  if (props.appRoute === "interop") {
    return (
      <InteropRouteRenderer
        fhirPreviews={props.fhirPreviews}
        panels={props.panels}
        providerDirectory={props.providerDirectory}
        referenceSignals={props.referenceSignals}
        selectedPatient={props.selectedPatient}
        workflowSteps={props.workflowSteps}
      />
    );
  }

  if (props.appRoute === "settings") {
    return (
      <SettingsPage
        apiBaseUrl={props.apiBaseUrl}
        apiRuntimeInfo={props.apiRuntimeInfo}
        apiRuntimeWarning={props.apiRuntimeWarning}
        authSession={props.authSession}
        canViewRuntimeInfo={props.canViewRuntimeInfo}
        loginForm={props.loginForm}
        onReloadRuntimeInfo={props.onReloadRuntimeInfo}
      />
    );
  }

  return (
    <DashboardPage
      latestEncounterServiceType={props.latestEncounterServiceType}
      metrics={props.dashboardMetrics}
      onNavigate={props.onNavigate}
      selectedPatient={props.selectedPatient}
    />
  );
}
