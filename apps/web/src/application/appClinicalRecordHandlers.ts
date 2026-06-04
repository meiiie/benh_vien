import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { buildClinicalDocumentHandlers } from "../features/clinical-documents/clinicalDocumentHandlers.js";
import { buildCarePlanHandlers } from "../features/clinical-records/carePlanHandlers.js";
import { buildClinicalEntryHandlers } from "../features/clinical-records/clinicalEntryHandlers.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { buildEncounterHandlers } from "../features/clinical-records/encounterHandlers.js";
import { buildMedicationHandlers } from "../features/clinical-records/medicationHandlers.js";
import type { AppRoute } from "../types/appRuntime.js";
import type { Patient } from "../types/patientRegistry.js";
import type { buildAppAuditLoaders } from "./appAuditLoaders.js";
import type { buildAppFhirPreviewLoaders } from "./appFhirPreviewLoaders.js";
import type { buildAppPatientWorkspaceLoaders } from "./appPatientWorkspaceLoaders.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type AppAuditLoaders = ReturnType<typeof buildAppAuditLoaders>;
type AppFhirPreviewLoaders = ReturnType<typeof buildAppFhirPreviewLoaders>;
type AppPatientWorkspaceLoaders =
  ReturnType<typeof buildAppPatientWorkspaceLoaders>;

type BuildAppClinicalRecordHandlersInput = {
  readonly auditLoaders: AppAuditLoaders;
  readonly clinicalApi: ClinicalApiClient;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly fhirPreviewLoaders: AppFhirPreviewLoaders;
  readonly patientWorkspaceLoaders: AppPatientWorkspaceLoaders;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppClinicalRecordHandlers({
  auditLoaders,
  clinicalApi,
  clinicalRecordState,
  ensureSelectedPatientWritable,
  fhirPreviewLoaders,
  patientWorkspaceLoaders,
  selectedPatient,
  setAppRoute,
  setStatusMessage
}: BuildAppClinicalRecordHandlersInput) {
  const encounterHandlers = buildEncounterHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents: auditLoaders.loadAuditEvents,
    loadEncounterFhirPreview: fhirPreviewLoaders.loadEncounterFhirPreview,
    loadEncounters: patientWorkspaceLoaders.loadEncounters,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const clinicalEntryHandlers = buildClinicalEntryHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAllergyIntolerances:
      patientWorkspaceLoaders.loadAllergyIntolerances,
    loadAuditEvents: auditLoaders.loadAuditEvents,
    loadConditions: patientWorkspaceLoaders.loadConditions,
    loadObservations: patientWorkspaceLoaders.loadObservations,
    loadPatientFhirBundlePreview:
      fhirPreviewLoaders.loadPatientFhirBundlePreview,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const medicationHandlers = buildMedicationHandlers({
    clinicalApi,
    ensureSelectedPatientWritable,
    loadAuditEvents: auditLoaders.loadAuditEvents,
    loadMedicationAdministrations:
      patientWorkspaceLoaders.loadMedicationAdministrations,
    loadMedicationDispenses: patientWorkspaceLoaders.loadMedicationDispenses,
    loadMedicationRequests: patientWorkspaceLoaders.loadMedicationRequests,
    loadPatientFhirBundlePreview:
      fhirPreviewLoaders.loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview:
      fhirPreviewLoaders.loadPatientFhirDocumentBundlePreview,
    ...clinicalRecordState,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const carePlanHandlers = buildCarePlanHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents: auditLoaders.loadAuditEvents,
    loadDiagnosticReports: patientWorkspaceLoaders.loadDiagnosticReports,
    loadImagingStudies: patientWorkspaceLoaders.loadImagingStudies,
    loadPatientFhirBundlePreview:
      fhirPreviewLoaders.loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview:
      fhirPreviewLoaders.loadPatientFhirDocumentBundlePreview,
    loadProcedures: patientWorkspaceLoaders.loadProcedures,
    loadServiceRequests: patientWorkspaceLoaders.loadServiceRequests,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const clinicalDocumentHandlers = buildClinicalDocumentHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents: auditLoaders.loadAuditEvents,
    loadClinicalDocuments: patientWorkspaceLoaders.loadClinicalDocuments,
    loadDocumentFhirPreview: fhirPreviewLoaders.loadDocumentFhirPreview,
    loadDocumentProvenanceFhirPreview:
      fhirPreviewLoaders.loadDocumentProvenanceFhirPreview,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  return {
    ...encounterHandlers,
    ...clinicalEntryHandlers,
    ...medicationHandlers,
    ...carePlanHandlers,
    ...clinicalDocumentHandlers
  };
}
