import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateEncounterRequestSchema,
  PatientEncountersParamsSchema
} from "@benh-vien-so/contracts";
import { Encounter } from "@benh-vien-so/domain";
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
import { sendEncounterDomainError, toEncounterResponse } from "./encounter-route-helpers.js";

export async function registerEncounterCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/encounters", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:create");

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

    const parsed = CreateEncounterRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    try {
      const encounter = Encounter.create({
        id: `encounter-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await encounterRepository.save(encounter);
      await recordAuditEvent(auditRepository, request, {
        action: "encounter.create",
        resourceType: "Encounter",
        resourceId: encounter.id,
        patientId: encounter.patientId,
        metadata: {
          class: encounter.toSnapshot().class,
          status: encounter.status
        }
      });

      return reply.status(201).send(toEncounterResponse(encounter));
    } catch (error) {
      if (sendEncounterDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
