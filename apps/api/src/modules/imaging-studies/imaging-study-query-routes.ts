import type { FastifyInstance } from "fastify";
import {
  ImagingStudyIdParamsSchema,
  PatientImagingStudiesParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  ImagingStudyRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadImagingStudyForPatientAccess,
  toImagingStudyResponse
} from "./imaging-study-route-helpers.js";

export async function registerImagingStudyQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  imagingStudyRepository: ImagingStudyRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/imaging-studies", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:list");

    if (!actor) {
      return;
    }

    const params = PatientImagingStudiesParamsSchema.parse(request.params);
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

  app.get("/imaging-studies/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:read");

    if (!actor) {
      return;
    }

    const params = ImagingStudyIdParamsSchema.parse(request.params);
    const imagingStudy = await loadImagingStudyForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      imagingStudyRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!imagingStudy) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "imaging-study.read",
      resourceType: "ImagingStudy",
      resourceId: imagingStudy.id,
      patientId: imagingStudy.patientId
    });

    return toImagingStudyResponse(imagingStudy);
  });
}
