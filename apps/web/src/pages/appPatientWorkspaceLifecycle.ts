import { defaultTransferContext } from "../config/demoClinicalDefaults.js";
import type { useAuditState } from "../features/audit/auditState.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { useFhirPreviewState } from "../features/fhir-preview/fhirPreviewState.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import { buildPatientWorkspaceLifecycle } from "../features/patient-workspace/patientWorkspaceLifecycle.js";
import type { usePlatformState } from "../features/platform/platformState.js";

type AuditState = ReturnType<typeof useAuditState>;
type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type FhirPreviewState = ReturnType<typeof useFhirPreviewState>;
type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PlatformState = ReturnType<typeof usePlatformState>;
type PatientWorkspaceLifecycleConfig =
  Parameters<typeof buildPatientWorkspaceLifecycle>[0];

type BuildAppPatientWorkspaceLifecycleInput = {
  readonly auditState: AuditState;
  readonly canReadAudit: boolean;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly fhirPreviewState: FhirPreviewState;
  readonly interoperabilityState: InteroperabilityState;
  readonly isAuditOnlySession: boolean;
  readonly loadAllergyIntolerances:
    PatientWorkspaceLifecycleConfig["loadAllergyIntolerances"];
  readonly loadAuditEvents: PatientWorkspaceLifecycleConfig["loadAuditEvents"];
  readonly loadClinicalDocuments:
    PatientWorkspaceLifecycleConfig["loadClinicalDocuments"];
  readonly loadConditions: PatientWorkspaceLifecycleConfig["loadConditions"];
  readonly loadConsentFhirPreview:
    PatientWorkspaceLifecycleConfig["loadConsentFhirPreview"];
  readonly loadConsents: PatientWorkspaceLifecycleConfig["loadConsents"];
  readonly loadDiagnosticReports:
    PatientWorkspaceLifecycleConfig["loadDiagnosticReports"];
  readonly loadEncounters: PatientWorkspaceLifecycleConfig["loadEncounters"];
  readonly loadImagingStudies:
    PatientWorkspaceLifecycleConfig["loadImagingStudies"];
  readonly loadMedicationAdministrations:
    PatientWorkspaceLifecycleConfig["loadMedicationAdministrations"];
  readonly loadMedicationDispenses:
    PatientWorkspaceLifecycleConfig["loadMedicationDispenses"];
  readonly loadMedicationRequests:
    PatientWorkspaceLifecycleConfig["loadMedicationRequests"];
  readonly loadObservations: PatientWorkspaceLifecycleConfig["loadObservations"];
  readonly loadPatientFhirBundlePreview:
    PatientWorkspaceLifecycleConfig["loadPatientFhirBundlePreview"];
  readonly loadPatientFhirDocumentBundlePreview:
    PatientWorkspaceLifecycleConfig["loadPatientFhirDocumentBundlePreview"];
  readonly loadPatientFhirPreview:
    PatientWorkspaceLifecycleConfig["loadPatientFhirPreview"];
  readonly loadProcedures: PatientWorkspaceLifecycleConfig["loadProcedures"];
  readonly loadRecordTransfers:
    PatientWorkspaceLifecycleConfig["loadRecordTransfers"];
  readonly loadServiceRequests:
    PatientWorkspaceLifecycleConfig["loadServiceRequests"];
  readonly loadWorkflowTasks:
    PatientWorkspaceLifecycleConfig["loadWorkflowTasks"];
  readonly platformState: PlatformState;
};

export function buildAppPatientWorkspaceLifecycle({
  auditState,
  canReadAudit,
  clinicalRecordState,
  fhirPreviewState,
  interoperabilityState,
  isAuditOnlySession,
  loadAllergyIntolerances,
  loadAuditEvents,
  loadClinicalDocuments,
  loadConditions,
  loadConsentFhirPreview,
  loadConsents,
  loadDiagnosticReports,
  loadEncounters,
  loadImagingStudies,
  loadMedicationAdministrations,
  loadMedicationDispenses,
  loadMedicationRequests,
  loadObservations,
  loadPatientFhirBundlePreview,
  loadPatientFhirDocumentBundlePreview,
  loadPatientFhirPreview,
  loadProcedures,
  loadRecordTransfers,
  loadServiceRequests,
  loadWorkflowTasks,
  platformState
}: BuildAppPatientWorkspaceLifecycleInput) {
  return buildPatientWorkspaceLifecycle({
    canReadAudit,
    consentReference: defaultTransferContext.consentReference,
    isAuditOnlySession,
    loadAllergyIntolerances,
    loadAuditEvents,
    loadClinicalDocuments,
    loadConditions,
    loadConsentFhirPreview,
    loadConsents,
    loadDiagnosticReports,
    loadEncounters,
    loadImagingStudies,
    loadMedicationAdministrations,
    loadMedicationDispenses,
    loadMedicationRequests,
    loadObservations,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    loadPatientFhirPreview,
    loadProcedures,
    loadRecordTransfers,
    loadServiceRequests,
    loadWorkflowTasks,
    ...fhirPreviewState,
    ...clinicalRecordState,
    setAuditEvents: auditState.setAuditEvents,
    setAuditFhirBundlePreview: auditState.setAuditFhirBundlePreview,
    setAuditIntegrityReport: auditState.setAuditIntegrityReport,
    setCapabilityStatementPreview: platformState.setCapabilityStatementPreview,
    ...interoperabilityState
  });
}
