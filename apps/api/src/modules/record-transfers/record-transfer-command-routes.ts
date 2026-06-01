import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  MarkRecordTransferFailedRequestSchema,
  MarkRecordTransferReceivedRequestSchema,
  MarkRecordTransferSentRequestSchema,
  RecordTransferIdParamsSchema,
  RetryRecordTransferRequestSchema
} from "@benh-vien-so/contracts";
import { DomainError } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { validateRecordTransferEndpointForDelivery } from "./record-transfer-endpoint-policy.js";
import { loadRecordTransferForPatientAccess } from "./record-transfer-route-access.js";
import {
  buildAcknowledgementReference,
  queueRecordTransferDeliveryAttempt,
  resolveRecordTransferFhirEndpoint,
  toRecordTransferResponse
} from "./record-transfer-route-helpers.js";

export async function registerRecordTransferCommandRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  recordTransferRepository: RecordTransferRepository,
  deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/record-transfers/:id/send", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:update");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const parsed = MarkRecordTransferSentRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      throw parsed.error;
    }

    const recordTransfer = await loadRecordTransferForPatientAccess({
      request,
      reply,
      actor,
      recordTransferId: params.id,
      recordTransferRepository,
      patientRepository,
      providerDirectoryRepository
    });

    if (!recordTransfer) {
      return;
    }

    const targetEndpoint = await resolveRecordTransferFhirEndpoint(
      providerDirectoryRepository,
      recordTransfer.toSnapshot().recipientOrganizationId
    );

    if (!targetEndpoint) {
      return reply.status(422).send({
        error: "RECORD_TRANSFER_ENDPOINT_NOT_FOUND",
        message:
          "Không thể gửi gói hồ sơ vì đơn vị nhận chưa có endpoint FHIR REST đang hoạt động và hỗ trợ Bundle."
      });
    }

    const endpointPolicy = validateRecordTransferEndpointForDelivery({
      endpointAddress: targetEndpoint.address
    });

    if (!endpointPolicy.allowed) {
      return reply.status(422).send({
        error: endpointPolicy.error,
        message: endpointPolicy.message
      });
    }

    try {
      recordTransfer.markSent(parsed.data);
      const deliveryAttempt = await queueRecordTransferDeliveryAttempt({
        recordTransferRepository,
        deliveryAttemptRepository,
        recordTransfer,
        targetEndpoint,
        id: `record-transfer-delivery-${nanoid(10)}`
      });

      await recordAuditEvent(auditRepository, request, {
        action: "record-transfer.send",
        resourceType: "RecordTransfer",
        resourceId: recordTransfer.id,
        patientId: recordTransfer.patientId,
        metadata: {
          status: recordTransfer.toSnapshot().status,
          sentAt: recordTransfer.toSnapshot().sentAt,
          recipientOrganizationId: recordTransfer.toSnapshot().recipientOrganizationId,
          targetEndpointId: targetEndpoint.id,
          targetEndpointAddress: targetEndpoint.address,
          deliveryAttemptId: deliveryAttempt.id,
          deliveryAttemptNumber: deliveryAttempt.toSnapshot().attemptNumber,
          deliveryIdempotencyKey: deliveryAttempt.toSnapshot().idempotencyKey
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

  app.post("/record-transfers/:id/receive", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:update");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const parsed = MarkRecordTransferReceivedRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      throw parsed.error;
    }

    const recordTransfer = await loadRecordTransferForPatientAccess({
      request,
      reply,
      actor,
      recordTransferId: params.id,
      recordTransferRepository,
      patientRepository,
      providerDirectoryRepository
    });

    if (!recordTransfer) {
      return;
    }

    try {
      const receivedAt = parsed.data.receivedAt ?? new Date().toISOString();
      const receivedByActorId = parsed.data.receivedByActorId ?? actor.actorId;
      const acknowledgementReference =
        parsed.data.acknowledgementReference ??
        buildAcknowledgementReference({
          recordTransferId: recordTransfer.id,
          receivedByActorId,
          receivedAt
        });

      recordTransfer.markReceived({
        ...parsed.data,
        receivedAt,
        receivedByActorId,
        acknowledgementReference
      });
      await recordTransferRepository.save(recordTransfer);
      await recordAuditEvent(auditRepository, request, {
        action: "record-transfer.receive",
        resourceType: "RecordTransfer",
        resourceId: recordTransfer.id,
        patientId: recordTransfer.patientId,
        metadata: {
          status: recordTransfer.toSnapshot().status,
          sentAt: recordTransfer.toSnapshot().sentAt,
          receivedAt: recordTransfer.toSnapshot().receivedAt,
          receivedByActorId: recordTransfer.toSnapshot().receivedByActorId,
          acknowledgementReference: recordTransfer.toSnapshot().acknowledgementReference,
          recipientOrganizationId: recordTransfer.toSnapshot().recipientOrganizationId
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

  app.post("/record-transfers/:id/fail", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:update");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const parsed = MarkRecordTransferFailedRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      throw parsed.error;
    }

    const recordTransfer = await loadRecordTransferForPatientAccess({
      request,
      reply,
      actor,
      recordTransferId: params.id,
      recordTransferRepository,
      patientRepository,
      providerDirectoryRepository
    });

    if (!recordTransfer) {
      return;
    }

    try {
      recordTransfer.markFailed(parsed.data);
      await recordTransferRepository.save(recordTransfer);
      await recordAuditEvent(auditRepository, request, {
        action: "record-transfer.fail",
        resourceType: "RecordTransfer",
        resourceId: recordTransfer.id,
        patientId: recordTransfer.patientId,
        metadata: {
          status: recordTransfer.toSnapshot().status,
          failedAt: recordTransfer.toSnapshot().failedAt,
          failureReason: recordTransfer.toSnapshot().failureReason,
          nextRetryAt: recordTransfer.toSnapshot().nextRetryAt,
          retryCount: recordTransfer.toSnapshot().retryCount,
          recipientOrganizationId: recordTransfer.toSnapshot().recipientOrganizationId
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

  app.post("/record-transfers/:id/retry", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:update");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const parsed = RetryRecordTransferRequestSchema.safeParse(request.body ?? {});

    if (!parsed.success) {
      throw parsed.error;
    }

    const recordTransfer = await loadRecordTransferForPatientAccess({
      request,
      reply,
      actor,
      recordTransferId: params.id,
      recordTransferRepository,
      patientRepository,
      providerDirectoryRepository
    });

    if (!recordTransfer) {
      return;
    }

    try {
      const previousFailureReason = recordTransfer.toSnapshot().failureReason;
      recordTransfer.retry(parsed.data);
      await recordTransferRepository.save(recordTransfer);
      await recordAuditEvent(auditRepository, request, {
        action: "record-transfer.retry",
        resourceType: "RecordTransfer",
        resourceId: recordTransfer.id,
        patientId: recordTransfer.patientId,
        metadata: {
          status: recordTransfer.toSnapshot().status,
          retryCount: recordTransfer.toSnapshot().retryCount,
          previousFailureReason,
          recipientOrganizationId: recordTransfer.toSnapshot().recipientOrganizationId
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
