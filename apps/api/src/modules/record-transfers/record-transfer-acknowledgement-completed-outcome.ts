import type { FastifyReply, FastifyRequest } from "fastify";
import type { RecordTransferAcknowledgementCallbackRequest } from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  RecordTransfer,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import { recordDuplicateAcknowledgementCallbackAudit } from "./record-transfer-acknowledgement-audit.js";
import { sendAcknowledgementConflict } from "./record-transfer-acknowledgement-policy.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.js";
import { toRecordTransferResponse } from "./record-transfer-route-helpers.js";

type CompletedAcknowledgementCallbackInput = {
  readonly reply: FastifyReply;
  readonly request: FastifyRequest;
  readonly auditRepository: AuditEventRepository;
  readonly recordTransfer: RecordTransfer;
  readonly snapshot: RecordTransferSnapshot;
  readonly callback: RecordTransferAcknowledgementCallbackRequest;
  readonly signatureVerification: CallbackSignatureVerification;
};

export async function handleCompletedAcknowledgementCallback({
  reply,
  request,
  auditRepository,
  recordTransfer,
  snapshot,
  callback,
  signatureVerification
}: CompletedAcknowledgementCallbackInput) {
  if (snapshot.status !== "completed") {
    return undefined;
  }

  if (snapshot.acknowledgementReference !== callback.acknowledgementReference) {
    return sendAcknowledgementConflict(reply, request.id);
  }

  await recordDuplicateAcknowledgementCallbackAudit({
    auditRepository,
    request,
    recordTransfer,
    snapshot,
    callback,
    signatureVerification
  });

  return toRecordTransferResponse(recordTransfer);
}
