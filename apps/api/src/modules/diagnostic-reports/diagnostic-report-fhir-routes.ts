import type { FastifyInstance } from "fastify";
import { DiagnosticReportIdParamsSchema } from "@benh-vien-so/contracts";
import { mapDiagnosticReportToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadDiagnosticReportForPatientAccess } from "./diagnostic-report-route-helpers.js";

export async function registerDiagnosticReportFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/diagnostic-reports/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:fhir-export");

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
