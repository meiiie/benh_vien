import type { FastifyInstance } from "fastify";
import {
  ObservationIdParamsSchema,
  PatientObservationsParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
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
  loadObservationForPatientAccess,
  toObservationResponse
} from "./observation-route-helpers.js";

export async function registerObservationQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  observationRepository: ObservationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/observations", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:list");

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

    const observations = await observationRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "observation.list",
      resourceType: "Observation",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: observations.length
      }
    });

    return {
      items: observations.map(toObservationResponse)
    };
  });

  app.get("/observations/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:read");

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
      action: "observation.read",
      resourceType: "Observation",
      resourceId: observation.id,
      patientId: observation.patientId
    });

    return toObservationResponse(observation);
  });
}
