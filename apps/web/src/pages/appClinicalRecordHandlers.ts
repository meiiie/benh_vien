import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { buildClinicalDocumentHandlers } from "../features/clinical-documents/clinicalDocumentHandlers.js";
import { buildCarePlanHandlers } from "../features/clinical-records/carePlanHandlers.js";
import { buildClinicalEntryHandlers } from "../features/clinical-records/clinicalEntryHandlers.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import { buildEncounterHandlers } from "../features/clinical-records/encounterHandlers.js";
import { buildMedicationHandlers } from "../features/clinical-records/medicationHandlers.js";
import type { AppRoute, Patient } from "../types/clinical.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type EncounterHandlerConfig = Parameters<typeof buildEncounterHandlers>[0];
type ClinicalEntryHandlerConfig = Parameters<typeof buildClinicalEntryHandlers>[0];
type MedicationHandlerConfig = Parameters<typeof buildMedicationHandlers>[0];
type CarePlanHandlerConfig = Parameters<typeof buildCarePlanHandlers>[0];
type ClinicalDocumentHandlerConfig =
  Parameters<typeof buildClinicalDocumentHandlers>[0];

type BuildAppClinicalRecordHandlersInput = {
  readonly clinicalApi: ClinicalApiClient;
  readonly clinicalRecordState: ClinicalRecordState;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadAllergyIntolerances:
    ClinicalEntryHandlerConfig["loadAllergyIntolerances"];
  readonly loadAuditEvents: EncounterHandlerConfig["loadAuditEvents"];
  readonly loadClinicalDocuments:
    ClinicalDocumentHandlerConfig["loadClinicalDocuments"];
  readonly loadConditions: ClinicalEntryHandlerConfig["loadConditions"];
  readonly loadDiagnosticReports:
    CarePlanHandlerConfig["loadDiagnosticReports"];
  readonly loadDocumentFhirPreview:
    ClinicalDocumentHandlerConfig["loadDocumentFhirPreview"];
  readonly loadDocumentProvenanceFhirPreview:
    ClinicalDocumentHandlerConfig["loadDocumentProvenanceFhirPreview"];
  readonly loadEncounterFhirPreview:
    EncounterHandlerConfig["loadEncounterFhirPreview"];
  readonly loadEncounters: EncounterHandlerConfig["loadEncounters"];
  readonly loadImagingStudies: CarePlanHandlerConfig["loadImagingStudies"];
  readonly loadMedicationAdministrations:
    MedicationHandlerConfig["loadMedicationAdministrations"];
  readonly loadMedicationDispenses:
    MedicationHandlerConfig["loadMedicationDispenses"];
  readonly loadMedicationRequests:
    MedicationHandlerConfig["loadMedicationRequests"];
  readonly loadObservations: ClinicalEntryHandlerConfig["loadObservations"];
  readonly loadPatientFhirBundlePreview:
    ClinicalEntryHandlerConfig["loadPatientFhirBundlePreview"];
  readonly loadPatientFhirDocumentBundlePreview:
    MedicationHandlerConfig["loadPatientFhirDocumentBundlePreview"];
  readonly loadProcedures: CarePlanHandlerConfig["loadProcedures"];
  readonly loadServiceRequests: CarePlanHandlerConfig["loadServiceRequests"];
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppClinicalRecordHandlers({
  clinicalApi,
  clinicalRecordState,
  ensureSelectedPatientWritable,
  loadAllergyIntolerances,
  loadAuditEvents,
  loadClinicalDocuments,
  loadConditions,
  loadDiagnosticReports,
  loadDocumentFhirPreview,
  loadDocumentProvenanceFhirPreview,
  loadEncounterFhirPreview,
  loadEncounters,
  loadImagingStudies,
  loadMedicationAdministrations,
  loadMedicationDispenses,
  loadMedicationRequests,
  loadObservations,
  loadPatientFhirBundlePreview,
  loadPatientFhirDocumentBundlePreview,
  loadProcedures,
  loadServiceRequests,
  selectedPatient,
  setAppRoute,
  setStatusMessage
}: BuildAppClinicalRecordHandlersInput) {
  const encounterHandlers = buildEncounterHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadEncounterFhirPreview,
    loadEncounters,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const clinicalEntryHandlers = buildClinicalEntryHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAllergyIntolerances,
    loadAuditEvents,
    loadConditions,
    loadObservations,
    loadPatientFhirBundlePreview,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const medicationHandlers = buildMedicationHandlers({
    clinicalApi,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadMedicationAdministrations,
    loadMedicationDispenses,
    loadMedicationRequests,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    ...clinicalRecordState,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const carePlanHandlers = buildCarePlanHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadDiagnosticReports,
    loadImagingStudies,
    loadPatientFhirBundlePreview,
    loadPatientFhirDocumentBundlePreview,
    loadProcedures,
    loadServiceRequests,
    selectedPatient,
    setAppRoute,
    setStatusMessage
  });

  const clinicalDocumentHandlers = buildClinicalDocumentHandlers({
    clinicalApi,
    ...clinicalRecordState,
    ensureSelectedPatientWritable,
    loadAuditEvents,
    loadClinicalDocuments,
    loadDocumentFhirPreview,
    loadDocumentProvenanceFhirPreview,
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
