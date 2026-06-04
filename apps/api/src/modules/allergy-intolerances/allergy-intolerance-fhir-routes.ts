import type { FastifyInstance } from "fastify";
import { AllergyIntoleranceIdParamsSchema } from "@benh-vien-so/contracts";
import { mapAllergyIntoleranceToFhir } from "@benh-vien-so/domain";
import type {
  AllergyIntoleranceRepository,
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadAllergyIntoleranceForPatientAccess } from "./allergy-intolerance-route-helpers.js";

export async function registerAllergyIntoleranceFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/allergy-intolerances/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:fhir-export");

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
      action: "allergy-intolerance.fhir-export",
      resourceType: "AllergyIntolerance",
      resourceId: allergyIntolerance.id,
      patientId: allergyIntolerance.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "AllergyIntolerance"
      }
    });

    return mapAllergyIntoleranceToFhir(allergyIntolerance);
  });
}
