import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  DiagnosticReportRepository,
  EncounterRepository,
  ImagingStudy,
  ImagingStudyRepository,
  ImagingStudySnapshot,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

export type ImagingStudyReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly diagnosticReportId?: string;
};

export function toImagingStudyResponse(imagingStudy: ImagingStudy): ImagingStudySnapshot {
  return imagingStudy.toSnapshot();
}

export async function loadImagingStudyForPatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  imagingStudyId: string,
  imagingStudyRepository: ImagingStudyRepository,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<ImagingStudy | undefined> {
  const imagingStudy = await imagingStudyRepository.findById(imagingStudyId);

  if (!imagingStudy) {
    reply.status(404).send({
      error: "IMAGING_STUDY_NOT_FOUND"
    });

    return undefined;
  }

  if (
    !(await requirePatientRecordAccessByPatientId(
      request,
      reply,
      actor,
      imagingStudy.patientId,
      patientRepository,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  return imagingStudy;
}

export async function validateImagingStudyReferences(
  reply: FastifyReply,
  patientId: string,
  input: ImagingStudyReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly serviceRequestRepository: ServiceRequestRepository;
    readonly diagnosticReportRepository: DiagnosticReportRepository;
  }
): Promise<boolean> {
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      reply.status(422).send({
        error: "ENCOUNTER_MISMATCH",
        message: "Nghiên cứu hình ảnh phải gắn với lượt khám thuộc cùng bệnh nhân."
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
        message: "Nghiên cứu hình ảnh phải tham chiếu y lệnh thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  if (input.diagnosticReportId) {
    const diagnosticReport = await repositories.diagnosticReportRepository.findById(
      input.diagnosticReportId
    );

    if (!diagnosticReport || diagnosticReport.patientId !== patientId) {
      reply.status(422).send({
        error: "DIAGNOSTIC_REPORT_MISMATCH",
        message: "Nghiên cứu hình ảnh phải gắn với báo cáo kết quả thuộc cùng bệnh nhân."
      });

      return false;
    }
  }

  return true;
}

export function sendImagingStudyDomainError(reply: FastifyReply, error: unknown): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: "IMAGING_STUDY_DOMAIN_ERROR",
    message: error.message
  });

  return true;
}
