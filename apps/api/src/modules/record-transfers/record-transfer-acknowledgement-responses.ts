import type { FastifyReply, FastifyRequest } from "fastify";
import type { ActorContext } from "@benh-vien-so/domain";
import { sendJsonErrorResponse } from "../http/http-json-error-response.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.js";

export function sendAcknowledgementForbidden(
  reply: FastifyReply,
  request: FastifyRequest,
  actor: ActorContext,
  message: string
) {
  return sendJsonErrorResponse(reply, 403, request.id, {
    error: "FORBIDDEN",
    message,
    permission: "record-transfer:acknowledge",
    actor: toAcknowledgementActor(actor)
  });
}

export function sendAcknowledgementSignatureFailure(
  reply: FastifyReply,
  request: FastifyRequest,
  actor: ActorContext,
  signatureVerification: CallbackSignatureVerification
): boolean {
  if (!signatureVerification.required || signatureVerification.verified) {
    return false;
  }

  sendJsonErrorResponse(reply, signatureVerification.statusCode, request.id, {
    error: signatureVerification.error,
    message: signatureVerification.message,
    permission: "record-transfer:acknowledge",
    actor: toAcknowledgementActor(actor)
  });
  return true;
}

export function sendAcknowledgementConflict(
  reply: FastifyReply,
  requestId: string
) {
  return sendJsonErrorResponse(reply, 409, requestId, {
    error: "RECORD_TRANSFER_ALREADY_COMPLETED",
    message:
      "Gói chuyển hồ sơ đã hoàn tất bằng một biên nhận khác, không thể ghi đè bằng callback mới."
  });
}

function toAcknowledgementActor(actor: ActorContext) {
  return {
    id: actor.actorId,
    role: actor.role,
    purposeOfUse: actor.purposeOfUse
  };
}
