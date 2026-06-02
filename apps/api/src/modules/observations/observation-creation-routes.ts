import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateObservationRequestSchema,
  PatientObservationsParamsSchema
} from "@benh-vien-so/contracts";
import { Observation } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  ObservationRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  sendObservationDomainError,
  toObservationResponse
} from "./observation-route-helpers.js";
import { validateObservationReferences } from "./observation-reference-validation.js";

export async function registerObservationCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  observationRepository: ObservationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/observations", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:create");

    if (!actor) {
      return;
    }

    const params = PatientObservationsParamsSchema.parse(request.params);
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

    const parsed = CreateObservationRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    if (
      !(await validateObservationReferences(reply, params.patientId, parsed.data, {
        encounterRepository
      }))
    ) {
      return;
    }

    try {
      const observation = Observation.record({
        id: `observation-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await observationRepository.save(observation);
      const snapshot = observation.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "observation.create",
        resourceType: "Observation",
        resourceId: observation.id,
        patientId: observation.patientId,
        metadata: {
          category: snapshot.category,
          code: snapshot.code
        }
      });

      return reply.status(201).send(toObservationResponse(observation));
    } catch (error) {
      if (sendObservationDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
