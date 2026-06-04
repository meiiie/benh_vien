import type { FastifyInstance } from "fastify";
import {
  PatientConsentParamsSchema,
  RevokeConsentRequestSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadPatientConsentForRevoke,
  sendConsentDomainError,
  toConsentResponse
} from "./consent-route-helpers.js";

export async function registerConsentCommandRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/consents/:consentId/revoke", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:revoke");

    if (!actor) {
      return;
    }

    const params = PatientConsentParamsSchema.parse(request.params);
    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        params.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    const consent = await loadPatientConsentForRevoke(
      reply,
      params.patientId,
      params.consentId,
      consentRepository
    );

    if (!consent) {
      return;
    }

    const parsed = RevokeConsentRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      throw parsed.error;
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
      if (sendConsentDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
