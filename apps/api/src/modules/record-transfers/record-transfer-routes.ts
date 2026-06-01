import type { FastifyInstance } from "fastify";
import {
  PatientRecordTransfersParamsSchema,
  RecordTransferIdParamsSchema
} from "@benh-vien-so/contracts";
import {
  mapRecordTransferToFhirTask
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";
import { registerRecordTransferAcknowledgementRoutes } from "./record-transfer-acknowledgement-routes.js";
import { registerRecordTransferCommandRoutes } from "./record-transfer-command-routes.js";
import { registerRecordTransferCreationRoutes } from "./record-transfer-creation-routes.js";
import { loadRecordTransferForPatientAccess } from "./record-transfer-route-access.js";
import {
  toDeliveryAttemptResponse,
  toRecordTransferResponse
} from "./record-transfer-route-helpers.js";

export async function registerRecordTransferRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  recordTransferRepository: RecordTransferRepository,
  deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/record-transfers", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:list");

    if (!actor) {
      return;
    }

    const params = PatientRecordTransfersParamsSchema.parse(request.params);
    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        params.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    const recordTransfers = await recordTransferRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "record-transfer.list",
      resourceType: "RecordTransfer",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: recordTransfers.length
      }
    });

    return {
      items: recordTransfers.map(toRecordTransferResponse)
    };
  });

  await registerRecordTransferCreationRoutes(
    app,
    patientRepository,
    consentRepository,
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  );

  app.get("/record-transfers/:id/delivery-attempts", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:read");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
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

    const attempts = await deliveryAttemptRepository.findByRecordTransferId(
      recordTransfer.id
    );
    await recordAuditEvent(auditRepository, request, {
      action: "record-transfer.read",
      resourceType: "RecordTransfer",
      resourceId: recordTransfer.id,
      patientId: recordTransfer.patientId,
      metadata: {
        readModel: "delivery-attempts",
        returnedCount: attempts.length
      }
    });

    return {
      items: attempts.map(toDeliveryAttemptResponse)
    };
  });

  app.get("/record-transfers/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:read");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const recordTransfer = await loadRecordTransferForPatientAccess({
      request,
      reply,
      actor,
      recordTransferId: params.id,
      recordTransferRepository,
      patientRepository,
      providerDirectoryRepository,
      notFoundMessage: "Không tìm thấy yêu cầu chuyển hồ sơ."
    });

    if (!recordTransfer) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "record-transfer.read",
      resourceType: "RecordTransfer",
      resourceId: recordTransfer.id,
      patientId: recordTransfer.patientId
    });

    return toRecordTransferResponse(recordTransfer);
  });

  await registerRecordTransferCommandRoutes(
    app,
    patientRepository,
    recordTransferRepository,
    deliveryAttemptRepository,
    providerDirectoryRepository,
    auditRepository
  );

  await registerRecordTransferAcknowledgementRoutes(
    app,
    recordTransferRepository,
    providerDirectoryRepository,
    auditRepository
  );

  app.get("/record-transfers/:id/fhir-task", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:fhir-export");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const recordTransfer = await recordTransferRepository.findById(params.id);

    if (!recordTransfer) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 404,
        code: "not-found",
        diagnostics: `RecordTransfer/${params.id} không tồn tại để xuất FHIR Task.`,
        expression: ["Task.id"],
        details: {
          code: "RECORD_TRANSFER_NOT_FOUND",
          display: "Record transfer not found",
          text: "Không tìm thấy yêu cầu chuyển hồ sơ cần xuất FHIR Task."
        }
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        recordTransfer.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "record-transfer.fhir-export",
      resourceType: "RecordTransfer",
      resourceId: recordTransfer.id,
      patientId: recordTransfer.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Task",
        bundleId: recordTransfer.toSnapshot().bundleId,
        consentReference: recordTransfer.toSnapshot().consentReference
      }
    });

    return mapRecordTransferToFhirTask(recordTransfer);
  });
}
