import type {
  DiagnosticReportRepository,
  EncounterRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { validatePatientOwnedReferences } from "../clinical-references/patient-owned-reference-validation.js";

export type ImagingStudyReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
  readonly diagnosticReportId?: string;
};

export type ImagingStudyValidationError = {
  readonly error: string;
  readonly message: string;
};

export async function validateImagingStudyReferences(
  patientId: string,
  input: ImagingStudyReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly serviceRequestRepository: ServiceRequestRepository;
    readonly diagnosticReportRepository: DiagnosticReportRepository;
  }
): Promise<ImagingStudyValidationError | undefined> {
  return validatePatientOwnedReferences(patientId, [
    {
      id: input.encounterId,
      repository: repositories.encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Nghiên cứu hình ảnh phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: input.basedOnServiceRequestId,
      repository: repositories.serviceRequestRepository,
      error: "SERVICE_REQUEST_MISMATCH",
      message: "Nghiên cứu hình ảnh phải tham chiếu y lệnh thuộc cùng bệnh nhân."
    },
    {
      id: input.diagnosticReportId,
      repository: repositories.diagnosticReportRepository,
      error: "DIAGNOSTIC_REPORT_MISMATCH",
      message:
        "Nghiên cứu hình ảnh phải gắn với báo cáo kết quả thuộc cùng bệnh nhân."
    }
  ]);
}
