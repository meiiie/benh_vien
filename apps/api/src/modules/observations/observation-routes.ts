import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateObservationRequestSchema,
  ObservationIdParamsSchema,
  PatientObservationsParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  Observation,
  mapObservationToFhir
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  ObservationRepository,
  ObservationSnapshot,
  PatientRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerObservationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  observationRepository: ObservationRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/observations", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:list");

    if (!actor) {
      return;
    }

    const params = PatientObservationsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
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

  app.post("/patients/:patientId/observations", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:create");

    if (!actor) {
      return;
    }

    const params = PatientObservationsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateObservationRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_OBSERVATION_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Observation phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    try {
      const observation = Observation.record({
        id: `observation-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await observationRepository.save(observation);
      await recordAuditEvent(auditRepository, request, {
        action: "observation.create",
        resourceType: "Observation",
        resourceId: observation.id,
        patientId: observation.patientId,
        metadata: {
          category: observation.toSnapshot().category,
          code: observation.toSnapshot().code
        }
      });

      return reply.status(201).send(toObservationResponse(observation));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "OBSERVATION_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/observations/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:read");

    if (!actor) {
      return;
    }

    const params = ObservationIdParamsSchema.parse(request.params);
    const observation = await observationRepository.findById(params.id);

    if (!observation) {
      return reply.status(404).send({
        error: "OBSERVATION_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "observation.read",
      resourceType: "Observation",
      resourceId: observation.id,
      patientId: observation.patientId
    });

    return toObservationResponse(observation);
  });

  app.get("/observations/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "observation:fhir-export");

    if (!actor) {
      return;
    }

    const params = ObservationIdParamsSchema.parse(request.params);
    const observation = await observationRepository.findById(params.id);

    if (!observation) {
      return reply.status(404).send({
        error: "OBSERVATION_NOT_FOUND"
      });
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

function toObservationResponse(observation: Observation): ObservationSnapshot {
  return observation.toSnapshot();
}
