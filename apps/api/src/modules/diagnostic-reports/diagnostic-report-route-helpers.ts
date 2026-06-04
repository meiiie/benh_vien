import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  DiagnosticReport,
  DiagnosticReportRepository,
  DiagnosticReportSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";

export function toDiagnosticReportResponse(
  diagnosticReport: DiagnosticReport
): DiagnosticReportSnapshot {
  return diagnosticReport.toSnapshot();
}

export async function loadDiagnosticReportForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  diagnosticReportId: string,
  diagnosticReportRepository: DiagnosticReportRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<DiagnosticReport | undefined> {
  const diagnosticReport = await diagnosticReportRepository.findById(diagnosticReportId);

  if (!diagnosticReport) {
    sendNotFoundErrorResponse(reply, "DIAGNOSTIC_REPORT_NOT_FOUND");

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      diagnosticReport.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return diagnosticReport;
}

export function sendDiagnosticReportDomainError(
  reply: FastifyReply,
  error: unknown
): boolean {
  return sendDomainErrorResponse(reply, error, "DIAGNOSTIC_REPORT_DOMAIN_ERROR");
}
