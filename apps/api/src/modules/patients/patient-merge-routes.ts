import type { FastifyInstance } from "fastify";
import {
  MergePatientRequestSchema,
  PatientIdParamsSchema
} from "@benh-vien-so/contracts";
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
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendJsonErrorResponse } from "../http/http-json-error-response.js";
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
      return sendJsonErrorResponse(reply, 404, request.id, {
        error: "PATIENT_NOT_FOUND"
      });
    }

    const targetPatient = await repository.findById(parsed.data.targetPatientId);

    if (!targetPatient) {
      return sendJsonErrorResponse(reply, 404, request.id, {
        error: "TARGET_PATIENT_NOT_FOUND"
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
      if (sendDomainErrorResponse(reply, error, "PATIENT_DOMAIN_ERROR")) {
        return;
      }

      throw error;
    }
  });
}
