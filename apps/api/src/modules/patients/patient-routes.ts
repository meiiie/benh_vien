import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreatePatientRequestSchema,
  PatientIdParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  Patient,
  mapPatientToFhir
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  PatientSnapshot
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerPatientRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:list");

    if (!actor) {
      return;
    }

    const patients = await repository.findAll();
    await recordAuditEvent(auditRepository, request, {
      action: "patient.list",
      resourceType: "Patient",
      resourceId: "collection",
      metadata: {
        returnedCount: patients.length
      }
    });

    return {
      items: patients.map(toPatientResponse)
    };
  });

  app.post("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:create");

    if (!actor) {
      return;
    }

    const parsed = CreatePatientRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_PATIENT_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    try {
      const patient = Patient.register({
        id: `patient-${nanoid(10)}`,
        ...parsed.data
      });

      await repository.save(patient);
      await recordAuditEvent(auditRepository, request, {
        action: "patient.create",
        resourceType: "Patient",
        resourceId: patient.id,
        patientId: patient.id,
        metadata: {
          managingOrganizationId: patient.toSnapshot().managingOrganizationId
        }
      });

      return reply.status(201).send(toPatientResponse(patient));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "PATIENT_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/patients/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:read");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const patient = await repository.findById(params.id);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "patient.read",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id
    });

    return toPatientResponse(patient);
  });

  app.get("/patients/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:fhir-export");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const patient = await repository.findById(params.id);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "patient.fhir-export",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Patient"
      }
    });

    return mapPatientToFhir(patient);
  });
}

function toPatientResponse(patient: Patient): PatientSnapshot {
  return patient.toSnapshot();
}
