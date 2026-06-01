import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateAllergyIntoleranceRequestSchema,
  PatientAllergyIntolerancesParamsSchema
} from "@benh-vien-so/contracts";
import { AllergyIntolerance } from "@benh-vien-so/domain";
import type {
  AllergyIntoleranceRepository,
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
import {
  sendAllergyIntoleranceDomainError,
  toAllergyIntoleranceResponse,
  validateAllergyIntoleranceReferences
} from "./allergy-intolerance-route-helpers.js";

export async function registerAllergyIntoleranceCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/allergy-intolerances", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:create");

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

    const parsed = CreateAllergyIntoleranceRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    if (
      !(await validateAllergyIntoleranceReferences(reply, params.patientId, parsed.data, {
        encounterRepository
      }))
    ) {
      return;
    }

    try {
      const allergyIntolerance = AllergyIntolerance.record({
        id: `allergy-intolerance-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await allergyIntoleranceRepository.save(allergyIntolerance);
      const snapshot = allergyIntolerance.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "allergy-intolerance.create",
        resourceType: "AllergyIntolerance",
        resourceId: allergyIntolerance.id,
        patientId: allergyIntolerance.patientId,
        metadata: {
          category: snapshot.category,
          code: snapshot.code
        }
      });

      return reply.status(201).send(toAllergyIntoleranceResponse(allergyIntolerance));
    } catch (error) {
      if (sendAllergyIntoleranceDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
