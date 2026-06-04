import type { FastifyInstance } from "fastify";
import { PatientAuditEventsParamsSchema } from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "./audit-context.js";
import { requireAuditPatientRecordAccess } from "./audit-event-route-helpers.js";

export async function registerAuditEventIntegrityRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/audit-integrity", async (request, reply) => {
    const actor = requirePermission(request, reply, "audit-event:list");

    if (!actor) {
      return;
    }

    const params = PatientAuditEventsParamsSchema.parse(request.params);
    if (
      !(await requireAuditPatientRecordAccess(
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

    await recordAuditEvent(auditRepository, request, {
      action: "audit-event.integrity-verify",
      resourceType: "AuditEvent",
      resourceId: params.patientId,
      patientId: params.patientId,
      metadata: {
        reason: "patient-audit-chain-verification"
      }
    });

    return auditRepository.verifyPatientIntegrity(params.patientId);
  });
}
