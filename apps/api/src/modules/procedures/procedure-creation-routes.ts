import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateProcedureRequestSchema,
  PatientProceduresParamsSchema
} from "@benh-vien-so/contracts";
import { DomainError, Procedure } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  ConditionRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  PatientRepository,
  ProcedureRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  toProcedureResponse,
  validateProcedureReferences
} from "./procedure-route-helpers.js";

export async function registerProcedureCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  clinicalDocumentRepository: ClinicalDocumentRepository,
  procedureRepository: ProcedureRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/procedures", async (request, reply) => {
    const actor = requirePermission(request, reply, "procedure:create");

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

    const parsed = CreateProcedureRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateProcedureReferences({
      patientId: params.patientId,
      command: parsed.data,
      encounterRepository,
      serviceRequestRepository,
      procedureRepository,
      conditionRepository,
      diagnosticReportRepository,
      clinicalDocumentRepository
    });

    if (validationError) {
      return reply.status(422).send(validationError);
    }

    try {
      const procedure = Procedure.record({
        id: `procedure-${nanoid(10)}`,
        patientId: params.patientId,
        performers: [],
        reportReferences: [],
        ...parsed.data
      });

      await procedureRepository.save(procedure);
      await recordAuditEvent(auditRepository, request, {
        action: "procedure.create",
        resourceType: "Procedure",
        resourceId: procedure.id,
        patientId: procedure.patientId,
        metadata: {
          status: procedure.toSnapshot().status,
          category: procedure.toSnapshot().category,
          code: procedure.toSnapshot().code,
          basedOnServiceRequestId: procedure.toSnapshot().basedOnServiceRequestId,
          reportReferenceCount: procedure.toSnapshot().reportReferences.length
        }
      });

      return reply.status(201).send(toProcedureResponse(procedure));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "PROCEDURE_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });
}
