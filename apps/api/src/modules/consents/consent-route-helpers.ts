import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  Consent,
  ConsentRepository,
  ConsentSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";

export function toConsentResponse(consent: Consent): ConsentSnapshot {
  return consent.toSnapshot();
}

export async function loadPatientConsentForRevoke(
  reply: FastifyReply,
  patientId: string,
  consentId: string,
  consentRepository: ConsentRepository
): Promise<Consent | undefined> {
  const consent = await consentRepository.findById(consentId);

  if (!consent || consent.patientId !== patientId) {
    sendNotFoundErrorResponse(reply, "CONSENT_NOT_FOUND");

    return undefined;
  }

  return consent;
}

export async function loadConsentForFhirExport(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  consentId: string,
  consentRepository: ConsentRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<Consent | undefined> {
  const consent = await consentRepository.findById(consentId);

  if (!consent) {
    sendFhirOperationOutcome(reply, {
      statusCode: 404,
      code: "not-found",
      diagnostics: `Consent/${consentId} không tồn tại để xuất FHIR Consent.`,
      expression: ["Consent.id"],
      details: {
        code: "CONSENT_NOT_FOUND",
        display: "Consent not found",
        text: "Không tìm thấy consent cần xuất FHIR."
      }
    });

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      consent.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return consent;
}

export function sendConsentDomainError(reply: FastifyReply, error: unknown): boolean {
  return sendDomainErrorResponse(reply, error, "CONSENT_DOMAIN_ERROR");
}
