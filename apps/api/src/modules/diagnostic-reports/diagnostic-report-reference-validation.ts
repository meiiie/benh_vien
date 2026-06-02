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

export type DiagnosticReportValidationError = {
  readonly error: string;
  readonly message: string;
};

export async function validateDiagnosticReportReferences(
  patientId: string,
  input: DiagnosticReportReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly serviceRequestRepository: ServiceRequestRepository;
    readonly observationRepository: ObservationRepository;
  }
): Promise<DiagnosticReportValidationError | undefined> {
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Báo cáo chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  if (input.basedOnServiceRequestId) {
    const serviceRequest = await repositories.serviceRequestRepository.findById(
      input.basedOnServiceRequestId
    );

    if (!serviceRequest || serviceRequest.patientId !== patientId) {
      return {
        error: "SERVICE_REQUEST_MISMATCH",
        message: "Báo cáo chẩn đoán phải tham chiếu y lệnh thuộc cùng bệnh nhân."
      };
    }
  }

  for (const observationId of input.resultObservationIds) {
    const observation = await repositories.observationRepository.findById(observationId);

    if (!observation || observation.patientId !== patientId) {
      return {
        error: "OBSERVATION_MISMATCH",
        message: "Kết quả quan sát phải thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
