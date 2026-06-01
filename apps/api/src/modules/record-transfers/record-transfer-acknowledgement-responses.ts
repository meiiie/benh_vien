import type { FastifyReply, FastifyRequest } from "fastify";
import type { ActorContext } from "@benh-vien-so/domain";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.js";

export function sendAcknowledgementForbidden(
  reply: FastifyReply,
  request: FastifyRequest,
  actor: ActorContext,
  message: string
) {
  return reply.status(403).send({
    error: "FORBIDDEN",
    message,
    requestId: request.id,
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

  reply.status(signatureVerification.statusCode).send({
    error: signatureVerification.error,
    message: signatureVerification.message,
    requestId: request.id,
    permission: "record-transfer:acknowledge",
    actor: toAcknowledgementActor(actor)
  });
  return true;
}

export function sendAcknowledgementConflict(
  reply: FastifyReply,
  requestId: string
) {
  return reply.status(409).send({
    error: "RECORD_TRANSFER_ALREADY_COMPLETED",
    message:
      "Gói chuyển hồ sơ đã hoàn tất bằng một biên nhận khác, không thể ghi đè bằng callback mới.",
    requestId
  });
}

function toAcknowledgementActor(actor: ActorContext) {
  return {
    id: actor.actorId,
    role: actor.role,
    purposeOfUse: actor.purposeOfUse
  };
}
