import type { FastifyInstance } from "fastify";
import {
  RecordTransferAcknowledgementCallbackRequestSchema,
  RecordTransferIdParamsSchema
} from "@benh-vien-so/contracts";
import { DomainError } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { verifyRecordTransferCallbackSignature } from "./record-transfer-callback-signature.js";
import {
  canAcknowledgeForRecipient,
  toCallbackSignatureAuditMetadata,
  toRecordTransferResponse
} from "./record-transfer-route-helpers.js";

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

    if (actor.purposeOfUse !== "OPERATIONS") {
      return reply.status(403).send({
        error: "FORBIDDEN",
        message:
          "Callback xác nhận nhận hồ sơ phải dùng x-purpose-of-use=OPERATIONS.",
        requestId: request.id,
        permission: "record-transfer:acknowledge",
        actor: {
          id: actor.actorId,
          role: actor.role,
          purposeOfUse: actor.purposeOfUse
        }
      });
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const parsed = RecordTransferAcknowledgementCallbackRequestSchema.safeParse(
      request.body ?? {}
    );

    if (!parsed.success) {
      throw parsed.error;
    }

    const signatureVerification = verifyRecordTransferCallbackSignature({
      headers: request.headers,
      recordTransferId: params.id,
      body: request.body
    });

    if (signatureVerification.required && !signatureVerification.verified) {
      return reply.status(signatureVerification.statusCode).send({
        error: signatureVerification.error,
        message: signatureVerification.message,
        requestId: request.id,
        permission: "record-transfer:acknowledge",
        actor: {
          id: actor.actorId,
          role: actor.role,
          purposeOfUse: actor.purposeOfUse
        }
      });
    }

    const recordTransfer = await recordTransferRepository.findById(params.id);

    if (!recordTransfer) {
      return reply.status(404).send({
        error: "RECORD_TRANSFER_NOT_FOUND"
      });
    }

    const snapshot = recordTransfer.toSnapshot();

    if (parsed.data.recipientOrganizationId !== snapshot.recipientOrganizationId) {
      return reply.status(403).send({
        error: "FORBIDDEN",
        message:
          "Callback xác nhận nhận hồ sơ không khớp cơ sở y tế nhận của gói chuyển.",
        requestId: request.id,
        permission: "record-transfer:acknowledge",
        actor: {
          id: actor.actorId,
          role: actor.role,
          purposeOfUse: actor.purposeOfUse
        }
      });
    }

    const providerDirectory = await providerDirectoryRepository.findDirectory();

    if (
      !canAcknowledgeForRecipient(
        actor,
        providerDirectory,
        snapshot.recipientOrganizationId
      )
    ) {
      return reply.status(403).send({
        error: "FORBIDDEN",
        message:
          "Actor gửi callback không thuộc cơ sở y tế nhận hồ sơ hoặc không phải tài khoản vận hành hệ thống.",
        requestId: request.id,
        permission: "record-transfer:acknowledge",
        actor: {
          id: actor.actorId,
          role: actor.role,
          purposeOfUse: actor.purposeOfUse
        }
      });
    }

    try {
      if (snapshot.status === "completed") {
        if (snapshot.acknowledgementReference === parsed.data.acknowledgementReference) {
          await recordAuditEvent(auditRepository, request, {
            action: "record-transfer.acknowledgement-callback",
            resourceType: "RecordTransfer",
            resourceId: recordTransfer.id,
            patientId: recordTransfer.patientId,
            metadata: {
              duplicateCallback: true,
              status: snapshot.status,
              receivedAt: snapshot.receivedAt,
              receivedByActorId: snapshot.receivedByActorId,
              acknowledgementReference: snapshot.acknowledgementReference,
              recipientOrganizationId: snapshot.recipientOrganizationId,
              targetEndpointId: parsed.data.targetEndpointId,
              deliveryIdempotencyKey: parsed.data.deliveryIdempotencyKey,
              ...toCallbackSignatureAuditMetadata(signatureVerification)
            }
          });

          return toRecordTransferResponse(recordTransfer);
        }

        return reply.status(409).send({
          error: "RECORD_TRANSFER_ALREADY_COMPLETED",
          message:
            "Gói chuyển hồ sơ đã hoàn tất bằng một biên nhận khác, không thể ghi đè bằng callback mới.",
          requestId: request.id
        });
      }

      const receivedAt = parsed.data.receivedAt ?? new Date().toISOString();
      const receivedByActorId = parsed.data.receivedByActorId ?? actor.actorId;

      recordTransfer.markReceived({
        receivedAt,
        receivedByActorId,
        acknowledgementReference: parsed.data.acknowledgementReference,
        note:
          parsed.data.note ??
          "Cơ sở y tế nhận đã xác nhận tiếp nhận qua callback liên thông."
      });
      await recordTransferRepository.save(recordTransfer);
      await recordAuditEvent(auditRepository, request, {
        action: "record-transfer.acknowledgement-callback",
        resourceType: "RecordTransfer",
        resourceId: recordTransfer.id,
        patientId: recordTransfer.patientId,
        metadata: {
          duplicateCallback: false,
          status: recordTransfer.toSnapshot().status,
          sentAt: recordTransfer.toSnapshot().sentAt,
          receivedAt: recordTransfer.toSnapshot().receivedAt,
          receivedByActorId: recordTransfer.toSnapshot().receivedByActorId,
          acknowledgementReference: recordTransfer.toSnapshot().acknowledgementReference,
          recipientOrganizationId: recordTransfer.toSnapshot().recipientOrganizationId,
          targetEndpointId: parsed.data.targetEndpointId,
          deliveryIdempotencyKey: parsed.data.deliveryIdempotencyKey,
          callbackActorId: actor.actorId,
          ...toCallbackSignatureAuditMetadata(signatureVerification)
        }
      });

      return toRecordTransferResponse(recordTransfer);
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "RECORD_TRANSFER_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });
}
