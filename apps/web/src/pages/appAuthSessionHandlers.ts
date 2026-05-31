import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { buildAuthSessionHandlers } from "../auth/authSessionHandlers.js";
import type { LoginForm } from "../auth/demoLogin.js";
import type { useAuditState } from "../features/audit/auditState.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { AppRoute, AuthSession } from "../types/clinical.js";

type AuditState = ReturnType<typeof useAuditState>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;
type PlatformState = ReturnType<typeof usePlatformState>;

type BuildAppAuthSessionHandlersInput = {
  readonly auditState: AuditState;
  readonly clearPatientWorkspaceState: () => void;
  readonly clinicalApi: ClinicalApiClient;
  readonly interoperabilityState: InteroperabilityState;
  readonly loginForm: LoginForm;
  readonly patientRegistryState: PatientRegistryState;
  readonly platformState: PlatformState;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setAuthSession: (session: AuthSession | undefined) => void;
  readonly setIsAuthenticated: (isAuthenticated: boolean) => void;
  readonly setLoginError: (message: string | undefined) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppAuthSessionHandlers({
  auditState,
  clearPatientWorkspaceState,
  clinicalApi,
  interoperabilityState,
  loginForm,
  patientRegistryState,
  platformState,
  setAppRoute,
  setAuthSession,
  setIsAuthenticated,
  setLoginError,
  setStatusMessage
}: BuildAppAuthSessionHandlersInput) {
  return buildAuthSessionHandlers({
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
    setProviderDirectoryFhirPreview:
      platformState.setProviderDirectoryFhirPreview,
    setSelectedPatientId: patientRegistryState.setSelectedPatientId,
    setStatusMessage,
    setTransitioningRecordTransferId:
      interoperabilityState.setTransitioningRecordTransferId
  });
}
