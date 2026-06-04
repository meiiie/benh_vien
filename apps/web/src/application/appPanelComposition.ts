import type { useAuditState } from "../features/audit/auditState.js";
import type { buildConsentLoaders } from "../features/consents/consentLoaders.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { buildAppClinicalRecordHandlers } from "./appClinicalRecordHandlers.js";
import type { buildAppAuditLoaders } from "./appAuditLoaders.js";
import type { buildAppFhirPreviewLoaders } from "./appFhirPreviewLoaders.js";
import type { buildAppPatientRegistryHandlers } from "./appPatientRegistryHandlers.js";
import type { buildAppPatientRegistryLoaders } from "./appPatientRegistryLoaders.js";
import type { buildAppPlatformLoaders } from "./appPlatformLoaders.js";
import type { buildAppRecordTransferHandlers } from "./appRecordTransferHandlers.js";
import type { buildAppWorkspaceContext } from "./appDerivedContext.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { Patient } from "../types/patientRegistry.js";
import type { AppRoutePanels } from "./appRouteModels.js";
import { buildAppClinicalRecordPanelHandlers } from "./appClinicalRecordPanelHandlers.js";
import { buildAppRoutePanels } from "./appRoutePanels.js";
import { buildAuditPanels } from "./auditPanelContext.js";
import { buildClinicalDocumentPanels } from "./clinicalDocumentPanelContext.js";
import { buildClinicalRecordPanels } from "./clinicalRecordPanelContext.js";
import { buildInteropPanels } from "./interopPanelContext.js";
import { buildPatientPanels } from "./patientPanelContext.js";

type AuditLoaders = ReturnType<typeof buildAppAuditLoaders>;
type AuditState = ReturnType<typeof useAuditState>;
type ClinicalRecordHandlers = ReturnType<typeof buildAppClinicalRecordHandlers>;
type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type ConsentLoaders = ReturnType<typeof buildConsentLoaders>;
type FhirPreviewLoaders = ReturnType<typeof buildAppFhirPreviewLoaders>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PatientRegistryHandlers = ReturnType<typeof buildAppPatientRegistryHandlers>;
type PatientRegistryLoaders = ReturnType<typeof buildAppPatientRegistryLoaders>;
type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;
type PlatformLoaders = ReturnType<typeof buildAppPlatformLoaders>;
type PlatformState = ReturnType<typeof usePlatformState>;
type RecordTransferHandlers = ReturnType<typeof buildAppRecordTransferHandlers>;
type AppWorkspaceContext = ReturnType<typeof buildAppWorkspaceContext>;

type BuildAppPanelCompositionInput = {
  readonly auditLoaders: AuditLoaders;
  readonly auditState: AuditState;
  readonly canReadAudit: boolean;
  readonly clinicalRecordHandlers: ClinicalRecordHandlers;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly consentLoaders: ConsentLoaders;
  readonly fhirPreviewLoaders: FhirPreviewLoaders;
  readonly hasPatientListFilter: boolean;
  readonly interoperabilityState: InteroperabilityState;
  readonly isPatientMergeConfirmationValid: boolean;
  readonly isSelectedPatientMerged: boolean;
  readonly patientMergeCandidates: readonly Patient[];
  readonly patientMergeConfirmationCode: string;
  readonly patientMergeTargetId: string;
  readonly patientRegistryHandlers: PatientRegistryHandlers;
  readonly patientRegistryLoaders: PatientRegistryLoaders;
  readonly patientRegistryState: PatientRegistryState;
  readonly patientWorkspaceCollections: AppWorkspaceContext["patientWorkspaceCollections"];
  readonly platformLoaders: PlatformLoaders;
  readonly platformState: PlatformState;
  readonly recordTransferHandlers: RecordTransferHandlers;
  readonly selectedPatient: Patient | undefined;
  readonly selectedPatientMergeTarget: Patient | undefined;
  readonly selectedPatientWriteDisabled: boolean;
  readonly visiblePatients: readonly Patient[];
  readonly workspaceSelection: AppWorkspaceContext["workspaceSelection"];
};

export function buildAppPanelComposition({
  auditLoaders,
  auditState,
  canReadAudit,
  clinicalRecordHandlers,
  clinicalRecordState,
  consentLoaders,
  fhirPreviewLoaders,
  hasPatientListFilter,
  interoperabilityState,
  isPatientMergeConfirmationValid,
  isSelectedPatientMerged,
  patientMergeCandidates,
  patientMergeConfirmationCode,
  patientMergeTargetId,
  patientRegistryHandlers,
  patientRegistryLoaders,
  patientRegistryState,
  patientWorkspaceCollections,
  platformLoaders,
  platformState,
  recordTransferHandlers,
  selectedPatient,
  selectedPatientMergeTarget,
  selectedPatientWriteDisabled,
  visiblePatients,
  workspaceSelection
}: BuildAppPanelCompositionInput): AppRoutePanels {
  const patientPanels = buildPatientPanels({
    hasPatientListFilter,
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    onCreatePatient: patientRegistryHandlers.handleCreatePatient,
    onMergePatient: patientRegistryHandlers.handleMergeSelectedPatient,
    onPatientRefresh: patientRegistryLoaders.loadPatients,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeTargetId,
    patientRegistryState,
    selectedPatient,
    selectedPatientMergeTarget,
    visiblePatients
  });
  const interopPanels = buildInteropPanels({
    interoperabilityState,
    isSelectedPatientMerged,
    onCreateRecordTransfer: recordTransferHandlers.handleCreateRecordTransfer,
    onFailRecordTransfer: recordTransferHandlers.handleFailRecordTransfer,
    onLoadConsentFhirPreview: fhirPreviewLoaders.loadConsentFhirPreview,
    onProviderDirectoryRefresh: platformLoaders.loadProviderDirectory,
    onReceiveRecordTransfer: recordTransferHandlers.handleReceiveRecordTransfer,
    onRetryRecordTransfer: recordTransferHandlers.handleRetryRecordTransfer,
    onRevokeConsent: consentLoaders.handleRevokeConsent,
    onSendRecordTransfer: recordTransferHandlers.handleSendRecordTransfer,
    platformState,
    selectedPatientWriteDisabled,
    workspaceSelection
  });
  const auditPanels = buildAuditPanels({
    auditState,
    canReadAudit,
    onExportAuditFhir: fhirPreviewLoaders.loadAuditFhirBundle,
    onLoadAuditEvents: auditLoaders.loadAuditEvents,
    onReloadGlobalAuditEvents: auditLoaders.loadGlobalAuditEvents,
    onVerifyAuditIntegrity: auditLoaders.verifyAuditIntegrity,
    selectedPatient
  });
  const clinicalRecordPanels = buildClinicalRecordPanels({
    clinicalRecordState,
    handlers: buildAppClinicalRecordPanelHandlers({
      clinicalRecordHandlers,
      clinicalRecordState
    }),
    isWriteDisabled: selectedPatientWriteDisabled,
    patientWorkspaceCollections,
    workspaceSelection
  });
  const clinicalDocumentPanels = buildClinicalDocumentPanels({
    clinicalRecordState,
    isSelectedPatientMerged,
    isWriteDisabled: selectedPatientWriteDisabled,
    onCreateDocument: clinicalRecordHandlers.handleCreateClinicalDocument,
    onSignDocument: clinicalRecordHandlers.handleSignClinicalDocument,
    workspaceSelection
  });

  return buildAppRoutePanels({
    auditPanels,
    clinicalDocumentPanels,
    clinicalRecordPanels,
    interopPanels,
    patientPanels
  });
}
