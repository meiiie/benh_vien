import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  Observation,
  ObservationRepository,
  ObservationSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";

export function toObservationResponse(
  observation: Observation
): ObservationSnapshot {
  return observation.toSnapshot();
}

export async function loadObservationForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  observationId: string,
  observationRepository: ObservationRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<Observation | undefined> {
  const observation = await observationRepository.findById(observationId);

  if (!observation) {
    sendNotFoundErrorResponse(reply, "OBSERVATION_NOT_FOUND");

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      observation.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return observation;
}

export function sendObservationDomainError(reply: FastifyReply, error: unknown): boolean {
  return sendDomainErrorResponse(reply, error, "OBSERVATION_DOMAIN_ERROR");
}
