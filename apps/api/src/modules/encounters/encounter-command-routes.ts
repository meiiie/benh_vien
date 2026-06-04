import type { FastifyInstance } from "fastify";
import { EncounterIdParamsSchema } from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadEncounterForPatientAccess,
  sendEncounterDomainError,
  toEncounterResponse
} from "./encounter-route-helpers.js";

export async function registerEncounterCommandRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/encounters/:id/finish", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:finish");

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

    try {
      encounter.finish();
      await encounterRepository.save(encounter);
      await recordAuditEvent(auditRepository, request, {
        action: "encounter.finish",
        resourceType: "Encounter",
        resourceId: encounter.id,
        patientId: encounter.patientId,
        metadata: {
          status: encounter.status
        }
      });

      return toEncounterResponse(encounter);
    } catch (error) {
      if (sendEncounterDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
