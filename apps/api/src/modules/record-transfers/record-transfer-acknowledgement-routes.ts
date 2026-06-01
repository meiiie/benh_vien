import type { FastifyInstance } from "fastify";
import {
  RecordTransferAcknowledgementCallbackRequestSchema,
  RecordTransferIdParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import {
  recordAcceptedAcknowledgementCallbackAudit,
  recordDuplicateAcknowledgementCallbackAudit
} from "./record-transfer-acknowledgement-audit.js";
import {
  ensureAcknowledgementCallbackAccess,
  sendAcknowledgementConflict,
  sendAcknowledgementSignatureFailure
} from "./record-transfer-acknowledgement-policy.js";
import { verifyRecordTransferCallbackSignature } from "./record-transfer-callback-signature.js";
import { sendRecordTransferDomainError } from "./record-transfer-command-route-helpers.js";
import { toRecordTransferResponse } from "./record-transfer-route-helpers.js";

export async function registerRecordTransferAcknowledgementRoutes(
  app: FastifyInstance,
  recordTransferRepository: RecordTransferRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/record-transfers/:id/acknowledgement-callback", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:acknowledge");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const parsed = RecordTransferAcknowledgementCallbackRequestSchema.safeParse(
      request.body ?? {}
    );

    if (!parsed.success) {
      throw parsed.error;
    }

    const callback = parsed.data;
    const signatureVerification = verifyRecordTransferCallbackSignature({
      headers: request.headers,
      recordTransferId: params.id,
      body: request.body
    });

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

    const recordTransfer = await recordTransferRepository.findById(params.id);

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
      providerDirectoryRepository,
      callbackRecipientOrganizationId: callback.recipientOrganizationId,
      expectedRecipientOrganizationId: snapshot.recipientOrganizationId
    });

    if (!allowed) {
      return;
    }

    try {
      if (snapshot.status === "completed") {
        if (snapshot.acknowledgementReference === callback.acknowledgementReference) {
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

        return sendAcknowledgementConflict(reply, request.id);
      }

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
    } catch (error) {
      if (sendRecordTransferDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
