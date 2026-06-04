import type { FastifyInstance } from "fastify";
import { ObservationIdParamsSchema } from "@benh-vien-so/contracts";
import { mapObservationToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ObservationRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadObservationForPatientAccess } from "./observation-route-helpers.js";

export async function registerObservationFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  observationRepository: ObservationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/observations/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:fhir-export");

    if (!actor) {
      return;
    }

    const params = ObservationIdParamsSchema.parse(request.params);
    const observation = await loadObservationForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      observationRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!observation) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "observation.fhir-export",
      resourceType: "Observation",
      resourceId: observation.id,
      patientId: observation.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Observation"
      }
    });

    return mapObservationToFhir(observation);
  });
}
