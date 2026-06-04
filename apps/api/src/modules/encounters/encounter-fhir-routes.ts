import type { FastifyInstance } from "fastify";
import { EncounterIdParamsSchema } from "@benh-vien-so/contracts";
import { mapEncounterToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadEncounterForPatientAccess } from "./encounter-route-helpers.js";

export async function registerEncounterFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/encounters/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:fhir-export");

    if (!actor) {
      return;
    }

    const params = EncounterIdParamsSchema.parse(request.params);
    const encounter = await loadEncounterForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      encounterRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!encounter) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "encounter.fhir-export",
      resourceType: "Encounter",
      resourceId: encounter.id,
      patientId: encounter.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Encounter"
      }
    });

    return mapEncounterToFhir(encounter);
  });
}
