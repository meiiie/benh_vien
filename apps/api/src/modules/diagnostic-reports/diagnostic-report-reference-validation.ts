import type {
  EncounterRepository,
  ObservationRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { validatePatientOwnedReferences } from "../clinical-references/patient-owned-reference-validation.js";

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
  return validatePatientOwnedReferences(patientId, [
    {
      id: input.encounterId,
      repository: repositories.encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Báo cáo chẩn đoán phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: input.basedOnServiceRequestId,
      repository: repositories.serviceRequestRepository,
      error: "SERVICE_REQUEST_MISMATCH",
      message:
        "Báo cáo chẩn đoán phải tham chiếu y lệnh thuộc cùng bệnh nhân."
    },
    ...input.resultObservationIds.map((observationId) => ({
      id: observationId,
      repository: repositories.observationRepository,
      error: "OBSERVATION_MISMATCH",
      message: "Kết quả quan sát phải thuộc cùng bệnh nhân."
    }))
  ]);
}
