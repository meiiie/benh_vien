import type { FastifyInstance } from "fastify";
import {
  MarkRecordTransferFailedRequestSchema,
  RecordTransferIdParamsSchema,
  RetryRecordTransferRequestSchema
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
  toFailAuditMetadata,
  toRetryAuditMetadata
} from "./record-transfer-command-route-helpers.js";
import { loadRecordTransferForPatientAccess } from "./record-transfer-route-access.js";
import { toRecordTransferResponse } from "./record-transfer-route-helpers.js";

export async function registerRecordTransferFailureRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  recordTransferRepository: RecordTransferRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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
        metadata: toFailAuditMetadata(recordTransfer)
      });

      return toRecordTransferResponse(recordTransfer);
    } catch (error) {
      if (sendRecordTransferDomainError(reply, error)) {
        return;
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
        metadata: toRetryAuditMetadata(recordTransfer, previousFailureReason)
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
