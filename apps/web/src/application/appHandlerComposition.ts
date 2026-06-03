import type { createClinicalApiClient } from "../api/clinicalApi.js";
import type { useAuditState } from "../features/audit/auditState.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { buildPatientWriteGuard } from "../features/patient-registry/patientWriteGuard.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { buildRecordTransferLoaders } from "../features/record-transfers/recordTransferLoaders.js";
import type { Patient } from "../types/patientRegistry.js";
import type { buildAppAuditLoaders } from "./appAuditLoaders.js";
import { buildAppAuthSessionHandlers } from "./appAuthSessionHandlers.js";
import { buildAppClinicalRecordHandlers } from "./appClinicalRecordHandlers.js";
import type { buildAppFhirPreviewLoaders } from "./appFhirPreviewLoaders.js";
import { buildAppPatientRegistryHandlers } from "./appPatientRegistryHandlers.js";
import type { buildAppPatientRegistryLoaders } from "./appPatientRegistryLoaders.js";
import type { buildAppPatientWorkspaceLifecycle } from "./appPatientWorkspaceLifecycle.js";
import type { buildAppPatientWorkspaceLoaders } from "./appPatientWorkspaceLoaders.js";
import { buildAppRecordTransferHandlers } from "./appRecordTransferHandlers.js";
import type { useAppShellState } from "./appShellState.js";

type AppShellState = ReturnType<typeof useAppShellState>;
type AuditLoaders = ReturnType<typeof buildAppAuditLoaders>;
type AuditState = ReturnType<typeof useAuditState>;
type ClinicalApiClient = ReturnType<typeof createClinicalApiClient>;
type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type FhirPreviewLoaders = ReturnType<typeof buildAppFhirPreviewLoaders>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PatientRegistryLoaders = ReturnType<typeof buildAppPatientRegistryLoaders>;
type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;
type PatientWorkspaceLifecycle =
  ReturnType<typeof buildAppPatientWorkspaceLifecycle>;
type PatientWorkspaceLoaders = ReturnType<typeof buildAppPatientWorkspaceLoaders>;
type PatientWriteGuard = ReturnType<typeof buildPatientWriteGuard>;
type PlatformState = ReturnType<typeof usePlatformState>;
type RecordTransferLoaders = ReturnType<typeof buildRecordTransferLoaders>;

type BuildAppHandlerCompositionInput = {
  readonly auditLoaders: AuditLoaders;
  readonly auditState: AuditState;
  readonly canMergePatients: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly ensureSelectedPatientWritable: PatientWriteGuard["ensureSelectedPatientWritable"];
  readonly fhirPreviewLoaders: FhirPreviewLoaders;
  readonly interoperabilityState: InteroperabilityState;
  readonly isPatientMergeConfirmationValid: boolean;
  readonly loginForm: AppShellState["loginForm"];
  readonly patientMergeConfirmationCode: string;
  readonly patientMergeTargetId: string;
  readonly patientRegistryLoaders: PatientRegistryLoaders;
  readonly patientRegistryState: PatientRegistryState;
  readonly patientWorkspaceLifecycle: PatientWorkspaceLifecycle;
  readonly patientWorkspaceLoaders: PatientWorkspaceLoaders;
  readonly platformState: PlatformState;
  readonly recordTransferLoaders: RecordTransferLoaders;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: AppShellState["setAppRoute"];
  readonly setAuthSession: AppShellState["setAuthSession"];
  readonly setIsAuthenticated: AppShellState["setIsAuthenticated"];
  readonly setLoginError: AppShellState["setLoginError"];
  readonly setStatusMessage: AppShellState["setStatusMessage"];
};

export function buildAppHandlerComposition({
  auditLoaders,
  auditState,
  canMergePatients,
  clinicalApi,
  clinicalRecordState,
  ensureSelectedPatientWritable,
  fhirPreviewLoaders,
  interoperabilityState,
  isPatientMergeConfirmationValid,
  loginForm,
  patientMergeConfirmationCode,
  patientMergeTargetId,
  patientRegistryLoaders,
  patientRegistryState,
  patientWorkspaceLifecycle,
  patientWorkspaceLoaders,
  platformState,
  recordTransferLoaders,
  selectedPatient,
  setAppRoute,
  setAuthSession,
  setIsAuthenticated,
  setLoginError,
  setStatusMessage
}: BuildAppHandlerCompositionInput) {
  const clinicalRecordHandlers = buildAppClinicalRecordHandlers({
    auditLoaders,
    clinicalApi,
    clinicalRecordState,
    ensureSelectedPatientWritable,
    fhirPreviewLoaders,
    patientWorkspaceLoaders,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });
  const patientRegistryHandlers = buildAppPatientRegistryHandlers({
    canMergePatients,
    clinicalApi,
    isPatientMergeConfirmationValid,
    loadPatients: patientRegistryLoaders.loadPatients,
    loadPatientWorkspace: patientWorkspaceLifecycle.loadPatientWorkspace,
    patientMergeConfirmationCode,
    patientMergeTargetId,
    patientRegistryState,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });
  const recordTransferHandlers = buildAppRecordTransferHandlers({
    clinicalApi,
    ensureSelectedPatientWritable,
    interoperabilityState,
    loadRecordTransferDeliveryAttempts:
      recordTransferLoaders.loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview:
      recordTransferLoaders.loadRecordTransferFhirTaskPreview,
    loadRecordTransfers: recordTransferLoaders.loadRecordTransfers,
    selectedPatient,
    setStatusMessage
  });
  const authSessionHandlers = buildAppAuthSessionHandlers({
    auditState,
    clearPatientWorkspaceState:
      patientWorkspaceLifecycle.clearPatientWorkspaceState,
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
  });

  return {
    authSessionHandlers,
    clinicalRecordHandlers,
    patientRegistryHandlers,
    recordTransferHandlers
  };
}
