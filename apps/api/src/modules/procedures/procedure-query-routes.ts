import type { FastifyInstance } from "fastify";
import {
  PatientProceduresParamsSchema,
  ProcedureIdParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProcedureRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";
import { toProcedureResponse } from "./procedure-route-helpers.js";

export async function registerProcedureQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  procedureRepository: ProcedureRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/procedures", async (request, reply) => {
    const actor = requirePermission(request, reply, "procedure:list");

    if (!actor) {
      return;
    }

    const params = PatientProceduresParamsSchema.parse(request.params);
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

    const procedures = await procedureRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "procedure.list",
      resourceType: "Procedure",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: procedures.length
      }
    });

    return {
      items: procedures.map(toProcedureResponse)
    };
  });

  app.get("/procedures/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "procedure:read");

    if (!actor) {
      return;
    }

    const params = ProcedureIdParamsSchema.parse(request.params);
    const procedure = await procedureRepository.findById(params.id);

    if (!procedure) {
      return sendNotFoundErrorResponse(reply, "PROCEDURE_NOT_FOUND");
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        procedure.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "procedure.read",
      resourceType: "Procedure",
      resourceId: procedure.id,
      patientId: procedure.patientId
    });

    return toProcedureResponse(procedure);
  });
}
