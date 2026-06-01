import type { FastifyInstance } from "fastify";
import {
  MergePatientRequestSchema,
  PatientIdParamsSchema
} from "@benh-vien-so/contracts";
import { DomainError } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccess,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { toPatientResponse } from "./patient-route-helpers.js";

export async function registerPatientMergeRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:id/merge", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:merge");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const parsed = MergePatientRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const sourcePatient = await repository.findById(params.id);

    if (!sourcePatient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND",
        requestId: request.id
      });
    }

    const targetPatient = await repository.findById(parsed.data.targetPatientId);

    if (!targetPatient) {
      return reply.status(404).send({
        error: "TARGET_PATIENT_NOT_FOUND",
        requestId: request.id
      });
    }

    if (
      !(await requirePatientRecordAccess(
        request,
        reply,
        actor,
        sourcePatient,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    if (
      !(await requirePatientRecordAccess(
        request,
        reply,
        actor,
        targetPatient,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    try {
      sourcePatient.markMerged({
        targetPatientId: targetPatient.id,
        mergedByActorId: actor.actorId,
        reason: parsed.data.reason
      });

      await repository.save(sourcePatient);
      await recordAuditEvent(auditRepository, request, {
        action: "patient.merge",
        resourceType: "Patient",
        resourceId: sourcePatient.id,
        patientId: sourcePatient.id,
        metadata: {
          targetPatientId: targetPatient.id,
          mergeReason: parsed.data.reason
        }
      });

      return toPatientResponse(sourcePatient);
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
}
