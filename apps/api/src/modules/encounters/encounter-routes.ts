import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateEncounterRequestSchema,
  EncounterIdParamsSchema,
  PatientEncountersParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  Encounter,
  mapEncounterToFhir
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  EncounterSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerEncounterRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/encounters", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:list");

    if (!actor) {
      return;
    }

    const params = PatientEncountersParamsSchema.parse(request.params);
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

    const encounters = await encounterRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "encounter.list",
      resourceType: "Encounter",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: encounters.length
      }
    });

    return {
      items: encounters.map(toEncounterResponse)
    };
  });

  app.post("/patients/:patientId/encounters", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:create");

    if (!actor) {
      return;
    }

    const params = PatientEncountersParamsSchema.parse(request.params);
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

    const parsed = CreateEncounterRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    try {
      const encounter = Encounter.create({
        id: `encounter-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await encounterRepository.save(encounter);
      await recordAuditEvent(auditRepository, request, {
        action: "encounter.create",
        resourceType: "Encounter",
        resourceId: encounter.id,
        patientId: encounter.patientId,
        metadata: {
          class: encounter.toSnapshot().class,
          status: encounter.status
        }
      });

      return reply.status(201).send(toEncounterResponse(encounter));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "ENCOUNTER_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/encounters/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:read");

    if (!actor) {
      return;
    }

    const params = EncounterIdParamsSchema.parse(request.params);
    const encounter = await encounterRepository.findById(params.id);

    if (!encounter) {
      return reply.status(404).send({
        error: "ENCOUNTER_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        encounter.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "encounter.read",
      resourceType: "Encounter",
      resourceId: encounter.id,
      patientId: encounter.patientId
    });

    return toEncounterResponse(encounter);
  });

  app.post("/encounters/:id/finish", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:finish");

    if (!actor) {
      return;
    }

    const params = EncounterIdParamsSchema.parse(request.params);
    const encounter = await encounterRepository.findById(params.id);

    if (!encounter) {
      return reply.status(404).send({
        error: "ENCOUNTER_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        encounter.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    try {
      encounter.finish();
      await encounterRepository.save(encounter);
      await recordAuditEvent(auditRepository, request, {
        action: "encounter.finish",
        resourceType: "Encounter",
        resourceId: encounter.id,
        patientId: encounter.patientId,
        metadata: {
          status: encounter.status
        }
      });

      return toEncounterResponse(encounter);
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "ENCOUNTER_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/encounters/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "encounter:fhir-export");

    if (!actor) {
      return;
    }

    const params = EncounterIdParamsSchema.parse(request.params);
    const encounter = await encounterRepository.findById(params.id);

    if (!encounter) {
      return reply.status(404).send({
        error: "ENCOUNTER_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        encounter.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "encounter.fhir-export",
      resourceType: "Encounter",
      resourceId: encounter.id,
      patientId: encounter.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Encounter"
      }
    });

    return mapEncounterToFhir(encounter);
  });
}

function toEncounterResponse(encounter: Encounter): EncounterSnapshot {
  return encounter.toSnapshot();
}
