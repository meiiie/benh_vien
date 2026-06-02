import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  Observation,
  ObservationRepository,
  ObservationSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

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
    reply.status(404).send({
      error: "OBSERVATION_NOT_FOUND"
    });

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
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: "OBSERVATION_DOMAIN_ERROR",
    message: error.message
  });

  return true;
}
