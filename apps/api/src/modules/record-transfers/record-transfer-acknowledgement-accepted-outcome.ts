import type { FastifyRequest } from "fastify";
import type { RecordTransferAcknowledgementCallbackRequest } from "@benh-vien-so/contracts";
import type {
  ActorContext,
  AuditEventRepository,
  RecordTransfer,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { recordAcceptedAcknowledgementCallbackAudit } from "./record-transfer-acknowledgement-audit.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.js";
import { toRecordTransferResponse } from "./record-transfer-route-helpers.js";

type AcceptAcknowledgementCallbackInput = {
  readonly recordTransferRepository: RecordTransferRepository;
  readonly auditRepository: AuditEventRepository;
  readonly request: FastifyRequest;
  readonly recordTransfer: RecordTransfer;
  readonly actor: ActorContext;
  readonly callback: RecordTransferAcknowledgementCallbackRequest;
  readonly signatureVerification: CallbackSignatureVerification;
};

export async function acceptRecordTransferAcknowledgementCallback({
  recordTransferRepository,
  auditRepository,
  request,
  recordTransfer,
  actor,
  callback,
  signatureVerification
}: AcceptAcknowledgementCallbackInput) {
  recordTransfer.markReceived({
    receivedAt: callback.receivedAt ?? new Date().toISOString(),
    receivedByActorId: callback.receivedByActorId ?? actor.actorId,
    acknowledgementReference: callback.acknowledgementReference,
    note:
      callback.note ??
      "Cơ sở y tế nhận đã xác nhận tiếp nhận qua callback liên thông."
  });
  await recordTransferRepository.save(recordTransfer);
  await recordAcceptedAcknowledgementCallbackAudit({
    auditRepository,
    request,
    recordTransfer,
    actor,
    callback,
    signatureVerification
  });

  return toRecordTransferResponse(recordTransfer);
}
