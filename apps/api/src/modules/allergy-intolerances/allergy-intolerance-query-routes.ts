import type { FastifyInstance } from "fastify";
import {
  AllergyIntoleranceIdParamsSchema,
  PatientAllergyIntolerancesParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AllergyIntoleranceRepository,
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadAllergyIntoleranceForPatientAccess,
  toAllergyIntoleranceResponse
} from "./allergy-intolerance-route-helpers.js";

export async function registerAllergyIntoleranceQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/allergy-intolerances", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:list");

    if (!actor) {
      return;
    }

    const params = PatientAllergyIntolerancesParamsSchema.parse(request.params);
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

    const allergyIntolerances = await allergyIntoleranceRepository.findByPatientId(
      params.patientId
    );
    await recordAuditEvent(auditRepository, request, {
      action: "allergy-intolerance.list",
      resourceType: "AllergyIntolerance",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: allergyIntolerances.length
      }
    });

    return {
      items: allergyIntolerances.map(toAllergyIntoleranceResponse)
    };
  });

  app.get("/allergy-intolerances/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:read");

    if (!actor) {
      return;
    }

    const params = AllergyIntoleranceIdParamsSchema.parse(request.params);
    const allergyIntolerance = await loadAllergyIntoleranceForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      allergyIntoleranceRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!allergyIntolerance) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "allergy-intolerance.read",
      resourceType: "AllergyIntolerance",
      resourceId: allergyIntolerance.id,
      patientId: allergyIntolerance.patientId
    });

    return toAllergyIntoleranceResponse(allergyIntolerance);
  });
}
