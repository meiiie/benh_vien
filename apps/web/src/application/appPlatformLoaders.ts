import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { buildPlatformLoaders } from "../features/platform/platformLoaders.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { AuthSession } from "../types/clinical.js";

type PlatformState = ReturnType<typeof usePlatformState>;
type PlatformLoaderOptions = Parameters<typeof buildPlatformLoaders>[0];

type BuildAppPlatformLoadersInput = {
  readonly authSession: AuthSession | undefined;
  readonly clinicalApi: ClinicalApiClient;
  readonly isAuditOnlySession: boolean;
  readonly loadProviderDirectoryFhirPreview:
    PlatformLoaderOptions["loadProviderDirectoryFhirPreview"];
  readonly platformState: PlatformState;
};

export function buildAppPlatformLoaders({
  authSession,
  clinicalApi,
  isAuditOnlySession,
  loadProviderDirectoryFhirPreview,
  platformState
}: BuildAppPlatformLoadersInput) {
  return buildPlatformLoaders({
    authSession,
    clinicalApi,
    isAuditOnlySession,
    loadProviderDirectoryFhirPreview,
    setApiRuntimeInfo: platformState.setApiRuntimeInfo,
    setApiRuntimeWarning: platformState.setApiRuntimeWarning,
    setCapabilityStatementPreview: platformState.setCapabilityStatementPreview,
    setIsLoadingProviderDirectory: platformState.setIsLoadingProviderDirectory,
    setProviderDirectory: platformState.setProviderDirectory,
    setProviderDirectoryFhirPreview:
      platformState.setProviderDirectoryFhirPreview
  });
}
