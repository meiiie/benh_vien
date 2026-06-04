import type { FastifyInstance } from "fastify";
import { RecordTransferIdParamsSchema } from "@benh-vien-so/contracts";
import { mapRecordTransferToFhirTask } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export async function registerRecordTransferFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  recordTransferRepository: RecordTransferRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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
