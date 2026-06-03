import type { EncounterRepository, ServiceRequestRepository } from "@benh-vien-so/domain";
import { validatePatientOwnedReferences } from "../clinical-references/patient-owned-reference-validation.js";

export type WorkflowTaskReferenceInput = {
  readonly encounterId?: string;
  readonly basedOnServiceRequestId?: string;
};

export type WorkflowTaskValidationError = {
  readonly error: string;
  readonly message: string;
};

export async function validateWorkflowTaskReferences(
  patientId: string,
  input: WorkflowTaskReferenceInput,
  repositories: {
    readonly encounterRepository: EncounterRepository;
    readonly serviceRequestRepository: ServiceRequestRepository;
  }
): Promise<WorkflowTaskValidationError | undefined> {
  return validatePatientOwnedReferences(patientId, [
    {
      id: input.encounterId,
      repository: repositories.encounterRepository,
      error: "ENCOUNTER_MISMATCH",
      message: "Công việc phải gắn với lượt khám thuộc cùng bệnh nhân."
    },
    {
      id: input.basedOnServiceRequestId,
      repository: repositories.serviceRequestRepository,
      error: "SERVICE_REQUEST_MISMATCH",
      message: "Công việc thực thi phải gắn với y lệnh thuộc cùng bệnh nhân."
    }
  ]);
}
