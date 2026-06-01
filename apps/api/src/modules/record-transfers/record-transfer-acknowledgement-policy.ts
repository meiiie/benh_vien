import type { FastifyReply, FastifyRequest } from "fastify";
import type { ActorContext, ProviderDirectoryRepository } from "@benh-vien-so/domain";
import type { verifyRecordTransferCallbackSignature } from "./record-transfer-callback-signature.js";
import { canAcknowledgeForRecipient } from "./record-transfer-route-helpers.js";

type CallbackSignatureVerification = ReturnType<
  typeof verifyRecordTransferCallbackSignature
>;

type AcknowledgementAccessInput = {
  readonly reply: FastifyReply;
  readonly request: FastifyRequest;
  readonly actor: ActorContext;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
  readonly callbackRecipientOrganizationId: string;
  readonly expectedRecipientOrganizationId: string;
};

export async function ensureAcknowledgementCallbackAccess(
  input: AcknowledgementAccessInput
): Promise<boolean> {
  if (input.actor.purposeOfUse !== "OPERATIONS") {
    sendAcknowledgementForbidden(
      input.reply,
      input.request,
      input.actor,
      "Callback xác nhận nhận hồ sơ phải dùng x-purpose-of-use=OPERATIONS."
    );
    return false;
  }

  if (input.callbackRecipientOrganizationId !== input.expectedRecipientOrganizationId) {
    sendAcknowledgementForbidden(
      input.reply,
      input.request,
      input.actor,
      "Callback xác nhận nhận hồ sơ không khớp cơ sở y tế nhận của gói chuyển."
    );
    return false;
  }

  const providerDirectory = await input.providerDirectoryRepository.findDirectory();

  if (
    !canAcknowledgeForRecipient(
      input.actor,
      providerDirectory,
      input.expectedRecipientOrganizationId
    )
  ) {
    sendAcknowledgementForbidden(
      input.reply,
      input.request,
      input.actor,
      "Actor gửi callback không thuộc cơ sở y tế nhận hồ sơ hoặc không phải tài khoản vận hành hệ thống."
    );
    return false;
  }

  return true;
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

function sendAcknowledgementForbidden(
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

function toAcknowledgementActor(actor: ActorContext) {
  return {
    id: actor.actorId,
    role: actor.role,
    purposeOfUse: actor.purposeOfUse
  };
}
