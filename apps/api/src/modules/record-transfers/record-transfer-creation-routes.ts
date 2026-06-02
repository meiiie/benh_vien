import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateRecordTransferRequestSchema,
  PatientRecordTransfersParamsSchema
} from "@benh-vien-so/contracts";
import { RecordTransfer } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendValidationErrorResponse } from "../http/http-validation-error-response.js";
import { sendRecordTransferDomainError } from "./record-transfer-command-route-helpers.js";
import { resolveRecordTransferFhirEndpoint } from "./record-transfer-fhir-endpoint-resolver.js";
import { validateRecordTransferEndpointForDelivery } from "./record-transfer-endpoint-policy.js";
import {
  buildBundleId,
  toRecordTransferResponse
} from "./record-transfer-route-helpers.js";

export async function registerRecordTransferCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  recordTransferRepository: RecordTransferRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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
      return sendValidationErrorResponse(reply, {
        error: "RECORD_TRANSFER_ENDPOINT_NOT_FOUND",
        message:
          "Đơn vị nhận chưa có endpoint FHIR REST đang hoạt động và hỗ trợ Bundle trong Provider Directory."
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
      if (sendRecordTransferDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
