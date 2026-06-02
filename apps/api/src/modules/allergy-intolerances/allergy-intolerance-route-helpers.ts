import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  AllergyIntolerance,
  AllergyIntoleranceRepository,
  AllergyIntoleranceSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";

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
    sendNotFoundErrorResponse(reply, "ALLERGY_INTOLERANCE_NOT_FOUND");

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

export function sendAllergyIntoleranceDomainError(
  reply: FastifyReply,
  error: unknown
): boolean {
  return sendDomainErrorResponse(reply, error, "ALLERGY_INTOLERANCE_DOMAIN_ERROR");
}
