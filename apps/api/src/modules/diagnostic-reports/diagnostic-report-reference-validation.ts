import type { FastifyReply } from "fastify";
import type {
  EncounterRepository,
  ObservationRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";

export type DiagnosticReportReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly resultObservationIds: readonly string[];
};

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
