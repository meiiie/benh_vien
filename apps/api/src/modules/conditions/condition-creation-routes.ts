import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateConditionRequestSchema,
  PatientConditionsParamsSchema
} from "@benh-vien-so/contracts";
import { Condition } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
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
  sendConditionDomainError,
  toConditionResponse,
  validateConditionReferences
} from "./condition-route-helpers.js";

export async function registerConditionCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/conditions", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:create");

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

    const parsed = CreateConditionRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    if (
      !(await validateConditionReferences(reply, params.patientId, parsed.data, {
        encounterRepository
      }))
    ) {
      return;
    }

    try {
      const condition = Condition.record({
        id: `condition-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await conditionRepository.save(condition);
      const snapshot = condition.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "condition.create",
        resourceType: "Condition",
        resourceId: condition.id,
        patientId: condition.patientId,
        metadata: {
          category: snapshot.category,
          code: snapshot.code
        }
      });

      return reply.status(201).send(toConditionResponse(condition));
    } catch (error) {
      if (sendConditionDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
