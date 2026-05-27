import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateDiagnosticReportRequestSchema,
  DiagnosticReportIdParamsSchema,
  PatientDiagnosticReportsParamsSchema
} from "@benh-vien-so/contracts";
import {
  DiagnosticReport,
  DomainError,
  mapDiagnosticReportToFhir
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  DiagnosticReportSnapshot,
  EncounterRepository,
  ObservationRepository,
  PatientRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerDiagnosticReportRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  observationRepository: ObservationRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/diagnostic-reports", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:list");

    if (!actor) {
      return;
    }

    const params = PatientDiagnosticReportsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const diagnosticReports = await diagnosticReportRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "diagnostic-report.list",
      resourceType: "DiagnosticReport",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: diagnosticReports.length
      }
    });

    return {
      items: diagnosticReports.map(toDiagnosticReportResponse)
    };
  });

  app.post("/patients/:patientId/diagnostic-reports", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:create");

    if (!actor) {
      return;
    }

    const params = PatientDiagnosticReportsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateDiagnosticReportRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_DIAGNOSTIC_REPORT_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Báo cáo chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    if (parsed.data.basedOnServiceRequestId) {
      const serviceRequest = await serviceRequestRepository.findById(
        parsed.data.basedOnServiceRequestId
      );

      if (!serviceRequest || serviceRequest.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "SERVICE_REQUEST_MISMATCH",
          message: "Báo cáo chẩn đoán phải tham chiếu y lệnh thuộc cùng bệnh nhân."
        });
      }
    }

    for (const observationId of parsed.data.resultObservationIds) {
      const observation = await observationRepository.findById(observationId);

      if (!observation || observation.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "OBSERVATION_MISMATCH",
          message: "Observation kết quả phải thuộc cùng bệnh nhân."
        });
      }
    }

    try {
      const diagnosticReport = DiagnosticReport.issue({
        id: `diagnostic-report-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await diagnosticReportRepository.save(diagnosticReport);
      await recordAuditEvent(auditRepository, request, {
        action: "diagnostic-report.create",
        resourceType: "DiagnosticReport",
        resourceId: diagnosticReport.id,
        patientId: diagnosticReport.patientId,
        metadata: {
          category: diagnosticReport.toSnapshot().category,
          code: diagnosticReport.toSnapshot().code,
          basedOnServiceRequestId: diagnosticReport.toSnapshot().basedOnServiceRequestId,
          resultObservationCount: diagnosticReport.toSnapshot().resultObservationIds.length
        }
      });

      return reply.status(201).send(toDiagnosticReportResponse(diagnosticReport));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "DIAGNOSTIC_REPORT_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/diagnostic-reports/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:read");

    if (!actor) {
      return;
    }

    const params = DiagnosticReportIdParamsSchema.parse(request.params);
    const diagnosticReport = await diagnosticReportRepository.findById(params.id);

    if (!diagnosticReport) {
      return reply.status(404).send({
        error: "DIAGNOSTIC_REPORT_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "diagnostic-report.read",
      resourceType: "DiagnosticReport",
      resourceId: diagnosticReport.id,
      patientId: diagnosticReport.patientId
    });

    return toDiagnosticReportResponse(diagnosticReport);
  });

  app.get("/diagnostic-reports/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:fhir-export");

    if (!actor) {
      return;
    }

    const params = DiagnosticReportIdParamsSchema.parse(request.params);
    const diagnosticReport = await diagnosticReportRepository.findById(params.id);

    if (!diagnosticReport) {
      return reply.status(404).send({
        error: "DIAGNOSTIC_REPORT_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "diagnostic-report.fhir-export",
      resourceType: "DiagnosticReport",
      resourceId: diagnosticReport.id,
      patientId: diagnosticReport.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "DiagnosticReport"
      }
    });

    return mapDiagnosticReportToFhir(diagnosticReport);
  });
}

function toDiagnosticReportResponse(
  diagnosticReport: DiagnosticReport
): DiagnosticReportSnapshot {
  return diagnosticReport.toSnapshot();
}
