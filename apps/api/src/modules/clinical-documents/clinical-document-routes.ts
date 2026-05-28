import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  ClinicalDocumentIdParamsSchema,
  CreateClinicalDocumentRequestSchema,
  PatientDocumentsParamsSchema
} from "@benh-vien-so/contracts";
import {
  ClinicalDocument,
  DomainError,
  mapClinicalDocumentToFhir,
  mapClinicalDocumentToFhirProvenance
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  ClinicalDocumentSnapshot,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export async function registerClinicalDocumentRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
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

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Tài liệu phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
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
        diagnostics: `ClinicalDocument/${params.id} không tồn tại để xuất Provenance.`,
        expression: ["Provenance.target.reference"],
        details: {
          code: "CLINICAL_DOCUMENT_NOT_FOUND",
          display: "Clinical document not found",
          text: "Không tìm thấy tài liệu bệnh án cần xuất Provenance."
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

function toClinicalDocumentResponse(document: ClinicalDocument): ClinicalDocumentSnapshot {
  return document.toSnapshot();
}
