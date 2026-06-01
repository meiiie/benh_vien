import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  Procedure,
  ProceduresResponse,
  ServiceRequest,
  ServiceRequestsResponse,
  WorkflowTasksResponse
} from "../../types/careWorkflow.js";
import { postTreatmentJson, requestTreatmentJson } from "./clinicalRecordHttp.js";

type CreateServiceRequestCommand = Pick<
  ServiceRequest,
  "category" | "priority" | "code" | "requesterPractitionerId"
> &
  Partial<
    Pick<
      ServiceRequest,
      | "encounterId"
      | "reasonConditionId"
      | "occurrenceAt"
      | "authoredOn"
      | "performerOrganizationId"
      | "patientInstruction"
      | "note"
    >
  >;

type CreateProcedureCommand = Pick<
  Procedure,
  "category" | "status" | "code" | "performers" | "reportReferences"
> &
  Partial<
    Pick<
      Procedure,
      | "encounterId"
      | "basedOnServiceRequestId"
      | "reasonConditionId"
      | "performedPeriod"
      | "recorderPractitionerId"
      | "asserterPractitionerId"
      | "bodySite"
      | "outcome"
      | "note"
    >
  >;

export function listServiceRequests(
  api: ClinicalApiClient,
  patientId: string
): Promise<ServiceRequestsResponse> {
  return requestTreatmentJson(api, `/patients/${patientId}/service-requests`);
}

export function createServiceRequest(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateServiceRequestCommand
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
  command: CreateProcedureCommand
): Promise<Procedure> {
  return postTreatmentJson(api, `/patients/${patientId}/procedures`, command);
}

export function exportProcedureFhir(
  api: ClinicalApiClient,
  procedureId: string
): Promise<unknown> {
  return requestTreatmentJson(api, `/procedures/${procedureId}/fhir`);
}
