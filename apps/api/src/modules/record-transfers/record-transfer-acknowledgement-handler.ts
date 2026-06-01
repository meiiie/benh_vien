import type { FastifyReply, FastifyRequest } from "fastify";
import { requirePermission } from "../access-control/access-context.js";
import {
  ensureAcknowledgementCallbackAccess,
  sendAcknowledgementSignatureFailure
} from "./record-transfer-acknowledgement-policy.js";
import {
  acceptRecordTransferAcknowledgementCallback,
  handleCompletedAcknowledgementCallback
} from "./record-transfer-acknowledgement-outcomes.js";
import { parseRecordTransferAcknowledgementCallbackRequest } from "./record-transfer-acknowledgement-request.js";
import type { RecordTransferAcknowledgementRouteDependencies } from "./record-transfer-acknowledgement-route-dependencies.js";
import { sendRecordTransferDomainError } from "./record-transfer-command-route-helpers.js";

export async function handleRecordTransferAcknowledgementCallback(
  request: FastifyRequest,
  reply: FastifyReply,
  dependencies: RecordTransferAcknowledgementRouteDependencies
) {
  const actor = requirePermission(request, reply, "record-transfer:acknowledge");

  if (!actor) {
    return;
  }

  const { recordTransferId, callback, signatureVerification } =
    parseRecordTransferAcknowledgementCallbackRequest(request);

  if (
    sendAcknowledgementSignatureFailure(
      reply,
      request,
      actor,
      signatureVerification
    )
  ) {
    return;
  }

  const recordTransfer =
    await dependencies.recordTransferRepository.findById(recordTransferId);

  if (!recordTransfer) {
    return reply.status(404).send({
      error: "RECORD_TRANSFER_NOT_FOUND"
    });
  }

  const snapshot = recordTransfer.toSnapshot();
  const allowed = await ensureAcknowledgementCallbackAccess({
    reply,
    request,
    actor,
    providerDirectoryRepository: dependencies.providerDirectoryRepository,
    callbackRecipientOrganizationId: callback.recipientOrganizationId,
    expectedRecipientOrganizationId: snapshot.recipientOrganizationId
  });

  if (!allowed) {
    return;
  }

  try {
    const completedResponse = await handleCompletedAcknowledgementCallback({
      reply,
      request,
      auditRepository: dependencies.auditRepository,
      recordTransfer,
      snapshot,
      callback,
      signatureVerification
    });

    if (completedResponse) {
      return completedResponse;
    }

    return await acceptRecordTransferAcknowledgementCallback({
      recordTransferRepository: dependencies.recordTransferRepository,
      auditRepository: dependencies.auditRepository,
      request,
      recordTransfer,
      actor,
      callback,
      signatureVerification
    });
  } catch (error) {
    if (sendRecordTransferDomainError(reply, error)) {
      return;
    }

    throw error;
  }
}
