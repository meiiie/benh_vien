import type { FastifyInstance } from "fastify";
import {
  EncounterIdParamsSchema,
  PatientEncountersParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadEncounterForPatientAccess,
  toEncounterResponse
} from "./encounter-route-helpers.js";

export async function registerEncounterQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/encounters", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:list");

    if (!actor) {
      return;
    }

    const params = PatientEncountersParamsSchema.parse(request.params);
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

    const encounters = await encounterRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "encounter.list",
      resourceType: "Encounter",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: encounters.length
      }
    });

    return {
      items: encounters.map(toEncounterResponse)
    };
  });

  app.get("/encounters/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:read");

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
      action: "encounter.read",
      resourceType: "Encounter",
      resourceId: encounter.id,
      patientId: encounter.patientId
    });

    return toEncounterResponse(encounter);
  });
}
