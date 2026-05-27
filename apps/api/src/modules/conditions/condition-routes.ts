import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  ConditionIdParamsSchema,
  CreateConditionRequestSchema,
  PatientConditionsParamsSchema
} from "@benh-vien-so/contracts";
import {
  Condition,
  DomainError,
  mapConditionToFhir
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  ConditionSnapshot,
  EncounterRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerConditionRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/conditions", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:list");

    if (!actor) {
      return;
    }

    const params = PatientConditionsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const conditions = await conditionRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "condition.list",
      resourceType: "Condition",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: conditions.length
      }
    });

    return {
      items: conditions.map(toConditionResponse)
    };
  });

  app.post("/patients/:patientId/conditions", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:create");

    if (!actor) {
      return;
    }

    const params = PatientConditionsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateConditionRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_CONDITION_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    try {
      const condition = Condition.record({
        id: `condition-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await conditionRepository.save(condition);
      await recordAuditEvent(auditRepository, request, {
        action: "condition.create",
        resourceType: "Condition",
        resourceId: condition.id,
        patientId: condition.patientId,
        metadata: {
          category: condition.toSnapshot().category,
          code: condition.toSnapshot().code
        }
      });

      return reply.status(201).send(toConditionResponse(condition));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "CONDITION_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/conditions/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:read");

    if (!actor) {
      return;
    }

    const params = ConditionIdParamsSchema.parse(request.params);
    const condition = await conditionRepository.findById(params.id);

    if (!condition) {
      return reply.status(404).send({
        error: "CONDITION_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "condition.read",
      resourceType: "Condition",
      resourceId: condition.id,
      patientId: condition.patientId
    });

    return toConditionResponse(condition);
  });

  app.get("/conditions/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:fhir-export");

    if (!actor) {
      return;
    }

    const params = ConditionIdParamsSchema.parse(request.params);
    const condition = await conditionRepository.findById(params.id);

    if (!condition) {
      return reply.status(404).send({
        error: "CONDITION_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "condition.fhir-export",
      resourceType: "Condition",
      resourceId: condition.id,
      patientId: condition.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Condition"
      }
    });

    return mapConditionToFhir(condition);
  });
}

function toConditionResponse(condition: Condition): ConditionSnapshot {
  return condition.toSnapshot();
}
