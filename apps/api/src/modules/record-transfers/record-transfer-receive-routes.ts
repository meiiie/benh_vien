import type { FastifyInstance } from "fastify";
import {
  MarkRecordTransferReceivedRequestSchema,
  RecordTransferIdParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  sendRecordTransferDomainError,
  toReceiveAuditMetadata
} from "./record-transfer-command-route-helpers.js";
import { buildAcknowledgementReference } from "./record-transfer-acknowledgement-reference.js";
import { loadRecordTransferForPatientAccess } from "./record-transfer-route-access.js";
import { toRecordTransferResponse } from "./record-transfer-route-helpers.js";

export async function registerRecordTransferReceiveRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  recordTransferRepository: RecordTransferRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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
        metadata: toReceiveAuditMetadata(recordTransfer)
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
