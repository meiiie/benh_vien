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
  mapClinicalDocumentToFhir
} from "@benh-vien-so/domain";
import type {
  ClinicalDocumentRepository,
  ClinicalDocumentSnapshot,
  PatientRepository
} from "@benh-vien-so/domain";

export async function registerClinicalDocumentRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  documentRepository: ClinicalDocumentRepository
): Promise<void> {
  app.get("/patients/:patientId/documents", async (request, reply) => {
    const params = PatientDocumentsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const documents = await documentRepository.findByPatientId(params.patientId);

    return {
      items: documents.map(toClinicalDocumentResponse)
    };
  });

  app.post("/patients/:patientId/documents", async (request, reply) => {
    const params = PatientDocumentsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateClinicalDocumentRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_CLINICAL_DOCUMENT_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    try {
      const document = ClinicalDocument.create({
        id: `clinical-document-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await documentRepository.save(document);

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
    const params = ClinicalDocumentIdParamsSchema.parse(request.params);
    const document = await documentRepository.findById(params.id);

    if (!document) {
      return reply.status(404).send({
        error: "CLINICAL_DOCUMENT_NOT_FOUND"
      });
    }

    try {
      document.sign();
      await documentRepository.save(document);

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
    const params = ClinicalDocumentIdParamsSchema.parse(request.params);
    const document = await documentRepository.findById(params.id);

    if (!document) {
      return reply.status(404).send({
        error: "CLINICAL_DOCUMENT_NOT_FOUND"
      });
    }

    return mapClinicalDocumentToFhir(document);
  });
}

function toClinicalDocumentResponse(document: ClinicalDocument): ClinicalDocumentSnapshot {
  return document.toSnapshot();
}
