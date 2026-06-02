import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { canAcknowledgeForRecipient } from "./record-transfer-acknowledgement-recipient-policy.js";
import { sendAcknowledgementForbidden } from "./record-transfer-acknowledgement-responses.js";

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
