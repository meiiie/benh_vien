import type { ClinicalApiClient } from "../api/clinicalApi.js";
import type { useAuditState } from "../features/audit/auditState.js";
import { buildFhirPreviewLoaders } from "../features/fhir-preview/fhirPreviewLoaders.js";
import type { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import type { usePlatformState } from "../features/platform/platformState.js";

type AuditState = ReturnType<typeof useAuditState>;
type FhirPreviewState = ReturnType<typeof useFhirPreviewState>;
type PlatformState = ReturnType<typeof usePlatformState>;

type BuildAppFhirPreviewLoadersInput = {
  readonly auditState: AuditState;
  readonly canReadAudit: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly fhirPreviewState: FhirPreviewState;
  readonly isAuditOnlySession: boolean;
  readonly platformState: PlatformState;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppFhirPreviewLoaders({
  auditState,
  canReadAudit,
  clinicalApi,
  fhirPreviewState,
  isAuditOnlySession,
  platformState,
  setStatusMessage
}: BuildAppFhirPreviewLoadersInput) {
  return buildFhirPreviewLoaders({
    canReadAudit,
    clinicalApi,
    isAuditOnlySession,
    ...fhirPreviewState,
    setAuditFhirBundlePreview: auditState.setAuditFhirBundlePreview,
    setIsExportingAuditFhir: auditState.setIsExportingAuditFhir,
    setProviderDirectoryFhirPreview:
      platformState.setProviderDirectoryFhirPreview,
    setStatusMessage
  });
}
