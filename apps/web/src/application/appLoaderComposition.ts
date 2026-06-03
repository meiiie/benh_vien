import type { createClinicalApiClient } from "../api/clinicalApi.js";
import type { useAuditState } from "../features/audit/auditState.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { buildConsentLoaders } from "../features/consents/consentLoaders.js";
import type { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { buildPatientWriteGuard } from "../features/patient-registry/patientWriteGuard.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import { buildRecordTransferLoaders } from "../features/record-transfers/recordTransferLoaders.js";
import type { AuthSession } from "../types/appRuntime.js";
import type { Patient } from "../types/patientRegistry.js";
import { buildAppAuditLoaders } from "./appAuditLoaders.js";
import { buildAppFhirPreviewLoaders } from "./appFhirPreviewLoaders.js";
import { buildAppPatientRegistryLoaders } from "./appPatientRegistryLoaders.js";
import { buildAppPatientWorkspaceLifecycle } from "./appPatientWorkspaceLifecycle.js";
import { buildAppPatientWorkspaceLoaders } from "./appPatientWorkspaceLoaders.js";
import { buildAppPlatformLoaders } from "./appPlatformLoaders.js";
import type { useAppShellState } from "./appShellState.js";

type AppShellState = ReturnType<typeof useAppShellState>;
type AuditState = ReturnType<typeof useAuditState>;
type ClinicalApiClient = ReturnType<typeof createClinicalApiClient>;
type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type FhirPreviewState = ReturnType<typeof useFhirPreviewState>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;
type PatientWriteGuard = ReturnType<typeof buildPatientWriteGuard>;
type PlatformState = ReturnType<typeof usePlatformState>;

type BuildAppLoaderCompositionInput = {
  readonly auditState: AuditState;
  readonly authSession: AuthSession | undefined;
  readonly canReadAudit: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly ensureSelectedPatientWritable: PatientWriteGuard["ensureSelectedPatientWritable"];
  readonly fhirPreviewState: FhirPreviewState;
  readonly interoperabilityState: InteroperabilityState;
  readonly isAuditOnlySession: boolean;
  readonly patientRegistryState: PatientRegistryState;
  readonly platformState: PlatformState;
  readonly selectedPatient: Patient | undefined;
  readonly setStatusMessage: AppShellState["setStatusMessage"];
};

export function buildAppLoaderComposition({
  auditState,
  authSession,
  canReadAudit,
  clinicalApi,
  clinicalRecordState,
  ensureSelectedPatientWritable,
  fhirPreviewState,
  interoperabilityState,
  isAuditOnlySession,
  patientRegistryState,
  platformState,
  selectedPatient,
  setStatusMessage
}: BuildAppLoaderCompositionInput) {
  const patientRegistryLoaders = buildAppPatientRegistryLoaders({
    clinicalApi,
    isAuditOnlySession,
    patientRegistryState,
    setStatusMessage
  });
  const fhirPreviewLoaders = buildAppFhirPreviewLoaders({
    auditState,
    canReadAudit,
    clinicalApi,
    fhirPreviewState,
    isAuditOnlySession,
    platformState,
    setStatusMessage
  });
  const auditLoaders = buildAppAuditLoaders({
    auditState,
    canReadAudit,
    clinicalApi,
    setStatusMessage
  });
  const consentLoaders = buildConsentLoaders({
    clinicalApi,
    ensureSelectedPatientWritable,
    loadConsentFhirPreview: fhirPreviewLoaders.loadConsentFhirPreview,
    selectedPatient,
    ...interoperabilityState,
    setStatusMessage
  });
  const recordTransferLoaders = buildRecordTransferLoaders({
    clinicalApi,
    ...interoperabilityState,
    setRecordTransferFhirTaskPreview:
      fhirPreviewState.setRecordTransferFhirTaskPreview,
    setStatusMessage
  });
  const platformLoaders = buildAppPlatformLoaders({
    authSession,
    clinicalApi,
    isAuditOnlySession,
    loadProviderDirectoryFhirPreview:
      fhirPreviewLoaders.loadProviderDirectoryFhirPreview,
    platformState
  });
  const patientWorkspaceLoaders = buildAppPatientWorkspaceLoaders({
    clinicalApi,
    clinicalRecordState,
    setStatusMessage
  });
  const patientWorkspaceLifecycle = buildAppPatientWorkspaceLifecycle({
    auditState,
    auditLoaders,
    canReadAudit,
    clinicalRecordState,
    consentLoaders,
    fhirPreviewState,
    fhirPreviewLoaders,
    interoperabilityState,
    isAuditOnlySession,
    patientWorkspaceLoaders,
    platformState,
    recordTransferLoaders
  });

  return {
    auditLoaders,
    consentLoaders,
    fhirPreviewLoaders,
    patientRegistryLoaders,
    patientWorkspaceLifecycle,
    patientWorkspaceLoaders,
    platformLoaders,
    recordTransferLoaders
  };
}
