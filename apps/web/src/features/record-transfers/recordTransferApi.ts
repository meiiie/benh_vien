import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type {
  GatewayAcknowledgementForm,
  NewRecordTransferForm,
  RecordTransfer,
  RecordTransferDeliveryAttemptsResponse,
  RecordTransfersResponse
} from "../../types/clinical.js";

type RecordTransferLifecycleCommand = {
  readonly note: string;
};

type RecordTransferFailCommand = RecordTransferLifecycleCommand & {
  readonly failureReason: string;
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
  form: NewRecordTransferForm
): Promise<RecordTransfer> {
  return api.requestJson<RecordTransfer>(`/patients/${patientId}/record-transfers`, {
    method: "POST",
    purposeOfUse: "TREATMENT",
    json: {
      priority: form.priority,
      bundleType: form.bundleType,
      sourceOrganizationId: form.sourceOrganizationId,
      recipientOrganizationId: form.recipientOrganizationId,
      consentReference: form.consentReference,
      reason: form.reason,
      note: form.note || undefined
    }
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
  form: Omit<GatewayAcknowledgementForm, "recordTransferId">
): Promise<RecordTransfer> {
  return api.requestJson<RecordTransfer>(
    `/record-transfers/${recordTransferId}/acknowledgement-callback`,
    {
      method: "POST",
      purposeOfUse: "OPERATIONS",
      json: {
        recipientOrganizationId: form.recipientOrganizationId,
        acknowledgementReference: form.acknowledgementReference,
        ...(form.receivedAt.trim() ? { receivedAt: toApiDateTime(form.receivedAt) } : {}),
        ...(form.receivedByActorId.trim()
          ? { receivedByActorId: form.receivedByActorId.trim() }
          : {}),
        ...(form.targetEndpointId.trim()
          ? { targetEndpointId: form.targetEndpointId.trim() }
          : {}),
        ...(form.deliveryIdempotencyKey.trim()
          ? { deliveryIdempotencyKey: form.deliveryIdempotencyKey.trim() }
          : {}),
        ...(form.note.trim() ? { note: form.note.trim() } : {})
      }
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
