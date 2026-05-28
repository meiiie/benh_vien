import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateRecordTransferRequestSchema,
  MarkRecordTransferReceivedRequestSchema,
  MarkRecordTransferSentRequestSchema,
  PatientRecordTransfersParamsSchema,
  RecordTransferIdParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  mapRecordTransferToFhirTask,
  RecordTransfer
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export async function registerRecordTransferRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  recordTransferRepository: RecordTransferRepository,
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

  app.post("/patients/:patientId/record-transfers", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:create");

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

    const parsed = CreateRecordTransferRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const consent = await consentRepository.findById(parsed.data.consentReference);

    if (
      !consent?.allowsRecordSharing({
        patientId: params.patientId,
        granteeOrganizationId: parsed.data.recipientOrganizationId
      })
    ) {
      return reply.status(403).send({
        error: "CONSENT_DOES_NOT_ALLOW_RECORD_TRANSFER",
        message:
          "Không thể tạo yêu cầu chuyển hồ sơ nếu consent không tồn tại, hết hiệu lực hoặc không khớp đơn vị nhận."
      });
    }

    try {
      const recordTransfer = RecordTransfer.create({
        id: `record-transfer-${nanoid(10)}`,
        patientId: params.patientId,
        requestedByActorId: actor.actorId,
        bundleId: buildBundleId(params.patientId, parsed.data.bundleType),
        ...parsed.data
      });

      await recordTransferRepository.save(recordTransfer);
      await recordAuditEvent(auditRepository, request, {
        action: "record-transfer.create",
        resourceType: "RecordTransfer",
        resourceId: recordTransfer.id,
        patientId: recordTransfer.patientId,
        metadata: {
          status: recordTransfer.toSnapshot().status,
          bundleType: recordTransfer.toSnapshot().bundleType,
          bundleId: recordTransfer.toSnapshot().bundleId,
          consentReference: recordTransfer.toSnapshot().consentReference,
          recipientOrganizationId: recordTransfer.toSnapshot().recipientOrganizationId
        }
      });

      return reply.status(201).send(toRecordTransferResponse(recordTransfer));
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

  app.get("/record-transfers/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:read");

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
      action: "record-transfer.read",
      resourceType: "RecordTransfer",
      resourceId: recordTransfer.id,
      patientId: recordTransfer.patientId
    });

    return toRecordTransferResponse(recordTransfer);
  });

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

    const recordTransfer = await recordTransferRepository.findById(params.id);

    if (!recordTransfer) {
      return reply.status(404).send({
        error: "RECORD_TRANSFER_NOT_FOUND"
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

    try {
      recordTransfer.markSent(parsed.data);
      await recordTransferRepository.save(recordTransfer);
      await recordAuditEvent(auditRepository, request, {
        action: "record-transfer.send",
        resourceType: "RecordTransfer",
        resourceId: recordTransfer.id,
        patientId: recordTransfer.patientId,
        metadata: {
          status: recordTransfer.toSnapshot().status,
          sentAt: recordTransfer.toSnapshot().sentAt,
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

    const recordTransfer = await recordTransferRepository.findById(params.id);

    if (!recordTransfer) {
      return reply.status(404).send({
        error: "RECORD_TRANSFER_NOT_FOUND"
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

    try {
      recordTransfer.markReceived(parsed.data);
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

  app.get("/record-transfers/:id/fhir-task", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:fhir-export");

    if (!actor) {
      return;
    }

    const params = RecordTransferIdParamsSchema.parse(request.params);
    const recordTransfer = await recordTransferRepository.findById(params.id);

    if (!recordTransfer) {
      return reply.status(404).send({
        error: "RECORD_TRANSFER_NOT_FOUND"
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

function buildBundleId(patientId: string, bundleType: "collection" | "document"): string {
  return bundleType === "document"
    ? `patient-document-${patientId}`
    : `patient-record-${patientId}`;
}

function toRecordTransferResponse(recordTransfer: RecordTransfer): RecordTransferSnapshot {
  return recordTransfer.toSnapshot();
}
