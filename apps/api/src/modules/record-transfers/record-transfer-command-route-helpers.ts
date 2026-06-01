import type { FastifyReply } from "fastify";
import { DomainError } from "@benh-vien-so/domain";
import type {
  ProviderEndpointSnapshot,
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "@benh-vien-so/domain";

export function sendRecordTransferDomainError(reply: FastifyReply, error: unknown): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: "RECORD_TRANSFER_DOMAIN_ERROR",
    message: error.message
  });
  return true;
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
