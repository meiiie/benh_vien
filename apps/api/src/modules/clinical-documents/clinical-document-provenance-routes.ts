import type { FastifyInstance } from "fastify";
import { ClinicalDocumentIdParamsSchema } from "@benh-vien-so/contracts";
import {
  DomainError,
  mapClinicalDocumentToFhirProvenance
} from "@benh-vien-so/domain";
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

export async function registerClinicalDocumentProvenanceRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  documentRepository: ClinicalDocumentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/clinical-documents/:id/fhir-provenance", async (request, reply) => {
    const actor = requirePermission(request, reply, "clinical-document:fhir-export");

    if (!actor) {
      return;
    }

    const params = ClinicalDocumentIdParamsSchema.parse(request.params);
    const document = await documentRepository.findById(params.id);

    if (!document) {
      return reply.status(404).send({
        error: "CLINICAL_DOCUMENT_NOT_FOUND"
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
      const provenance = mapClinicalDocumentToFhirProvenance(document);
      await recordAuditEvent(auditRepository, request, {
        action: "clinical-document.provenance-export",
        resourceType: "ClinicalDocument",
        resourceId: document.id,
        patientId: document.patientId,
        metadata: {
          standard: "HL7 FHIR R4",
          resourceType: "Provenance",
          targetResourceType: "DocumentReference",
          documentStatus: document.status
        }
      });

      return provenance;
    } catch (error) {
      if (error instanceof DomainError) {
        return sendFhirOperationOutcome(reply, {
          statusCode: 422,
          code: "business-rule",
          diagnostics: error.message,
          expression: ["Provenance.recorded", "Provenance.agent"],
          details: {
            code: "CLINICAL_DOCUMENT_PROVENANCE_ERROR",
            display: "Clinical document provenance error",
            text: "Không thể xuất Provenance cho tài liệu chưa đủ điều kiện."
          }
        });
      }

      throw error;
    }
  });
}
