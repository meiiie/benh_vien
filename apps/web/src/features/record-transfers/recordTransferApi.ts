import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  RecordTransfer,
  RecordTransferBundleType,
  RecordTransferDeliveryAttemptsResponse,
  RecordTransferPriority,
  RecordTransfersResponse
} from "../../types/recordTransfers.js";

export type CreateRecordTransferCommand = {
  readonly priority: RecordTransferPriority;
  readonly bundleType: RecordTransferBundleType;
  readonly sourceOrganizationId: string;
  readonly recipientOrganizationId: string;
  readonly consentReference: string;
  readonly reason: string;
  readonly note?: string;
};

export type RecordTransferLifecycleCommand = {
  readonly note: string;
};

export type RecordTransferFailCommand = RecordTransferLifecycleCommand & {
  readonly failureReason: string;
};

export type GatewayAcknowledgementCommand = {
  readonly recipientOrganizationId: string;
  readonly acknowledgementReference: string;
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly targetEndpointId?: string;
  readonly deliveryIdempotencyKey?: string;
  readonly note?: string;
};

export function listRecordTransfers(
  api: ClinicalApiClient,
  patientId: string
): Promise<RecordTransfersResponse> {
  return api.requestJson<RecordTransfersResponse>(`/patients/${patientId}/record-transfers`, {
    purposeOfUse: "TREATMENT"
  });
}

export function exportRecordTransferFhirTask(
  api: ClinicalApiClient,
  recordTransferId: string
): Promise<unknown> {
  return api.requestJson<unknown>(`/record-transfers/${recordTransferId}/fhir-task`, {
    purposeOfUse: "TREATMENT"
  });
}

export function listRecordTransferDeliveryAttempts(
  api: ClinicalApiClient,
  recordTransferId: string
): Promise<RecordTransferDeliveryAttemptsResponse> {
  return api.requestJson<RecordTransferDeliveryAttemptsResponse>(
    `/record-transfers/${recordTransferId}/delivery-attempts`,
    {
      purposeOfUse: "TREATMENT"
    }
  );
}

export function createRecordTransfer(
  api: ClinicalApiClient,
  patientId: string,
  command: CreateRecordTransferCommand
): Promise<RecordTransfer> {
  return api.requestJson<RecordTransfer>(`/patients/${patientId}/record-transfers`, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: command
  });
}

export function sendRecordTransfer(
  api: ClinicalApiClient,
  recordTransferId: string,
  command: RecordTransferLifecycleCommand
): Promise<RecordTransfer> {
  return recordTransferLifecycle(api, recordTransferId, "send", command);
}

export function receiveRecordTransfer(
  api: ClinicalApiClient,
  recordTransferId: string,
  command: RecordTransferLifecycleCommand
): Promise<RecordTransfer> {
  return recordTransferLifecycle(api, recordTransferId, "receive", command);
}

export function failRecordTransfer(
  api: ClinicalApiClient,
  recordTransferId: string,
  command: RecordTransferFailCommand
): Promise<RecordTransfer> {
  return recordTransferLifecycle(api, recordTransferId, "fail", command);
}

export function retryRecordTransfer(
  api: ClinicalApiClient,
  recordTransferId: string,
  command: RecordTransferLifecycleCommand
): Promise<RecordTransfer> {
  return recordTransferLifecycle(api, recordTransferId, "retry", command);
}

export function acknowledgeRecordTransfer(
  api: ClinicalApiClient,
  recordTransferId: string,
  command: GatewayAcknowledgementCommand
): Promise<RecordTransfer> {
  return api.requestJson<RecordTransfer>(
    `/record-transfers/${recordTransferId}/acknowledgement-callback`,
    {
      method: "POST",
      purposeOfUse: "OPERATIONS",
      json: command
    }
  );
}

function recordTransferLifecycle(
  api: ClinicalApiClient,
  recordTransferId: string,
  transition: "send" | "receive" | "fail" | "retry",
  command: RecordTransferLifecycleCommand | RecordTransferFailCommand
): Promise<RecordTransfer> {
  return api.requestJson<RecordTransfer>(`/record-transfers/${recordTransferId}/${transition}`, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: command
  });
}
