import type { FastifyInstance } from "fastify";
import { ConditionIdParamsSchema } from "@benh-vien-so/contracts";
import { mapConditionToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadConditionForPatientAccess } from "./condition-route-helpers.js";

export async function registerConditionFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  conditionRepository: ConditionRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/conditions/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "condition:fhir-export");

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
