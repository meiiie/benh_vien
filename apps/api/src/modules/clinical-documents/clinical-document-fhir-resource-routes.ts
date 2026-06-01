import type { FastifyInstance } from "fastify";
import { ClinicalDocumentIdParamsSchema } from "@benh-vien-so/contracts";
import { mapClinicalDocumentToFhir } from "@benh-vien-so/domain";
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

export async function registerClinicalDocumentFhirResourceRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  documentRepository: ClinicalDocumentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/clinical-documents/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "clinical-document:fhir-export");

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
          text: "Không tìm thấy tài liệu bệnh án cần xuất DocumentReference."
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

    await recordAuditEvent(auditRepository, request, {
      action: "clinical-document.fhir-export",
      resourceType: "ClinicalDocument",
      resourceId: document.id,
      patientId: document.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "DocumentReference"
      }
    });

    return mapClinicalDocumentToFhir(document);
  });
}
