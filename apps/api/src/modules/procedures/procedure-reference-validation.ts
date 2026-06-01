import type { CreateProcedureRequest } from "@benh-vien-so/contracts";
import type {
  ClinicalDocumentRepository,
  ConditionRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ProcedureRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { validateProcedureReportReference } from "./procedure-report-reference-validation.js";

export type ProcedureValidationError = {
  readonly error: string;
  readonly message: string;
};

type ValidateProcedureReferencesInput = {
  readonly patientId: string;
  readonly command: CreateProcedureRequest;
  readonly encounterRepository: EncounterRepository;
  readonly serviceRequestRepository: ServiceRequestRepository;
  readonly procedureRepository: ProcedureRepository;
  readonly conditionRepository: ConditionRepository;
  readonly diagnosticReportRepository: DiagnosticReportRepository;
  readonly clinicalDocumentRepository: ClinicalDocumentRepository;
};

export async function validateProcedureReferences({
  patientId,
  command,
  encounterRepository,
  serviceRequestRepository,
  procedureRepository,
  conditionRepository,
  diagnosticReportRepository,
  clinicalDocumentRepository
}: ValidateProcedureReferencesInput): Promise<ProcedureValidationError | undefined> {
  if (command.encounterId) {
    const encounter = await encounterRepository.findById(command.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Procedure phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  if (command.basedOnServiceRequestId) {
    const serviceRequest = await serviceRequestRepository.findById(
      command.basedOnServiceRequestId
    );

    if (!serviceRequest || serviceRequest.patientId !== patientId) {
      return {
        error: "SERVICE_REQUEST_MISMATCH",
        message: "Procedure phải tham chiếu ServiceRequest thuộc cùng bệnh nhân."
      };
    }
  }

  if (command.partOfProcedureId) {
    const parentProcedure = await procedureRepository.findById(
      command.partOfProcedureId
    );

    if (!parentProcedure || parentProcedure.patientId !== patientId) {
      return {
        error: "PARENT_PROCEDURE_MISMATCH",
        message: "Procedure cha phải thuộc cùng bệnh nhân."
      };
    }
  }

  if (command.reasonConditionId) {
    const condition = await conditionRepository.findById(command.reasonConditionId);

    if (!condition || condition.patientId !== patientId) {
      return {
        error: "CONDITION_MISMATCH",
        message: "Chẩn đoán/lý do của Procedure phải thuộc cùng bệnh nhân."
      };
    }
  }

  for (const reportReference of command.reportReferences ?? []) {
    const error = await validateProcedureReportReference(
      patientId,
      reportReference,
      diagnosticReportRepository,
      clinicalDocumentRepository
    );

    if (error) {
      return error;
    }
  }

  return undefined;
}
