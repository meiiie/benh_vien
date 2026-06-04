import type { FastifyInstance } from "fastify";
import { ImagingStudyIdParamsSchema } from "@benh-vien-so/contracts";
import { mapImagingStudyToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ImagingStudyRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadImagingStudyForPatientAccess } from "./imaging-study-route-helpers.js";

export async function registerImagingStudyFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  imagingStudyRepository: ImagingStudyRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/imaging-studies/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:fhir-export");

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
