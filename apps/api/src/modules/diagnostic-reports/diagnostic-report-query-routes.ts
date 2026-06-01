import type { FastifyInstance } from "fastify";
import {
  DiagnosticReportIdParamsSchema,
  PatientDiagnosticReportsParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadDiagnosticReportForPatientAccess,
  toDiagnosticReportResponse
} from "./diagnostic-report-route-helpers.js";

export async function registerDiagnosticReportQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/diagnostic-reports", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:list");

    if (!actor) {
      return;
    }

    const params = PatientDiagnosticReportsParamsSchema.parse(request.params);
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

  app.get("/diagnostic-reports/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:read");

    if (!actor) {
      return;
    }

    const params = DiagnosticReportIdParamsSchema.parse(request.params);
    const diagnosticReport = await loadDiagnosticReportForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      diagnosticReportRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!diagnosticReport) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "diagnostic-report.read",
      resourceType: "DiagnosticReport",
      resourceId: diagnosticReport.id,
      patientId: diagnosticReport.patientId
    });

    return toDiagnosticReportResponse(diagnosticReport);
  });
}
