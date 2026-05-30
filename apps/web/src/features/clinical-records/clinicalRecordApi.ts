import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AllergyIntolerance,
  AllergyIntolerancesResponse,
  Condition,
  ConditionsResponse,
  DiagnosticReport,
  DiagnosticReportsResponse,
  Encounter,
  EncountersResponse,
  ImagingStudiesResponse,
  ImagingStudy,
  MedicationAdministration,
  MedicationAdministrationsResponse,
  MedicationDispense,
  MedicationDispensesResponse,
  MedicationRequest,
  MedicationRequestsResponse,
  Observation,
  ObservationsResponse,
  Procedure,
  ProceduresResponse,
  ServiceRequest,
  ServiceRequestsResponse,
  WorkflowTasksResponse
} from "../../types/clinical.js";

type ClinicalCommand = Record<string, unknown>;

export function listEncounters(
  api: ClinicalApiClient,
  patientId: string
): Promise<EncountersResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/encounters`);
}

export function createEncounter(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<Encounter> {
  return postTreatmentJson(api, `/patients/${patientId}/encounters`, command);
}

export function finishEncounter(
  api: ClinicalApiClient,
  encounterId: string
): Promise<Encounter> {
  return postTreatmentJson(api, `/encounters/${encounterId}/finish`);
}

export function exportEncounterFhir(
  api: ClinicalApiClient,
  encounterId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/encounters/${encounterId}/fhir`);
}

export function listAllergyIntolerances(
  api: ClinicalApiClient,
  patientId: string
): Promise<AllergyIntolerancesResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/allergy-intolerances`);
}

export function createAllergyIntolerance(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<AllergyIntolerance> {
  return postTreatmentJson(api, `/patients/${patientId}/allergy-intolerances`, command);
}

export function exportAllergyIntoleranceFhir(
  api: ClinicalApiClient,
  allergyIntoleranceId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/allergy-intolerances/${allergyIntoleranceId}/fhir`);
}

export function listConditions(
  api: ClinicalApiClient,
  patientId: string
): Promise<ConditionsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/conditions`);
}

export function createCondition(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<Condition> {
  return postTreatmentJson(api, `/patients/${patientId}/conditions`, command);
}

export function exportConditionFhir(
  api: ClinicalApiClient,
  conditionId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/conditions/${conditionId}/fhir`);
}

export function listObservations(
  api: ClinicalApiClient,
  patientId: string
): Promise<ObservationsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/observations`);
}

export function createObservation(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<Observation> {
  return postTreatmentJson(api, `/patients/${patientId}/observations`, command);
}

export function exportObservationFhir(
  api: ClinicalApiClient,
  observationId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/observations/${observationId}/fhir`);
}

export function listMedicationRequests(
  api: ClinicalApiClient,
  patientId: string
): Promise<MedicationRequestsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/medication-requests`);
}

export function createMedicationRequest(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<MedicationRequest> {
  return postTreatmentJson(api, `/patients/${patientId}/medication-requests`, command);
}

export function exportMedicationRequestFhir(
  api: ClinicalApiClient,
  medicationRequestId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/medication-requests/${medicationRequestId}/fhir`);
}

export function listMedicationDispenses(
  api: ClinicalApiClient,
  patientId: string
): Promise<MedicationDispensesResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/medication-dispenses`);
}

export function createMedicationDispense(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<MedicationDispense> {
  return postTreatmentJson(api, `/patients/${patientId}/medication-dispenses`, command);
}

export function exportMedicationDispenseFhir(
  api: ClinicalApiClient,
  medicationDispenseId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/medication-dispenses/${medicationDispenseId}/fhir`);
}

export function listMedicationAdministrations(
  api: ClinicalApiClient,
  patientId: string
): Promise<MedicationAdministrationsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/medication-administrations`);
}

export function createMedicationAdministration(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<MedicationAdministration> {
  return postTreatmentJson(
    api,
    `/patients/${patientId}/medication-administrations`,
    command
  );
}

export function exportMedicationAdministrationFhir(
  api: ClinicalApiClient,
  medicationAdministrationId: string
): Promise<unknown> {
  return requestTreatmentJson(
    api,
    `/medication-administrations/${medicationAdministrationId}/fhir`
  );
}

export function listServiceRequests(
  api: ClinicalApiClient,
  patientId: string
): Promise<ServiceRequestsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/service-requests`);
}

export function createServiceRequest(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<ServiceRequest> {
  return postTreatmentJson(api, `/patients/${patientId}/service-requests`, command);
}

export function exportServiceRequestFhir(
  api: ClinicalApiClient,
  serviceRequestId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/service-requests/${serviceRequestId}/fhir`);
}

export function listWorkflowTasks(
  api: ClinicalApiClient,
  patientId: string
): Promise<WorkflowTasksResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/workflow-tasks`);
}

export function exportWorkflowTaskFhir(
  api: ClinicalApiClient,
  taskId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/workflow-tasks/${taskId}/fhir`);
}

export function listProcedures(
  api: ClinicalApiClient,
  patientId: string
): Promise<ProceduresResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/procedures`);
}

export function createProcedure(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<Procedure> {
  return postTreatmentJson(api, `/patients/${patientId}/procedures`, command);
}

export function exportProcedureFhir(
  api: ClinicalApiClient,
  procedureId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/procedures/${procedureId}/fhir`);
}

export function listDiagnosticReports(
  api: ClinicalApiClient,
  patientId: string
): Promise<DiagnosticReportsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/diagnostic-reports`);
}

export function createDiagnosticReport(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<DiagnosticReport> {
  return postTreatmentJson(api, `/patients/${patientId}/diagnostic-reports`, command);
}

export function exportDiagnosticReportFhir(
  api: ClinicalApiClient,
  diagnosticReportId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/diagnostic-reports/${diagnosticReportId}/fhir`);
}

export function listImagingStudies(
  api: ClinicalApiClient,
  patientId: string
): Promise<ImagingStudiesResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/imaging-studies`);
}

export function createImagingStudy(
  api: ClinicalApiClient,
  patientId: string,
  command: ClinicalCommand
): Promise<ImagingStudy> {
  return postTreatmentJson(api, `/patients/${patientId}/imaging-studies`, command);
}

export function exportImagingStudyFhir(
  api: ClinicalApiClient,
  imagingStudyId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/imaging-studies/${imagingStudyId}/fhir`);
}

function requestTreatmentJson<T>(api: ClinicalApiClient, path: string): Promise<T> {
  return api.requestJson<T>(path, {
    purposeOfUse: "TREATMENT"
  });
}

function postTreatmentJson<T>(
  api: ClinicalApiClient,
  path: string,
  command?: ClinicalCommand
): Promise<T> {
  return api.requestJson<T>(path, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    ...(command === undefined ? {} : { json: command })
  });
}
