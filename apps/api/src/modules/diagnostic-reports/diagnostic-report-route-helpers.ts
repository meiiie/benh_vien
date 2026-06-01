import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  DiagnosticReport,
  DiagnosticReportRepository,
  DiagnosticReportSnapshot,
  EncounterRepository,
  ObservationRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

export type DiagnosticReportReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly resultObservationIds: readonly string[];
};

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
    reply.status(404).send({
      error: "DIAGNOSTIC_REPORT_NOT_FOUND"
    });

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

export async function validateDiagnosticReportReferences(
  reply: FastifyReply,
  patientId: string,
  input: DiagnosticReportReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly serviceRequestRepository: ServiceRequestRepository;
    readonly observationRepository: ObservationRepository;
  }
): Promise<boolean> {
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      reply.status(422).send({
        error: "ENCOUNTER_MISMATCH",
        message: "Báo cáo chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  if (input.basedOnServiceRequestId) {
    const serviceRequest = await repositories.serviceRequestRepository.findById(
      input.basedOnServiceRequestId
    );

    if (!serviceRequest || serviceRequest.patientId !== patientId) {
      reply.status(422).send({
        error: "SERVICE_REQUEST_MISMATCH",
        message: "Báo cáo chẩn đoán phải tham chiếu y lệnh thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  for (const observationId of input.resultObservationIds) {
    const observation = await repositories.observationRepository.findById(observationId);

    if (!observation || observation.patientId !== patientId) {
      reply.status(422).send({
        error: "OBSERVATION_MISMATCH",
        message: "Observation kết quả phải thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  return true;
}

export function sendDiagnosticReportDomainError(
  reply: FastifyReply,
  error: unknown
): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: "DIAGNOSTIC_REPORT_DOMAIN_ERROR",
    message: error.message
  });

  return true;
}
