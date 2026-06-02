import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  Encounter,
  EncounterRepository,
  EncounterSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";

export function toEncounterResponse(encounter: Encounter): EncounterSnapshot {
  return encounter.toSnapshot();
}

export async function loadEncounterForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  encounterId: string,
  encounterRepository: EncounterRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<Encounter | undefined> {
  const encounter = await encounterRepository.findById(encounterId);

  if (!encounter) {
    reply.status(404).send({
      error: "ENCOUNTER_NOT_FOUND"
    });

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      encounter.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return encounter;
}

export function sendEncounterDomainError(reply: FastifyReply, error: unknown): boolean {
  return sendDomainErrorResponse(reply, error, "ENCOUNTER_DOMAIN_ERROR");
}
