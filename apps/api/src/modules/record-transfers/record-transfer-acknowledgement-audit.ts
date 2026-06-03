import type { FastifyRequest } from "fastify";
import type { RecordTransferAcknowledgementCallbackRequest } from "@benh-vien-so/contracts";
import type {
  ActorContext,
  AuditEventRepository,
  RecordTransfer,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.js";

type DuplicateAcknowledgementAuditInput = {
  readonly auditRepository: AuditEventRepository;
  readonly request: FastifyRequest;
  readonly recordTransfer: RecordTransfer;
  readonly snapshot: RecordTransferSnapshot;
  readonly callback: RecordTransferAcknowledgementCallbackRequest;
  readonly signatureVerification: CallbackSignatureVerification;
};

type AcceptedAcknowledgementAuditInput = {
  readonly auditRepository: AuditEventRepository;
  readonly request: FastifyRequest;
  readonly recordTransfer: RecordTransfer;
  readonly actor: ActorContext;
  readonly callback: RecordTransferAcknowledgementCallbackRequest;
  readonly signatureVerification: CallbackSignatureVerification;
};

export async function recordDuplicateAcknowledgementCallbackAudit(
  input: DuplicateAcknowledgementAuditInput
): Promise<void> {
  await recordAuditEvent(input.auditRepository, input.request, {
    action: "record-transfer.acknowledgement-callback",
    resourceType: "RecordTransfer",
    resourceId: input.recordTransfer.id,
    patientId: input.recordTransfer.patientId,
    metadata: {
      duplicateCallback: true,
      status: input.snapshot.status,
      receivedAt: input.snapshot.receivedAt,
      receivedByActorId: input.snapshot.receivedByActorId,
      acknowledgementReference: input.snapshot.acknowledgementReference,
      recipientOrganizationId: input.snapshot.recipientOrganizationId,
      targetEndpointId: input.callback.targetEndpointId,
      deliveryIdempotencyKey: input.callback.deliveryIdempotencyKey,
      ...toCallbackSignatureAuditMetadata(input.signatureVerification)
    }
  });
}

export async function recordAcceptedAcknowledgementCallbackAudit(
  input: AcceptedAcknowledgementAuditInput
): Promise<void> {
  const snapshot = input.recordTransfer.toSnapshot();

  await recordAuditEvent(input.auditRepository, input.request, {
    action: "record-transfer.acknowledgement-callback",
    resourceType: "RecordTransfer",
    resourceId: input.recordTransfer.id,
    patientId: input.recordTransfer.patientId,
    metadata: {
      duplicateCallback: false,
      status: snapshot.status,
      sentAt: snapshot.sentAt,
      receivedAt: snapshot.receivedAt,
      receivedByActorId: snapshot.receivedByActorId,
      acknowledgementReference: snapshot.acknowledgementReference,
      recipientOrganizationId: snapshot.recipientOrganizationId,
      targetEndpointId: input.callback.targetEndpointId,
      deliveryIdempotencyKey: input.callback.deliveryIdempotencyKey,
      callbackActorId: input.actor.actorId,
      ...toCallbackSignatureAuditMetadata(input.signatureVerification)
    }
  });
}

function toCallbackSignatureAuditMetadata(input: CallbackSignatureVerification): {
  readonly callbackSignatureRequired: boolean;
  readonly callbackSignatureVerified: boolean;
  readonly callbackSignatureTimestamp?: string;
  readonly callbackSignatureAlgorithm?: string;
  readonly callbackSignatureKeyId?: string;
} {
  return {
    callbackSignatureRequired: input.required,
    callbackSignatureVerified: input.verified,
    callbackSignatureTimestamp: input.timestamp,
    callbackSignatureAlgorithm: input.algorithm,
    callbackSignatureKeyId: input.keyId
  };
}
