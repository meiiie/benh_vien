import type { FastifyInstance } from "fastify";
import { PatientDocumentsParamsSchema } from "@benh-vien-so/contracts";
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
import { toClinicalDocumentResponse } from "./clinical-document-route-helpers.js";

export async function registerClinicalDocumentQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  documentRepository: ClinicalDocumentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/documents", async (request, reply) => {
    const actor = requirePermission(request, reply, "clinical-document:list");

    if (!actor) {
      return;
    }

    const params = PatientDocumentsParamsSchema.parse(request.params);
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

    const documents = await documentRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "clinical-document.list",
      resourceType: "ClinicalDocument",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: documents.length
      }
    });

    return {
      items: documents.map(toClinicalDocumentResponse)
    };
  });
}
