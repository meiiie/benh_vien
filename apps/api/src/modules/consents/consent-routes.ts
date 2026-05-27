import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateConsentRequestSchema,
  PatientConsentsParamsSchema
} from "@benh-vien-so/contracts";
import { Consent, DomainError } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConsentRepository,
  ConsentSnapshot,
  PatientRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerConsentRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/consents", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:list");

    if (!actor) {
      return;
    }

    const params = PatientConsentsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const consents = await consentRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "consent.list",
      resourceType: "Consent",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: consents.length
      }
    });

    return {
      items: consents.map(toConsentResponse)
    };
  });

  app.post("/patients/:patientId/consents", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:create");

    if (!actor) {
      return;
    }

    const params = PatientConsentsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateConsentRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_CONSENT_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    try {
      const consent = Consent.grant({
        id: `consent-${nanoid(10)}`,
        patientId: params.patientId,
        grantorActorId: actor.actorId,
        ...parsed.data
      });

      await consentRepository.save(consent);
      await recordAuditEvent(auditRepository, request, {
        action: "consent.create",
        resourceType: "Consent",
        resourceId: consent.id,
        patientId: consent.patientId,
        metadata: {
          category: consent.toSnapshot().category,
          granteeOrganizationId: consent.toSnapshot().granteeOrganizationId,
          evidenceDocumentId: consent.toSnapshot().evidenceDocumentId
        }
      });

      return reply.status(201).send(toConsentResponse(consent));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "CONSENT_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });
}

function toConsentResponse(consent: Consent): ConsentSnapshot {
  return consent.toSnapshot();
}
