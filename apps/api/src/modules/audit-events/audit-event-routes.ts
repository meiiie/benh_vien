import type { FastifyInstance } from "fastify";
import { PatientAuditEventsParamsSchema } from "@benh-vien-so/contracts";
import type {
  AuditEvent,
  AuditEventRepository,
  AuditEventSnapshot,
  PatientRepository
} from "@benh-vien-so/domain";
import { recordAuditEvent } from "./audit-context.js";

export async function registerAuditEventRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/audit-events", async (request, reply) => {
    const params = PatientAuditEventsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
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

function toAuditEventResponse(event: AuditEvent): AuditEventSnapshot {
  return event.toSnapshot();
}
