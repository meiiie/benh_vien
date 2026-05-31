import { buildAuditPanelRenderers } from "../features/audit/auditPanelRenderers.js";
import type { useAuditState } from "../features/audit/auditState.js";
import type { Patient } from "../types/clinical.js";

type AuditState = ReturnType<typeof useAuditState>;
type AuditPanelOptions = Parameters<typeof buildAuditPanelRenderers>[0];

type BuildAuditPanelsInput = {
  readonly auditState: AuditState;
  readonly canReadAudit: boolean;
  readonly onExportAuditFhir: AuditPanelOptions["onExportAuditFhir"];
  readonly onLoadAuditEvents: AuditPanelOptions["onLoadAuditEvents"];
  readonly onReloadGlobalAuditEvents: AuditPanelOptions["onReloadGlobalAuditEvents"];
  readonly onVerifyAuditIntegrity: AuditPanelOptions["onVerifyAuditIntegrity"];
  readonly selectedPatient: Patient | undefined;
};

export function buildAuditPanels({
  auditState,
  canReadAudit,
  onExportAuditFhir,
  onLoadAuditEvents,
  onReloadGlobalAuditEvents,
  onVerifyAuditIntegrity,
  selectedPatient
}: BuildAuditPanelsInput) {
  return buildAuditPanelRenderers({
    auditEvents: auditState.auditEvents,
    auditFhirBundlePreview: auditState.auditFhirBundlePreview,
    auditIntegrityReport: auditState.auditIntegrityReport,
    canReadAudit,
    globalAuditEvents: auditState.globalAuditEvents,
    isExportingAuditFhir: auditState.isExportingAuditFhir,
    isLoadingAuditEvents: auditState.isLoadingAuditEvents,
    isLoadingGlobalAuditEvents: auditState.isLoadingGlobalAuditEvents,
    isVerifyingAuditIntegrity: auditState.isVerifyingAuditIntegrity,
    selectedPatientId: selectedPatient?.id,
    onExportAuditFhir,
    onLoadAuditEvents,
    onReloadGlobalAuditEvents,
    onVerifyAuditIntegrity
  });
}
