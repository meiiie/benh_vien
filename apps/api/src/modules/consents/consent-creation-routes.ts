import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateConsentRequestSchema,
  PatientConsentsParamsSchema
} from "@benh-vien-so/contracts";
import { Consent } from "@benh-vien-so/domain";
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
import { sendConsentDomainError, toConsentResponse } from "./consent-route-helpers.js";

export async function registerConsentCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/consents", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:create");

    if (!actor) {
      return;
    }

    const params = PatientConsentsParamsSchema.parse(request.params);
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

    const parsed = CreateConsentRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    try {
      const consent = Consent.grant({
        id: `consent-${nanoid(10)}`,
        patientId: params.patientId,
        grantorActorId: actor.actorId,
        ...parsed.data
      });

      await consentRepository.save(consent);
      const snapshot = consent.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "consent.create",
        resourceType: "Consent",
        resourceId: consent.id,
        patientId: consent.patientId,
        metadata: {
          category: snapshot.category,
          granteeOrganizationId: snapshot.granteeOrganizationId,
          evidenceDocumentId: snapshot.evidenceDocumentId
        }
      });

      return reply.status(201).send(toConsentResponse(consent));
    } catch (error) {
      if (sendConsentDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
