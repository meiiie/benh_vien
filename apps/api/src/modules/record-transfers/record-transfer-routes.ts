import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateRecordTransferRequestSchema,
  MarkRecordTransferFailedRequestSchema,
  MarkRecordTransferReceivedRequestSchema,
  MarkRecordTransferSentRequestSchema,
  PatientRecordTransfersParamsSchema,
  RecordTransferAcknowledgementCallbackRequestSchema,
  RecordTransferIdParamsSchema,
  RetryRecordTransferRequestSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  mapRecordTransferToFhirTask,
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "@benh-vien-so/domain";
import type {
  ActorContext,
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectory,
  ProviderEndpointSnapshot,
  ProviderDirectoryRepository,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferRepository,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";
import { verifyRecordTransferCallbackSignature } from "./record-transfer-callback-signature.js";
import { validateRecordTransferEndpointForDelivery } from "./record-transfer-endpoint-policy.js";

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

    const targetEndpoint = await resolveRecordTransferFhirEndpoint(
      providerDirectoryRepository,
      parsed.data.recipientOrganizationId
    );

    if (!targetEndpoint) {
      return reply.status(422).send({
        error: "RECORD_TRANSFER_ENDPOINT_NOT_FOUND",
        message:
          "Đơn vị nhận chưa có endpoint FHIR REST đang hoạt động và hỗ trợ Bundle trong Provider Directory."
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
      const recordTransfer = RecordTransfer.create({
        ...parsed.data,
        id: `record-transfer-${nanoid(10)}`,
        patientId: params.patientId,
        status: "requested",
        requestedByActorId: actor.actorId,
        bundleId: buildBundleId(params.patientId, parsed.data.bundleType)
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
          recipientOrganizationId: recordTransfer.toSnapshot().recipientOrganizationId,
          targetEndpointId: targetEndpoint.id,
          targetEndpointAddress: targetEndpoint.address
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

  app.get("/record-transfers/:id/delivery-attempts", async (request, reply) => {
    const actor = requirePermission(request, reply, "record-transfer:read");

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
    const recordTransfer = await recordTransferRepository.findById(params.id);

    if (!recordTransfer) {
      return reply.status(404).send({
        error: "RECORD_TRANSFER_NOT_FOUND",
        message: "Không tìm thấy yêu cầu chuyển hồ sơ."
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
      const snapshot = recordTransfer.toSnapshot();
      const existingAttempts = await deliveryAttemptRepository.findByRecordTransferId(
        recordTransfer.id
      );
      const attemptNumber = existingAttempts.length + 1;
      const queuedAt = snapshot.sentAt ?? new Date().toISOString();
      const deliveryAttempt = RecordTransferDeliveryAttempt.queue({
        id: `record-transfer-delivery-${nanoid(10)}`,
        recordTransferId: snapshot.id,
        patientId: snapshot.patientId,
        targetEndpointId: targetEndpoint.id,
        targetEndpointAddress: targetEndpoint.address,
        bundleId: snapshot.bundleId,
        bundleType: snapshot.bundleType,
        idempotencyKey: buildDeliveryIdempotencyKey({
          recordTransferId: snapshot.id,
          attemptNumber,
          bundleId: snapshot.bundleId,
          targetEndpointId: targetEndpoint.id,
          queuedAt
        }),
        attemptNumber,
        queuedAt
      });

      await saveRecordTransferWithDeliveryAttempt(
        recordTransferRepository,
        deliveryAttemptRepository,
        recordTransfer,
        deliveryAttempt
      );
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

function buildBundleId(patientId: string, bundleType: "collection" | "document"): string {
  return bundleType === "document"
    ? `patient-document-${patientId}`
    : `patient-record-${patientId}`;
}

function toRecordTransferResponse(recordTransfer: RecordTransfer): RecordTransferSnapshot {
  return recordTransfer.toSnapshot();
}

function toDeliveryAttemptResponse(
  deliveryAttempt: RecordTransferDeliveryAttempt
): RecordTransferDeliveryAttemptSnapshot {
  return deliveryAttempt.toSnapshot();
}

async function resolveRecordTransferFhirEndpoint(
  providerDirectoryRepository: ProviderDirectoryRepository,
  recipientOrganizationId: string
): Promise<ProviderEndpointSnapshot | undefined> {
  const providerDirectory = await providerDirectoryRepository.findDirectory();
  return findRecordTransferFhirEndpoint(providerDirectory, recipientOrganizationId);
}

function findRecordTransferFhirEndpoint(
  providerDirectory: ProviderDirectory,
  recipientOrganizationId: string
): ProviderEndpointSnapshot | undefined {
  return providerDirectory
    .toSnapshot()
    .endpoints.find(
      (endpoint) =>
        endpoint.managingOrganizationId === recipientOrganizationId &&
        endpoint.status === "active" &&
        endpoint.connectionType === "hl7-fhir-rest" &&
        endpoint.payloadTypes.some(
          (payloadType) =>
            payloadType.system === "http://hl7.org/fhir/resource-types" &&
            payloadType.code === "Bundle"
        )
    );
}

function canAcknowledgeForRecipient(
  actor: ActorContext,
  providerDirectory: ProviderDirectory,
  recipientOrganizationId: string
): boolean {
  if (actor.role === "admin") {
    return true;
  }

  const snapshot = providerDirectory.toSnapshot();
  return snapshot.practitionerRoles.some(
    (role) =>
      role.active &&
      role.practitionerId === actor.actorId &&
      organizationIsSameOrChild(
        role.organizationId,
        recipientOrganizationId,
        snapshot.organizations
      )
  );
}

function organizationIsSameOrChild(
  organizationId: string,
  expectedOrganizationId: string,
  organizations: ReturnType<ProviderDirectory["toSnapshot"]>["organizations"]
): boolean {
  let currentOrganizationId: string | undefined = organizationId;

  while (currentOrganizationId) {
    if (currentOrganizationId === expectedOrganizationId) {
      return true;
    }

    currentOrganizationId = organizations.find(
      (organization) => organization.id === currentOrganizationId
    )?.partOfOrganizationId;
  }

  return false;
}

function buildDeliveryIdempotencyKey(input: {
  readonly recordTransferId: string;
  readonly attemptNumber: number;
  readonly bundleId: string;
  readonly targetEndpointId: string;
  readonly queuedAt: string;
}): string {
  const hash = createHash("sha256")
    .update(
      [
        input.recordTransferId,
        String(input.attemptNumber),
        input.bundleId,
        input.targetEndpointId,
        input.queuedAt
      ].join("|")
    )
    .digest("hex");

  return `wiiicare-record-transfer-${hash}`;
}

type TransactionalRecordTransferRepository = RecordTransferRepository & {
  saveWithDeliveryAttempt(
    recordTransfer: RecordTransfer,
    deliveryAttempt: RecordTransferDeliveryAttempt
  ): Promise<void>;
};

async function saveRecordTransferWithDeliveryAttempt(
  recordTransferRepository: RecordTransferRepository,
  deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository,
  recordTransfer: RecordTransfer,
  deliveryAttempt: RecordTransferDeliveryAttempt
): Promise<void> {
  if (isTransactionalRecordTransferRepository(recordTransferRepository)) {
    await recordTransferRepository.saveWithDeliveryAttempt(recordTransfer, deliveryAttempt);
    return;
  }

  const previousRecordTransfer = await recordTransferRepository.findById(recordTransfer.id);
  await recordTransferRepository.save(recordTransfer);

  try {
    await deliveryAttemptRepository.save(deliveryAttempt);
  } catch (error) {
    if (previousRecordTransfer) {
      await recordTransferRepository.save(previousRecordTransfer);
    }

    throw error;
  }
}

function isTransactionalRecordTransferRepository(
  repository: RecordTransferRepository
): repository is TransactionalRecordTransferRepository {
  return (
    typeof (repository as Partial<TransactionalRecordTransferRepository>)
      .saveWithDeliveryAttempt === "function"
  );
}

function buildAcknowledgementReference(input: {
  readonly recordTransferId: string;
  readonly receivedByActorId: string;
  readonly receivedAt: string;
}): string {
  const hash = createHash("sha256")
    .update([input.recordTransferId, input.receivedByActorId, input.receivedAt].join("|"))
    .digest("hex")
    .slice(0, 32);

  return `wiiicare-record-transfer-ack-${hash}`;
}

function toCallbackSignatureAuditMetadata(input: ReturnType<
  typeof verifyRecordTransferCallbackSignature
>): {
  readonly callbackSignatureRequired: boolean;
  readonly callbackSignatureVerified: boolean;
  readonly callbackSignatureTimestamp?: string;
  readonly callbackSignatureAlgorithm?: string;
  readonly callbackSignatureKeyId?: string;
} {
  return {
    callbackSignatureRequired: input.required,
    callbackSignatureVerified: input.verified,
    callbackSignatureTimestamp: input.timestamp,
    callbackSignatureAlgorithm: input.algorithm,
    callbackSignatureKeyId: input.keyId
  };
}
