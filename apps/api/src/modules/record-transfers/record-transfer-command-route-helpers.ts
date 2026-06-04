import type { FastifyReply } from "fastify";
import type {
  ProviderEndpointSnapshot,
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "@benh-vien-so/domain";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";

export function sendRecordTransferDomainError(reply: FastifyReply, error: unknown): boolean {
  return sendDomainErrorResponse(reply, error, "RECORD_TRANSFER_DOMAIN_ERROR");
}

export function toSendAuditMetadata(
  recordTransfer: RecordTransfer,
  targetEndpoint: ProviderEndpointSnapshot,
  deliveryAttempt: RecordTransferDeliveryAttempt
): Record<string, unknown> {
  const snapshot = recordTransfer.toSnapshot();
  const deliveryAttemptSnapshot = deliveryAttempt.toSnapshot();

  return {
    status: snapshot.status,
    sentAt: snapshot.sentAt,
    recipientOrganizationId: snapshot.recipientOrganizationId,
    targetEndpointId: targetEndpoint.id,
    targetEndpointAddress: targetEndpoint.address,
    deliveryAttemptId: deliveryAttempt.id,
    deliveryAttemptNumber: deliveryAttemptSnapshot.attemptNumber,
    deliveryIdempotencyKey: deliveryAttemptSnapshot.idempotencyKey
  };
}

export function toReceiveAuditMetadata(recordTransfer: RecordTransfer): Record<string, unknown> {
  const snapshot = recordTransfer.toSnapshot();

  return {
    status: snapshot.status,
    sentAt: snapshot.sentAt,
    receivedAt: snapshot.receivedAt,
    receivedByActorId: snapshot.receivedByActorId,
    acknowledgementReference: snapshot.acknowledgementReference,
    recipientOrganizationId: snapshot.recipientOrganizationId
  };
}

export function toFailAuditMetadata(recordTransfer: RecordTransfer): Record<string, unknown> {
  const snapshot = recordTransfer.toSnapshot();

  return {
    status: snapshot.status,
    failedAt: snapshot.failedAt,
    failureReason: snapshot.failureReason,
    nextRetryAt: snapshot.nextRetryAt,
    retryCount: snapshot.retryCount,
    recipientOrganizationId: snapshot.recipientOrganizationId
  };
}

export function toRetryAuditMetadata(
  recordTransfer: RecordTransfer,
  previousFailureReason: string | undefined
): Record<string, unknown> {
  const snapshot = recordTransfer.toSnapshot();

  return {
    status: snapshot.status,
    retryCount: snapshot.retryCount,
    previousFailureReason,
    recipientOrganizationId: snapshot.recipientOrganizationId
  };
}
