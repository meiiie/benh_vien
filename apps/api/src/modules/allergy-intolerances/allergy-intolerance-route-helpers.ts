import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  AllergyIntolerance,
  AllergyIntoleranceRepository,
  AllergyIntoleranceSnapshot,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

export type AllergyIntoleranceReferenceInput = {
  readonly encounterId?: string;
};

export function toAllergyIntoleranceResponse(
  allergyIntolerance: AllergyIntolerance
): AllergyIntoleranceSnapshot {
  return allergyIntolerance.toSnapshot();
}

export async function loadAllergyIntoleranceForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  allergyIntoleranceId: string,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<AllergyIntolerance | undefined> {
  const allergyIntolerance = await allergyIntoleranceRepository.findById(
    allergyIntoleranceId
  );

  if (!allergyIntolerance) {
    reply.status(404).send({
      error: "ALLERGY_INTOLERANCE_NOT_FOUND"
    });

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      allergyIntolerance.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return allergyIntolerance;
}

export async function validateAllergyIntoleranceReferences(
  reply: FastifyReply,
  patientId: string,
  input: AllergyIntoleranceReferenceInput,
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
      message: "Dị ứng phải gắn với lượt khám thuộc cùng bệnh nhân."
    });

    return false;
  }

  return true;
}

export function sendAllergyIntoleranceDomainError(
  reply: FastifyReply,
  error: unknown
): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: "ALLERGY_INTOLERANCE_DOMAIN_ERROR",
    message: error.message
  });

  return true;
}
