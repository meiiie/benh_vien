import type { RecordTransferAcknowledgementCallbackRequest } from "@benh-vien-so/contracts";
import type { RecordTransferSnapshot } from "@benh-vien-so/domain";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.js";

export function toAcknowledgementCallbackAuditMetadata(
  snapshot: RecordTransferSnapshot,
  callback: RecordTransferAcknowledgementCallbackRequest
): {
  readonly status: RecordTransferSnapshot["status"];
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly recipientOrganizationId: string;
  readonly targetEndpointId?: string;
  readonly deliveryIdempotencyKey?: string;
} {
  return {
    status: snapshot.status,
    receivedAt: snapshot.receivedAt,
    receivedByActorId: snapshot.receivedByActorId,
    acknowledgementReference: snapshot.acknowledgementReference,
    recipientOrganizationId: snapshot.recipientOrganizationId,
    targetEndpointId: callback.targetEndpointId,
    deliveryIdempotencyKey: callback.deliveryIdempotencyKey
  };
}

export function toCallbackSignatureAuditMetadata(
  input: CallbackSignatureVerification
): {
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
