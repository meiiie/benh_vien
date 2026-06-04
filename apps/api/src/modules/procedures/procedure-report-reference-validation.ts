import type { CreateProcedureRequest } from "@benh-vien-so/contracts";
import type {
  ClinicalDocumentRepository,
  DiagnosticReportRepository
} from "@benh-vien-so/domain";
import { validatePatientOwnedReference } from "../clinical-references/patient-owned-reference-validation.js";
import type { ProcedureValidationError } from "./procedure-reference-validation.js";

export async function validateProcedureReportReference(
  patientId: string,
  reportReference: NonNullable<CreateProcedureRequest["reportReferences"]>[number],
  diagnosticReportRepository: DiagnosticReportRepository,
  clinicalDocumentRepository: ClinicalDocumentRepository
): Promise<ProcedureValidationError | undefined> {
  if (reportReference.resourceType === "DiagnosticReport") {
    return validatePatientOwnedReference(patientId, {
      id: reportReference.id,
      repository: diagnosticReportRepository,
      error: "DIAGNOSTIC_REPORT_MISMATCH",
      message: "Báo cáo liên quan Procedure phải thuộc cùng bệnh nhân."
    });
  }

  if (reportReference.resourceType === "DocumentReference") {
    return validatePatientOwnedReference(patientId, {
      id: reportReference.id,
      repository: clinicalDocumentRepository,
      error: "DOCUMENT_REFERENCE_MISMATCH",
      message: "Tài liệu liên quan Procedure phải thuộc cùng bệnh nhân."
    });
  }

  return undefined;
}
