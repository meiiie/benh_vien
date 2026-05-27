import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateImagingStudyRequestSchema,
  ImagingStudyIdParamsSchema,
  PatientImagingStudiesParamsSchema
} from "@benh-vien-so/contracts";
import { DomainError, ImagingStudy, mapImagingStudyToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ImagingStudyRepository,
  ImagingStudySnapshot,
  PatientRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerImagingStudyRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  imagingStudyRepository: ImagingStudyRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/imaging-studies", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:list");

    if (!actor) {
      return;
    }

    const params = PatientImagingStudiesParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const imagingStudies = await imagingStudyRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "imaging-study.list",
      resourceType: "ImagingStudy",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: imagingStudies.length
      }
    });

    return {
      items: imagingStudies.map(toImagingStudyResponse)
    };
  });

  app.post("/patients/:patientId/imaging-studies", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:create");

    if (!actor) {
      return;
    }

    const params = PatientImagingStudiesParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateImagingStudyRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_IMAGING_STUDY_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Nghiên cứu hình ảnh phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    if (parsed.data.basedOnServiceRequestId) {
      const serviceRequest = await serviceRequestRepository.findById(
        parsed.data.basedOnServiceRequestId
      );

      if (!serviceRequest || serviceRequest.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "SERVICE_REQUEST_MISMATCH",
          message: "Nghiên cứu hình ảnh phải tham chiếu y lệnh thuộc cùng bệnh nhân."
        });
      }
    }

    if (parsed.data.diagnosticReportId) {
      const diagnosticReport = await diagnosticReportRepository.findById(
        parsed.data.diagnosticReportId
      );

      if (!diagnosticReport || diagnosticReport.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "DIAGNOSTIC_REPORT_MISMATCH",
          message: "Nghiên cứu hình ảnh phải gắn với báo cáo kết quả thuộc cùng bệnh nhân."
        });
      }
    }

    try {
      const imagingStudy = ImagingStudy.record({
        id: `imaging-study-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await imagingStudyRepository.save(imagingStudy);
      await recordAuditEvent(auditRepository, request, {
        action: "imaging-study.create",
        resourceType: "ImagingStudy",
        resourceId: imagingStudy.id,
        patientId: imagingStudy.patientId,
        metadata: {
          studyInstanceUid: imagingStudy.toSnapshot().studyInstanceUid,
          accessionNumber: imagingStudy.toSnapshot().accessionNumber,
          basedOnServiceRequestId: imagingStudy.toSnapshot().basedOnServiceRequestId,
          diagnosticReportId: imagingStudy.toSnapshot().diagnosticReportId,
          numberOfSeries: imagingStudy.toSnapshot().numberOfSeries,
          numberOfInstances: imagingStudy.toSnapshot().numberOfInstances
        }
      });

      return reply.status(201).send(toImagingStudyResponse(imagingStudy));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "IMAGING_STUDY_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/imaging-studies/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:read");

    if (!actor) {
      return;
    }

    const params = ImagingStudyIdParamsSchema.parse(request.params);
    const imagingStudy = await imagingStudyRepository.findById(params.id);

    if (!imagingStudy) {
      return reply.status(404).send({
        error: "IMAGING_STUDY_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "imaging-study.read",
      resourceType: "ImagingStudy",
      resourceId: imagingStudy.id,
      patientId: imagingStudy.patientId
    });

    return toImagingStudyResponse(imagingStudy);
  });

  app.get("/imaging-studies/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:fhir-export");

    if (!actor) {
      return;
    }

    const params = ImagingStudyIdParamsSchema.parse(request.params);
    const imagingStudy = await imagingStudyRepository.findById(params.id);

    if (!imagingStudy) {
      return reply.status(404).send({
        error: "IMAGING_STUDY_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "imaging-study.fhir-export",
      resourceType: "ImagingStudy",
      resourceId: imagingStudy.id,
      patientId: imagingStudy.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "ImagingStudy"
      }
    });

    return mapImagingStudyToFhir(imagingStudy);
  });
}

function toImagingStudyResponse(imagingStudy: ImagingStudy): ImagingStudySnapshot {
  return imagingStudy.toSnapshot();
}
