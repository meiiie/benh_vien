import type { FastifyInstance } from "fastify";
import { ProcedureIdParamsSchema } from "@benh-vien-so/contracts";
import { mapProcedureToFhir } from "@benh-vien-so/domain";
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

export async function registerProcedureFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  procedureRepository: ProcedureRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/procedures/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "procedure:fhir-export");

    if (!actor) {
      return;
    }

    const params = ProcedureIdParamsSchema.parse(request.params);
    const procedure = await procedureRepository.findById(params.id);

    if (!procedure) {
      return reply.status(404).send({
        error: "PROCEDURE_NOT_FOUND"
      });
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
      action: "procedure.fhir-export",
      resourceType: "Procedure",
      resourceId: procedure.id,
      patientId: procedure.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Procedure"
      }
    });

    return mapProcedureToFhir(procedure);
  });
}
