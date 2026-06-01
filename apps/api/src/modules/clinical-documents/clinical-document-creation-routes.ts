import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateClinicalDocumentRequestSchema,
  PatientDocumentsParamsSchema
} from "@benh-vien-so/contracts";
import { ClinicalDocument, DomainError } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  toClinicalDocumentResponse,
  validateClinicalDocumentReferences
} from "./clinical-document-route-helpers.js";

export async function registerClinicalDocumentCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  documentRepository: ClinicalDocumentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/documents", async (request, reply) => {
    const actor = requirePermission(request, reply, "clinical-document:create");

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

    const parsed = CreateClinicalDocumentRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateClinicalDocumentReferences({
      patientId: params.patientId,
      command: parsed.data,
      encounterRepository
    });

    if (validationError) {
      return reply.status(422).send(validationError);
    }

    try {
      const document = ClinicalDocument.create({
        id: `clinical-document-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await documentRepository.save(document);
      await recordAuditEvent(auditRepository, request, {
        action: "clinical-document.create",
        resourceType: "ClinicalDocument",
        resourceId: document.id,
        patientId: document.patientId,
        metadata: {
          documentType: document.toSnapshot().type,
          encounterId: document.toSnapshot().encounterId
        }
      });

      return reply.status(201).send(toClinicalDocumentResponse(document));
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
