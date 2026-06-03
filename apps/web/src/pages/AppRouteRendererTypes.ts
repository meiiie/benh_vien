import type { FormEvent } from "react";
import type { LoginForm } from "../auth/demoLogin.js";
import type {
  AppRoutePanels,
  FhirPreviewValues,
  ReferenceSignal
} from "../application/appRouteModels.js";
import type { DashboardMetrics } from "../application/dashboardMetrics.js";
import type { AuthenticatedAppRoute } from "../config/appNavigation.js";
import type {
  ApiRuntimeInfo,
  AuthSession
} from "../types/appRuntime.js";
import type { Patient } from "../types/patientRegistry.js";
import type { ProviderDirectory } from "../types/providerDirectory.js";
import type {
  GatewayAcknowledgementForm,
  RecordTransfer
} from "../types/recordTransfers.js";

export type AppRouteRendererProps = {
  readonly apiBaseUrl: string;
  readonly apiRuntimeInfo?: ApiRuntimeInfo;
  readonly apiRuntimeWarning?: string;
  readonly appRoute: AuthenticatedAppRoute;
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
  readonly providerDirectory?: ProviderDirectory;
  readonly referenceSignals: readonly ReferenceSignal[];
  readonly selectedPatient?: Patient;
  readonly workflowSteps: readonly string[];
  readonly onGatewayAcknowledgementFormChange: (
    form: GatewayAcknowledgementForm
  ) => void;
  readonly onGatewayAcknowledgementSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  readonly onNavigate: (route: AuthenticatedAppRoute) => void;
  readonly onReloadRuntimeInfo: () => void;
};
