import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { buildAuditLoaders } from "../features/audit/auditLoaders.js";
import type { useAuditState } from "../features/audit/auditState.js";

type AuditState = ReturnType<typeof useAuditState>;

type BuildAppAuditLoadersInput = {
  readonly auditState: AuditState;
  readonly canReadAudit: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppAuditLoaders({
  auditState,
  canReadAudit,
  clinicalApi,
  setStatusMessage
}: BuildAppAuditLoadersInput) {
  return buildAuditLoaders({
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
}
