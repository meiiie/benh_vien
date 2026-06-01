import type { FastifyInstance } from "fastify";
import { ClinicalDocumentIdParamsSchema } from "@benh-vien-so/contracts";
import { DomainError } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";
import { toClinicalDocumentResponse } from "./clinical-document-route-helpers.js";

export async function registerClinicalDocumentCommandRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  documentRepository: ClinicalDocumentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/clinical-documents/:id/sign", async (request, reply) => {
    const actor = requirePermission(request, reply, "clinical-document:sign");

    if (!actor) {
      return;
    }

    const params = ClinicalDocumentIdParamsSchema.parse(request.params);
    const document = await documentRepository.findById(params.id);

    if (!document) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 404,
        code: "not-found",
        diagnostics: `ClinicalDocument/${params.id} không tồn tại để xuất DocumentReference.`,
        expression: ["DocumentReference.id"],
        details: {
          code: "CLINICAL_DOCUMENT_NOT_FOUND",
          display: "Clinical document not found",
          text: "Không tìm thấy tài liệu bệnh án cần xuất FHIR."
        }
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        document.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    try {
      document.sign();
      await documentRepository.save(document);
      await recordAuditEvent(auditRepository, request, {
        action: "clinical-document.sign",
        resourceType: "ClinicalDocument",
        resourceId: document.id,
        patientId: document.patientId,
        metadata: {
          status: document.status
        }
      });

      return toClinicalDocumentResponse(document);
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "CLINICAL_DOCUMENT_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });
}
