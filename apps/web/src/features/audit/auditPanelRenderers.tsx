import type { ReactNode } from "react";
import type { AuditEvent, AuditIntegrityReport } from "../../types/clinical.js";
import { GlobalAuditPanel, PatientAuditPanel } from "./AuditPanels.js";

type PatientAuditAction = (patientId: string) => Promise<void> | void;

type BuildAuditPanelRenderersOptions = {
  readonly auditEvents: readonly AuditEvent[];
  readonly auditFhirBundlePreview: unknown;
  readonly auditIntegrityReport?: AuditIntegrityReport;
  readonly canReadAudit: boolean;
  readonly globalAuditEvents: readonly AuditEvent[];
  readonly isExportingAuditFhir: boolean;
  readonly isLoadingAuditEvents: boolean;
  readonly isLoadingGlobalAuditEvents: boolean;
  readonly isVerifyingAuditIntegrity: boolean;
  readonly selectedPatientId?: string;
  readonly onExportAuditFhir: PatientAuditAction;
  readonly onLoadAuditEvents: PatientAuditAction;
  readonly onReloadGlobalAuditEvents: () => Promise<void> | void;
  readonly onVerifyAuditIntegrity: PatientAuditAction;
};

export type AuditPanelRenderers = {
  readonly audit: () => ReactNode;
  readonly globalAudit: () => ReactNode;
};

export function buildAuditPanelRenderers({
  auditEvents,
  auditFhirBundlePreview,
  auditIntegrityReport,
  canReadAudit,
  globalAuditEvents,
  isExportingAuditFhir,
  isLoadingAuditEvents,
  isLoadingGlobalAuditEvents,
  isVerifyingAuditIntegrity,
  selectedPatientId,
  onExportAuditFhir,
  onLoadAuditEvents,
  onReloadGlobalAuditEvents,
  onVerifyAuditIntegrity
}: BuildAuditPanelRenderersOptions): AuditPanelRenderers {
  return {
    audit: () => (
      <PatientAuditPanel
        auditEvents={auditEvents}
        auditFhirBundlePreview={auditFhirBundlePreview}
        auditIntegrityReport={auditIntegrityReport}
        canReadAudit={canReadAudit}
        hasSelectedPatient={Boolean(selectedPatientId)}
        isExportingAuditFhir={isExportingAuditFhir}
        isLoadingAuditEvents={isLoadingAuditEvents}
        isVerifyingAuditIntegrity={isVerifyingAuditIntegrity}
        onExportAuditFhir={() => selectedPatientId && void onExportAuditFhir(selectedPatientId)}
        onLoadAuditEvents={() => selectedPatientId && void onLoadAuditEvents(selectedPatientId)}
        onVerifyAuditIntegrity={() =>
          selectedPatientId && void onVerifyAuditIntegrity(selectedPatientId)
        }
      />
    ),
    globalAudit: () => (
      <GlobalAuditPanel
        auditEvents={globalAuditEvents}
        canReadAudit={canReadAudit}
        isLoading={isLoadingGlobalAuditEvents}
        onReload={() => void onReloadGlobalAuditEvents()}
      />
    )
  };
}
