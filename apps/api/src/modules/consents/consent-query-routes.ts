import type { FastifyInstance } from "fastify";
import { PatientConsentsParamsSchema } from "@benh-vien-so/contracts";
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
import { toConsentResponse } from "./consent-route-helpers.js";

export async function registerConsentQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/consents", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:list");

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
}
