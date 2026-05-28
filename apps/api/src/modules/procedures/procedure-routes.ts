import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateProcedureRequestSchema,
  PatientProceduresParamsSchema,
  ProcedureIdParamsSchema
} from "@benh-vien-so/contracts";
import { DomainError, mapProcedureToFhir, Procedure } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  ConditionRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  PatientRepository,
  ProcedureRepository,
  ProcedureSnapshot,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerProcedureRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  clinicalDocumentRepository: ClinicalDocumentRepository,
  procedureRepository: ProcedureRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/procedures", async (request, reply) => {
    const actor = requirePermission(request, reply, "procedure:list");

    if (!actor) {
      return;
    }

    const params = PatientProceduresParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
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

  app.post("/patients/:patientId/procedures", async (request, reply) => {
    const actor = requirePermission(request, reply, "procedure:create");

    if (!actor) {
      return;
    }

    const params = PatientProceduresParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateProcedureRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateProcedureReferences(
      params.patientId,
      parsed.data.encounterId,
      parsed.data.basedOnServiceRequestId,
      parsed.data.partOfProcedureId,
      parsed.data.reasonConditionId,
      parsed.data.reportReferences ?? [],
      encounterRepository,
      serviceRequestRepository,
      procedureRepository,
      conditionRepository,
      diagnosticReportRepository,
      clinicalDocumentRepository
    );

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

  app.get("/procedures/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "procedure:read");

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

    await recordAuditEvent(auditRepository, request, {
      action: "procedure.read",
      resourceType: "Procedure",
      resourceId: procedure.id,
      patientId: procedure.patientId
    });

    return toProcedureResponse(procedure);
  });

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

function toProcedureResponse(procedure: Procedure): ProcedureSnapshot {
  return procedure.toSnapshot();
}

async function validateProcedureReferences(
  patientId: string,
  encounterId: string | undefined,
  basedOnServiceRequestId: string | undefined,
  partOfProcedureId: string | undefined,
  reasonConditionId: string | undefined,
  reportReferences: readonly {
    readonly resourceType: "DiagnosticReport" | "DocumentReference" | "Composition";
    readonly id: string;
  }[],
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  procedureRepository: ProcedureRepository,
  conditionRepository: ConditionRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  clinicalDocumentRepository: ClinicalDocumentRepository
): Promise<{ readonly error: string; readonly message: string } | undefined> {
  if (encounterId) {
    const encounter = await encounterRepository.findById(encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Procedure phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  if (basedOnServiceRequestId) {
    const serviceRequest = await serviceRequestRepository.findById(basedOnServiceRequestId);

    if (!serviceRequest || serviceRequest.patientId !== patientId) {
      return {
        error: "SERVICE_REQUEST_MISMATCH",
        message: "Procedure phải tham chiếu ServiceRequest thuộc cùng bệnh nhân."
      };
    }
  }

  if (partOfProcedureId) {
    const parentProcedure = await procedureRepository.findById(partOfProcedureId);

    if (!parentProcedure || parentProcedure.patientId !== patientId) {
      return {
        error: "PARENT_PROCEDURE_MISMATCH",
        message: "Procedure cha phải thuộc cùng bệnh nhân."
      };
    }
  }

  if (reasonConditionId) {
    const condition = await conditionRepository.findById(reasonConditionId);

    if (!condition || condition.patientId !== patientId) {
      return {
        error: "CONDITION_MISMATCH",
        message: "Chẩn đoán/lý do của Procedure phải thuộc cùng bệnh nhân."
      };
    }
  }

  for (const reportReference of reportReferences) {
    if (reportReference.resourceType === "DiagnosticReport") {
      const diagnosticReport = await diagnosticReportRepository.findById(reportReference.id);

      if (!diagnosticReport || diagnosticReport.patientId !== patientId) {
        return {
          error: "DIAGNOSTIC_REPORT_MISMATCH",
          message: "Báo cáo liên quan Procedure phải thuộc cùng bệnh nhân."
        };
      }
    }

    if (reportReference.resourceType === "DocumentReference") {
      const document = await clinicalDocumentRepository.findById(reportReference.id);

      if (!document || document.patientId !== patientId) {
        return {
          error: "DOCUMENT_REFERENCE_MISMATCH",
          message: "Tài liệu liên quan Procedure phải thuộc cùng bệnh nhân."
        };
      }
    }
  }

  return undefined;
}
