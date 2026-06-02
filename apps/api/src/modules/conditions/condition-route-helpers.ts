import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  Condition,
  ConditionRepository,
  ConditionSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

export function toConditionResponse(condition: Condition): ConditionSnapshot {
  return condition.toSnapshot();
}

export async function loadConditionForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  conditionId: string,
  conditionRepository: ConditionRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<Condition | undefined> {
  const condition = await conditionRepository.findById(conditionId);

  if (!condition) {
    reply.status(404).send({
      error: "CONDITION_NOT_FOUND"
    });

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      condition.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return condition;
}

export function sendConditionDomainError(reply: FastifyReply, error: unknown): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: "CONDITION_DOMAIN_ERROR",
    message: error.message
  });

  return true;
}
