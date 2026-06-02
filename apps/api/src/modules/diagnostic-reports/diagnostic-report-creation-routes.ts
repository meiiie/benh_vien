import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateDiagnosticReportRequestSchema,
  PatientDiagnosticReportsParamsSchema
} from "@benh-vien-so/contracts";
import { DiagnosticReport } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ObservationRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  sendDiagnosticReportDomainError,
  toDiagnosticReportResponse
} from "./diagnostic-report-route-helpers.js";
import { validateDiagnosticReportReferences } from "./diagnostic-report-reference-validation.js";

export async function registerDiagnosticReportCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  observationRepository: ObservationRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/diagnostic-reports", async (request, reply) => {
    const actor = requirePermission(request, reply, "diagnostic-report:create");

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

    const parsed = CreateDiagnosticReportRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    if (
      !(await validateDiagnosticReportReferences(reply, params.patientId, parsed.data, {
        encounterRepository,
        serviceRequestRepository,
        observationRepository
      }))
    ) {
      return;
    }

    try {
      const diagnosticReport = DiagnosticReport.issue({
        id: `diagnostic-report-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await diagnosticReportRepository.save(diagnosticReport);
      const snapshot = diagnosticReport.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "diagnostic-report.create",
        resourceType: "DiagnosticReport",
        resourceId: diagnosticReport.id,
        patientId: diagnosticReport.patientId,
        metadata: {
          category: snapshot.category,
          code: snapshot.code,
          basedOnServiceRequestId: snapshot.basedOnServiceRequestId,
          resultObservationCount: snapshot.resultObservationIds.length
        }
      });

      return reply.status(201).send(toDiagnosticReportResponse(diagnosticReport));
    } catch (error) {
      if (sendDiagnosticReportDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
