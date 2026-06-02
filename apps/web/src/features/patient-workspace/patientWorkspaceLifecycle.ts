import {
  clearPatientWorkspaceState,
  type PatientWorkspaceResetConfig
} from "./patientWorkspaceReset.js";

type AuditLoaderOptions = {
  readonly silent?: boolean;
};

type PatientWorkspaceLifecycleConfig = PatientWorkspaceResetConfig & {
  readonly canReadAudit: boolean;
  readonly consentReference: string;
  readonly isAuditOnlySession: boolean;
  readonly loadAllergyIntolerances: (
    patientId: string,
    nextSelectedAllergyIntoleranceId?: string
  ) => Promise<void>;
  readonly loadAuditEvents: (
    patientId: string,
    options?: AuditLoaderOptions
  ) => Promise<void>;
  readonly loadClinicalDocuments: (
    patientId: string,
    nextSelectedDocumentId?: string
  ) => Promise<void>;
  readonly loadConditions: (
    patientId: string,
    nextSelectedConditionId?: string
  ) => Promise<void>;
  readonly loadConsentFhirPreview: (consentId: string) => Promise<void>;
  readonly loadConsents: (patientId: string) => Promise<void>;
  readonly loadDiagnosticReports: (
    patientId: string,
    nextSelectedDiagnosticReportId?: string
  ) => Promise<void>;
  readonly loadEncounters: (
    patientId: string,
    nextSelectedEncounterId?: string
  ) => Promise<void>;
  readonly loadImagingStudies: (
    patientId: string,
    nextSelectedImagingStudyId?: string
  ) => Promise<void>;
  readonly loadMedicationAdministrations: (
    patientId: string,
    nextSelectedMedicationAdministrationId?: string
  ) => Promise<void>;
  readonly loadMedicationDispenses: (
    patientId: string,
    nextSelectedMedicationDispenseId?: string
  ) => Promise<void>;
  readonly loadMedicationRequests: (
    patientId: string,
    nextSelectedMedicationRequestId?: string
  ) => Promise<void>;
  readonly loadObservations: (
    patientId: string,
    nextSelectedObservationId?: string
  ) => Promise<void>;
  readonly loadPatientFhirBundlePreview: (patientId: string) => Promise<void>;
  readonly loadPatientFhirDocumentBundlePreview: (
    patientId: string
  ) => Promise<void>;
  readonly loadPatientFhirPreview: (patientId: string) => Promise<void>;
  readonly loadProcedures: (
    patientId: string,
    nextSelectedProcedureId?: string
  ) => Promise<void>;
  readonly loadRecordTransfers: (
    patientId: string,
    nextSelectedRecordTransferId?: string
  ) => Promise<void>;
  readonly loadServiceRequests: (
    patientId: string,
    nextSelectedServiceRequestId?: string
  ) => Promise<void>;
  readonly loadWorkflowTasks: (
    patientId: string,
    nextSelectedWorkflowTaskId?: string
  ) => Promise<void>;
};

export function buildPatientWorkspaceLifecycle(
  config: PatientWorkspaceLifecycleConfig
) {
  return {
    clearPatientWorkspaceState: () => clearPatientWorkspaceState(config),
    loadPatientWorkspace: async (patientId: string) => {
      if (config.isAuditOnlySession) {
        await config.loadAuditEvents(patientId, { silent: true });
        return;
      }

      const workspaceTasks = [
        config.loadPatientFhirPreview(patientId),
        config.loadPatientFhirBundlePreview(patientId),
        config.loadPatientFhirDocumentBundlePreview(patientId),
        config.loadEncounters(patientId),
        config.loadAllergyIntolerances(patientId),
        config.loadConditions(patientId),
        config.loadObservations(patientId),
        config.loadMedicationRequests(patientId),
        config.loadMedicationDispenses(patientId),
        config.loadMedicationAdministrations(patientId),
        config.loadServiceRequests(patientId),
        config.loadWorkflowTasks(patientId),
        config.loadProcedures(patientId),
        config.loadDiagnosticReports(patientId),
        config.loadImagingStudies(patientId),
        config.loadClinicalDocuments(patientId),
        config.loadConsents(patientId),
        config.loadConsentFhirPreview(config.consentReference),
        config.loadRecordTransfers(patientId)
      ];

      if (config.canReadAudit) {
        workspaceTasks.push(config.loadAuditEvents(patientId, { silent: true }));
      } else {
        config.setAuditEvents([]);
        config.setAuditIntegrityReport(undefined);
      }

      await Promise.all(workspaceTasks);
    }
  };
}
