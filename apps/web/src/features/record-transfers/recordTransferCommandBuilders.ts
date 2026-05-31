import type { GatewayAcknowledgementForm } from "../../types/clinical.js";
import type {
  GatewayAcknowledgementCommand,
  RecordTransferFailCommand,
  RecordTransferLifecycleCommand
} from "./recordTransferApi.js";

export type GatewayAcknowledgementDraft = {
  readonly recordTransferId: string;
  readonly recipientOrganizationId: string;
  readonly acknowledgementReference: string;
  readonly command: GatewayAcknowledgementCommand;
};

export function buildSendRecordTransferCommand(): RecordTransferLifecycleCommand {
  return {
    note: "Đã gửi gói hồ sơ qua gateway liên thông demo."
  };
}

export function buildReceiveRecordTransferCommand(): RecordTransferLifecycleCommand {
  return {
    note: "Bệnh viện nhận đã xác nhận tiếp nhận qua giao diện demo."
  };
}

export function buildFailRecordTransferCommand(): RecordTransferFailCommand {
  return {
    failureReason: "Gateway liên thông demo tạm thời không phản hồi.",
    note: "Đã ghi nhận lỗi gửi để thử lại sau."
  };
}

export function buildRetryRecordTransferCommand(): RecordTransferLifecycleCommand {
  return {
    note: "Đưa lại gói hồ sơ vào hàng đợi gửi."
  };
}

export function buildGatewayAcknowledgementDraft(
  form: GatewayAcknowledgementForm
): GatewayAcknowledgementDraft {
  const recordTransferId = form.recordTransferId.trim();
  const recipientOrganizationId = form.recipientOrganizationId.trim();
  const acknowledgementReference = form.acknowledgementReference.trim();

  return {
    recordTransferId,
    recipientOrganizationId,
    acknowledgementReference,
    command: {
      recipientOrganizationId,
      acknowledgementReference,
      receivedAt: form.receivedAt,
      receivedByActorId: form.receivedByActorId,
      targetEndpointId: form.targetEndpointId,
      deliveryIdempotencyKey: form.deliveryIdempotencyKey,
      note: form.note
    }
  };
}

export const recordTransferCommands = {
  fail: buildFailRecordTransferCommand,
  gatewayAcknowledgementDraft: buildGatewayAcknowledgementDraft,
  receive: buildReceiveRecordTransferCommand,
  retry: buildRetryRecordTransferCommand,
  send: buildSendRecordTransferCommand
} as const;
