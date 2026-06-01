import type { CommandDraft } from "../../lib/commandDrafts.js";
import { parseOptionalApiDateTime } from "../../lib/commandDrafts.js";
import type {
  GatewayAcknowledgementForm,
  NewRecordTransferForm
} from "../../types/recordTransfers.js";
import type {
  CreateRecordTransferCommand,
  GatewayAcknowledgementCommand,
  RecordTransferFailCommand,
  RecordTransferLifecycleCommand
} from "./recordTransferApi.js";

export type GatewayAcknowledgementDraft = {
  readonly recordTransferId: string;
  readonly recipientOrganizationId: string;
  readonly acknowledgementReference: string;
  readonly payload: GatewayAcknowledgementCommand;
};

export function buildCreateRecordTransferCommand(
  form: NewRecordTransferForm
): CreateRecordTransferCommand {
  return {
    priority: form.priority,
    bundleType: form.bundleType,
    sourceOrganizationId: form.sourceOrganizationId,
    recipientOrganizationId: form.recipientOrganizationId,
    consentReference: form.consentReference,
    reason: form.reason,
    note: form.note || undefined
  };
}

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
): CommandDraft<GatewayAcknowledgementDraft> {
  const recordTransferId = form.recordTransferId.trim();
  const recipientOrganizationId = form.recipientOrganizationId.trim();
  const acknowledgementReference = form.acknowledgementReference.trim();

  if (!recordTransferId || !recipientOrganizationId || !acknowledgementReference) {
    return {
      ok: false,
      message: "Callback gateway cần mã gói chuyển, cơ sở nhận và mã biên nhận tiếp nhận."
    };
  }

  const receivedAt = parseOptionalApiDateTime(
    form.receivedAt,
    "Thời điểm gateway xác nhận tiếp nhận phải là ngày giờ hợp lệ."
  );

  if (!receivedAt.ok) {
    return receivedAt;
  }

  return {
    ok: true,
    command: {
      recordTransferId,
      recipientOrganizationId,
      acknowledgementReference,
      payload: {
        recipientOrganizationId,
        acknowledgementReference,
        ...(receivedAt.value ? { receivedAt: receivedAt.value } : {}),
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
  };
}

export const recordTransferCommands = {
  create: buildCreateRecordTransferCommand,
  fail: buildFailRecordTransferCommand,
  gatewayAcknowledgementDraft: buildGatewayAcknowledgementDraft,
  receive: buildReceiveRecordTransferCommand,
  retry: buildRetryRecordTransferCommand,
  send: buildSendRecordTransferCommand
} as const;
