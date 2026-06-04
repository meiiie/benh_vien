import { defaultTransferContext } from "../config/demoClinicalDefaults.js";
import type { useAuditState } from "../features/audit/auditState.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import { buildPatientWorkspaceLifecycle } from "../features/patient-workspace/patientWorkspaceLifecycle.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { buildRecordTransferLoaders } from "../features/record-transfers/recordTransferLoaders.js";
import type { buildConsentLoaders } from "../features/consents/consentLoaders.js";
import type { buildAppAuditLoaders } from "./appAuditLoaders.js";
import type { buildAppFhirPreviewLoaders } from "./appFhirPreviewLoaders.js";
import type { buildAppPatientWorkspaceLoaders } from "./appPatientWorkspaceLoaders.js";

type AuditState = ReturnType<typeof useAuditState>;
type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type FhirPreviewState = ReturnType<typeof useFhirPreviewState>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PlatformState = ReturnType<typeof usePlatformState>;
type AppAuditLoaders = ReturnType<typeof buildAppAuditLoaders>;
type AppFhirPreviewLoaders = ReturnType<typeof buildAppFhirPreviewLoaders>;
type AppPatientWorkspaceLoaders =
  ReturnType<typeof buildAppPatientWorkspaceLoaders>;
type ConsentLoaders = ReturnType<typeof buildConsentLoaders>;
type RecordTransferLoaders = ReturnType<typeof buildRecordTransferLoaders>;

type BuildAppPatientWorkspaceLifecycleInput = {
  readonly auditState: AuditState;
  readonly auditLoaders: AppAuditLoaders;
  readonly canReadAudit: boolean;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly consentLoaders: ConsentLoaders;
  readonly fhirPreviewState: FhirPreviewState;
  readonly fhirPreviewLoaders: AppFhirPreviewLoaders;
  readonly interoperabilityState: InteroperabilityState;
  readonly isAuditOnlySession: boolean;
  readonly patientWorkspaceLoaders: AppPatientWorkspaceLoaders;
  readonly platformState: PlatformState;
  readonly recordTransferLoaders: RecordTransferLoaders;
};

export function buildAppPatientWorkspaceLifecycle({
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
}: BuildAppPatientWorkspaceLifecycleInput) {
  return buildPatientWorkspaceLifecycle({
    canReadAudit,
    consentReference: defaultTransferContext.consentReference,
    isAuditOnlySession,
    loadAllergyIntolerances:
      patientWorkspaceLoaders.loadAllergyIntolerances,
    loadAuditEvents: auditLoaders.loadAuditEvents,
    loadClinicalDocuments: patientWorkspaceLoaders.loadClinicalDocuments,
    loadConditions: patientWorkspaceLoaders.loadConditions,
    loadConsentFhirPreview: fhirPreviewLoaders.loadConsentFhirPreview,
    loadConsents: consentLoaders.loadConsents,
    loadDiagnosticReports: patientWorkspaceLoaders.loadDiagnosticReports,
    loadEncounters: patientWorkspaceLoaders.loadEncounters,
    loadImagingStudies: patientWorkspaceLoaders.loadImagingStudies,
    loadMedicationAdministrations:
      patientWorkspaceLoaders.loadMedicationAdministrations,
    loadMedicationDispenses: patientWorkspaceLoaders.loadMedicationDispenses,
    loadMedicationRequests: patientWorkspaceLoaders.loadMedicationRequests,
    loadObservations: patientWorkspaceLoaders.loadObservations,
    loadPatientFhirBundlePreview:
      fhirPreviewLoaders.loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview:
      fhirPreviewLoaders.loadPatientFhirDocumentBundlePreview,
    loadPatientFhirPreview: fhirPreviewLoaders.loadPatientFhirPreview,
    loadProcedures: patientWorkspaceLoaders.loadProcedures,
    loadRecordTransfers: recordTransferLoaders.loadRecordTransfers,
    loadServiceRequests: patientWorkspaceLoaders.loadServiceRequests,
    loadWorkflowTasks: patientWorkspaceLoaders.loadWorkflowTasks,
    ...fhirPreviewState,
    ...clinicalRecordState,
    setAuditEvents: auditState.setAuditEvents,
    setAuditFhirBundlePreview: auditState.setAuditFhirBundlePreview,
    setAuditIntegrityReport: auditState.setAuditIntegrityReport,
    setCapabilityStatementPreview: platformState.setCapabilityStatementPreview,
    ...interoperabilityState
  });
}
