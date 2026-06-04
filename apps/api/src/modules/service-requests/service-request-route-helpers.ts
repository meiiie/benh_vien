import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequest,
  ServiceRequestRepository,
  ServiceRequestSnapshot
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";

export function toServiceRequestResponse(
  serviceRequest: ServiceRequest
): ServiceRequestSnapshot {
  return serviceRequest.toSnapshot();
}

export async function loadServiceRequestForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  serviceRequestId: string,
  serviceRequestRepository: ServiceRequestRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<ServiceRequest | undefined> {
  const serviceRequest = await serviceRequestRepository.findById(serviceRequestId);

  if (!serviceRequest) {
    sendNotFoundErrorResponse(reply, "SERVICE_REQUEST_NOT_FOUND");

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      serviceRequest.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return serviceRequest;
}

export function sendServiceRequestDomainError(reply: FastifyReply, error: unknown): boolean {
  return sendDomainErrorResponse(reply, error, "SERVICE_REQUEST_DOMAIN_ERROR");
}
