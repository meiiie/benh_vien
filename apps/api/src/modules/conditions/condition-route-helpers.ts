import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  Condition,
  ConditionRepository,
  ConditionSnapshot,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

export type ConditionReferenceInput = {
  readonly encounterId?: string;
};

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

export async function validateConditionReferences(
  reply: FastifyReply,
  patientId: string,
  input: ConditionReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
  }
): Promise<boolean> {
  if (!input.encounterId) {
    return true;
  }

  const encounter = await repositories.encounterRepository.findById(input.encounterId);

  if (!encounter || encounter.patientId !== patientId) {
    reply.status(422).send({
      error: "ENCOUNTER_MISMATCH",
      message: "Chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
    });

    return false;
  }

  return true;
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
