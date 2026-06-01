import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import { CreatePatientRequestSchema } from "@benh-vien-so/contracts";
import {
  DomainError,
  Patient,
  PatientIdentifierConflictError
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  filterPatientsByAccess,
  requirePatientRecordAccess,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  findPatientIdentifierConflict,
  sendPatientIdentifierConflict,
  toPatientResponse
} from "./patient-route-helpers.js";

export async function registerPatientRegistryRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:list");

    if (!actor) {
      return;
    }

    const patients = await repository.findAll();
    const accessiblePatients = await filterPatientsByAccess(
      actor,
      patients,
      providerDirectoryRepository
    );
    await recordAuditEvent(auditRepository, request, {
      action: "patient.list",
      resourceType: "Patient",
      resourceId: "collection",
      metadata: {
        returnedCount: accessiblePatients.length,
        totalCount: patients.length
      }
    });

    return {
      items: accessiblePatients.map(toPatientResponse)
    };
  });

  app.post("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:create");

    if (!actor) {
      return;
    }

    const parsed = CreatePatientRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    let patient: Patient | undefined;

    try {
      patient = Patient.register({
        id: `patient-${nanoid(10)}`,
        ...parsed.data
      });

      if (
        !(await requirePatientRecordAccess(
          request,
          reply,
          actor,
          patient,
          providerDirectoryRepository
        ))
      ) {
        return;
      }

      const identifierConflict = await findPatientIdentifierConflict(repository, patient);

      if (identifierConflict) {
        return sendPatientIdentifierConflict(
          request,
          reply,
          auditRepository,
          patient,
          identifierConflict
        );
      }

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

      if (error instanceof PatientIdentifierConflictError) {
        if (patient) {
          return sendPatientIdentifierConflict(
            request,
            reply,
            auditRepository,
            patient,
            error.conflict
          );
        }

        return reply.status(409).send({
          error: "PATIENT_IDENTIFIER_CONFLICT",
          message:
            "Định danh bệnh nhân đã thuộc về một hồ sơ khác. Cần đối soát/MPI thay vì tạo hồ sơ mới."
        });
      }

      throw error;
    }
  });
}
