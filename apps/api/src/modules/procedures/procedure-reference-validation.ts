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

type PatientOwnedReferenceValidation = ProcedureValidationError & {
  readonly id?: string;
  readonly repository: {
    readonly findById: (id: string) => Promise<{ readonly patientId: string } | undefined>;
  };
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
  for (const reference of [
    {
      id: command.encounterId,
      repository: encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Procedure phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: command.basedOnServiceRequestId,
      repository: serviceRequestRepository,
      error: "SERVICE_REQUEST_MISMATCH",
      message: "Procedure phải tham chiếu ServiceRequest thuộc cùng bệnh nhân."
    },
    {
      id: command.partOfProcedureId,
      repository: procedureRepository,
      error: "PARENT_PROCEDURE_MISMATCH",
      message: "Procedure cha phải thuộc cùng bệnh nhân."
    },
    {
      id: command.reasonConditionId,
      repository: conditionRepository,
      error: "CONDITION_MISMATCH",
      message: "Chẩn đoán/lý do của Procedure phải thuộc cùng bệnh nhân."
    }
  ] as const) {
    const error = await validatePatientOwnedReference(patientId, reference);

    if (error) {
      return error;
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

async function validatePatientOwnedReference(
  patientId: string,
  reference: PatientOwnedReferenceValidation
): Promise<ProcedureValidationError | undefined> {
  if (!reference.id) {
    return undefined;
  }

  const resource = await reference.repository.findById(reference.id);

  return resource?.patientId === patientId
    ? undefined
    : { error: reference.error, message: reference.message };
}
