import type { FastifyInstance } from "fastify";
import {
  AuditEventsQuerySchema,
  PatientAuditEventsParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "./audit-context.js";
import {
  requireAuditPatientRecordAccess,
  toAuditEventResponse
} from "./audit-event-route-helpers.js";

export async function registerAuditEventQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/audit-events", async (request, reply) => {
    const actor = requirePermission(request, reply, "audit-event:list");

    if (!actor) {
      return;
    }

    const query = AuditEventsQuerySchema.parse(request.query);
    const events = await auditRepository.findRecent(query.limit);

    await recordAuditEvent(auditRepository, request, {
      action: "audit-event.list",
      resourceType: "AuditEvent",
      resourceId: "collection",
      metadata: {
        scope: "global",
        limit: query.limit,
        returnedCount: events.length
      }
    });

    return {
      items: events.map(toAuditEventResponse)
    };
  });

  app.get("/patients/:patientId/audit-events", async (request, reply) => {
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

    const events = await auditRepository.findByPatientId(params.patientId);

    await recordAuditEvent(auditRepository, request, {
      action: "audit-event.list",
      resourceType: "AuditEvent",
      resourceId: params.patientId,
      patientId: params.patientId,
      metadata: {
        returnedCount: events.length
      }
    });

    return {
      items: events.map(toAuditEventResponse)
    };
  });
}
