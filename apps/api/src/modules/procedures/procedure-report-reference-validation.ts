import type { CreateProcedureRequest } from "@benh-vien-so/contracts";
import type {
  ClinicalDocumentRepository,
  DiagnosticReportRepository
} from "@benh-vien-so/domain";
import type { ProcedureValidationError } from "./procedure-reference-validation.js";

export async function validateProcedureReportReference(
  patientId: string,
  reportReference: NonNullable<CreateProcedureRequest["reportReferences"]>[number],
  diagnosticReportRepository: DiagnosticReportRepository,
  clinicalDocumentRepository: ClinicalDocumentRepository
): Promise<ProcedureValidationError | undefined> {
  if (reportReference.resourceType === "DiagnosticReport") {
    const diagnosticReport = await diagnosticReportRepository.findById(
      reportReference.id
    );

    if (!diagnosticReport || diagnosticReport.patientId !== patientId) {
      return {
        error: "DIAGNOSTIC_REPORT_MISMATCH",
        message: "Báo cáo liên quan Procedure phải thuộc cùng bệnh nhân."
      };
    }
  }

  if (reportReference.resourceType === "DocumentReference") {
    const document = await clinicalDocumentRepository.findById(reportReference.id);

    if (!document || document.patientId !== patientId) {
      return {
        error: "DOCUMENT_REFERENCE_MISMATCH",
        message: "Tài liệu liên quan Procedure phải thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
