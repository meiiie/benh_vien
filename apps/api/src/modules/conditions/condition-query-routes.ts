import type { FastifyInstance } from "fastify";
import {
  ConditionIdParamsSchema,
  PatientConditionsParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  ConditionRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadConditionForPatientAccess,
  toConditionResponse
} from "./condition-route-helpers.js";

export async function registerConditionQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  conditionRepository: ConditionRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/conditions", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:list");

    if (!actor) {
      return;
    }

    const params = PatientConditionsParamsSchema.parse(request.params);
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

  app.get("/conditions/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:read");

    if (!actor) {
      return;
    }

    const params = ConditionIdParamsSchema.parse(request.params);
    const condition = await loadConditionForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      conditionRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!condition) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "condition.read",
      resourceType: "Condition",
      resourceId: condition.id,
      patientId: condition.patientId
    });

    return toConditionResponse(condition);
  });
}
