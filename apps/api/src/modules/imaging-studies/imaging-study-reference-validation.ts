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
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Nghiên cứu hình ảnh phải gắn với lượt khám thuộc cùng bệnh nhân."
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
        message: "Nghiên cứu hình ảnh phải tham chiếu y lệnh thuộc cùng bệnh nhân."
      };
    }
  }

  if (input.diagnosticReportId) {
    const diagnosticReport = await repositories.diagnosticReportRepository.findById(
      input.diagnosticReportId
    );

    if (!diagnosticReport || diagnosticReport.patientId !== patientId) {
      return {
        error: "DIAGNOSTIC_REPORT_MISMATCH",
        message: "Nghiên cứu hình ảnh phải gắn với báo cáo kết quả thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
