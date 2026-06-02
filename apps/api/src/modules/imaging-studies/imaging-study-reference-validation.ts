import type { FastifyReply } from "fastify";
import type {
  DiagnosticReportRepository,
  EncounterRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";

export type ImagingStudyReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly diagnosticReportId?: string;
};

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
