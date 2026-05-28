import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  ConsentIdParamsSchema,
  CreateConsentRequestSchema,
  PatientConsentParamsSchema,
  PatientConsentsParamsSchema,
  RevokeConsentRequestSchema
} from "@benh-vien-so/contracts";
import { Consent, DomainError, mapConsentToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConsentRepository,
  ConsentSnapshot,
  PatientRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

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

  app.post("/patients/:patientId/consents/:consentId/revoke", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:revoke");

    if (!actor) {
      return;
    }

    const params = PatientConsentParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const consent = await consentRepository.findById(params.consentId);

    if (!consent || consent.patientId !== params.patientId) {
      return reply.status(404).send({
        error: "CONSENT_NOT_FOUND"
      });
    }

    const parsed = RevokeConsentRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_CONSENT_REVOKE_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    try {
      consent.revoke({
        revokedByActorId: actor.actorId,
        reason: parsed.data.reason
      });

      await consentRepository.save(consent);
      const revokedSnapshot = consent.toSnapshot();

      await recordAuditEvent(auditRepository, request, {
        action: "consent.revoke",
        resourceType: "Consent",
        resourceId: consent.id,
        patientId: consent.patientId,
        metadata: {
          granteeOrganizationId: revokedSnapshot.granteeOrganizationId,
          revokedAt: revokedSnapshot.revokedAt,
          revocationReason: revokedSnapshot.revocationReason
        }
      });

      return toConsentResponse(consent);
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

  app.get("/consents/:consentId/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:fhir-export");

    if (!actor) {
      return;
    }

    const params = ConsentIdParamsSchema.parse(request.params);
    const consent = await consentRepository.findById(params.consentId);

    if (!consent) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 404,
        code: "not-found",
        diagnostics: `Consent/${params.consentId} không tồn tại để xuất FHIR Consent.`,
        expression: ["Consent.id"],
        details: {
          code: "CONSENT_NOT_FOUND",
          display: "Consent not found",
          text: "Không tìm thấy consent cần xuất FHIR."
        }
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "consent.fhir-export",
      resourceType: "Consent",
      resourceId: consent.id,
      patientId: consent.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Consent",
        status: consent.status
      }
    });

    return mapConsentToFhir(consent);
  });
}

function toConsentResponse(consent: Consent): ConsentSnapshot {
  return consent.toSnapshot();
}
