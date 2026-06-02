import type { EncounterRepository, ServiceRequestRepository } from "@benh-vien-so/domain";

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
  if (input.encounterId) {
    const encounter = await repositories.encounterRepository.findById(input.encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Công việc phải gắn với lượt khám thuộc cùng bệnh nhân."
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
        message: "Công việc thực thi phải gắn với y lệnh thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
