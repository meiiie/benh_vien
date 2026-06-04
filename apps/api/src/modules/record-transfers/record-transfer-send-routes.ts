import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  MarkRecordTransferSentRequestSchema,
  RecordTransferIdParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendValidationErrorResponse } from "../http/http-validation-error-response.js";
import { validateRecordTransferEndpointForDelivery } from "./record-transfer-endpoint-policy.js";
import {
  sendRecordTransferDomainError,
  toSendAuditMetadata
} from "./record-transfer-command-route-helpers.js";
import { queueRecordTransferDeliveryAttempt } from "./record-transfer-delivery-attempt-route-helpers.js";
import { resolveRecordTransferFhirEndpoint } from "./record-transfer-fhir-endpoint-resolver.js";
import { loadRecordTransferForPatientAccess } from "./record-transfer-route-access.js";
import { toRecordTransferResponse } from "./record-transfer-route-helpers.js";

export async function registerRecordTransferSendRoutes(
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
      return sendValidationErrorResponse(reply, {
        error: "RECORD_TRANSFER_ENDPOINT_NOT_FOUND",
        message:
          "Không thể gửi gói hồ sơ vì đơn vị nhận chưa có endpoint FHIR REST đang hoạt động và hỗ trợ Bundle."
      });
    }

    const endpointPolicy = validateRecordTransferEndpointForDelivery({
      endpointAddress: targetEndpoint.address
    });

    if (!endpointPolicy.allowed) {
      return sendValidationErrorResponse(reply, {
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
        metadata: toSendAuditMetadata(recordTransfer, targetEndpoint, deliveryAttempt)
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
