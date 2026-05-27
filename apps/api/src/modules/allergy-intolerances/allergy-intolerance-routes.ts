import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  AllergyIntoleranceIdParamsSchema,
  CreateAllergyIntoleranceRequestSchema,
  PatientAllergyIntolerancesParamsSchema
} from "@benh-vien-so/contracts";
import {
  AllergyIntolerance,
  DomainError,
  mapAllergyIntoleranceToFhir
} from "@benh-vien-so/domain";
import type {
  AllergyIntoleranceRepository,
  AllergyIntoleranceSnapshot,
  AuditEventRepository,
  EncounterRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerAllergyIntoleranceRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/allergy-intolerances", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:list");

    if (!actor) {
      return;
    }

    const params = PatientAllergyIntolerancesParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({ error: "PATIENT_NOT_FOUND" });
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

  app.post("/patients/:patientId/allergy-intolerances", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:create");

    if (!actor) {
      return;
    }

    const params = PatientAllergyIntolerancesParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({ error: "PATIENT_NOT_FOUND" });
    }

    const parsed = CreateAllergyIntoleranceRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_ALLERGY_INTOLERANCE_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Dị ứng phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    try {
      const allergyIntolerance = AllergyIntolerance.record({
        id: `allergy-intolerance-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await allergyIntoleranceRepository.save(allergyIntolerance);
      await recordAuditEvent(auditRepository, request, {
        action: "allergy-intolerance.create",
        resourceType: "AllergyIntolerance",
        resourceId: allergyIntolerance.id,
        patientId: allergyIntolerance.patientId,
        metadata: {
          category: allergyIntolerance.toSnapshot().category,
          code: allergyIntolerance.toSnapshot().code
        }
      });

      return reply.status(201).send(toAllergyIntoleranceResponse(allergyIntolerance));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "ALLERGY_INTOLERANCE_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/allergy-intolerances/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:read");

    if (!actor) {
      return;
    }

    const params = AllergyIntoleranceIdParamsSchema.parse(request.params);
    const allergyIntolerance = await allergyIntoleranceRepository.findById(params.id);

    if (!allergyIntolerance) {
      return reply.status(404).send({ error: "ALLERGY_INTOLERANCE_NOT_FOUND" });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "allergy-intolerance.read",
      resourceType: "AllergyIntolerance",
      resourceId: allergyIntolerance.id,
      patientId: allergyIntolerance.patientId
    });

    return toAllergyIntoleranceResponse(allergyIntolerance);
  });

  app.get("/allergy-intolerances/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "allergy-intolerance:fhir-export");

    if (!actor) {
      return;
    }

    const params = AllergyIntoleranceIdParamsSchema.parse(request.params);
    const allergyIntolerance = await allergyIntoleranceRepository.findById(params.id);

    if (!allergyIntolerance) {
      return reply.status(404).send({ error: "ALLERGY_INTOLERANCE_NOT_FOUND" });
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

function toAllergyIntoleranceResponse(
  allergyIntolerance: AllergyIntolerance
): AllergyIntoleranceSnapshot {
  return allergyIntolerance.toSnapshot();
}
