import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  ImagingStudy,
  ImagingStudyRepository,
  ImagingStudySnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { DomainError } from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

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
