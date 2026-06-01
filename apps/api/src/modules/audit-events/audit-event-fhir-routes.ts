import type { FastifyInstance } from "fastify";
import { PatientAuditEventsParamsSchema } from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { mapAuditEventsToFhirBundle } from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "./audit-context.js";
import { requireAuditPatientRecordAccess } from "./audit-event-route-helpers.js";

export async function registerAuditEventFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/audit-events/fhir-bundle", async (request, reply) => {
    const actor = requirePermission(request, reply, "audit-event:fhir-export");

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
      action: "audit-event.fhir-export",
      resourceType: "AuditEvent",
      resourceId: params.patientId,
      patientId: params.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "AuditEvent",
        format: "Bundle.collection"
      }
    });

    const events = await auditRepository.findByPatientId(params.patientId);
    return mapAuditEventsToFhirBundle(params.patientId, events);
  });
}
