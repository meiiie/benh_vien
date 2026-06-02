import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateImagingStudyRequestSchema,
  PatientImagingStudiesParamsSchema
} from "@benh-vien-so/contracts";
import { ImagingStudy } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ImagingStudyRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendValidationErrorResponse } from "../http/http-validation-error-response.js";
import {
  sendImagingStudyDomainError,
  toImagingStudyResponse
} from "./imaging-study-route-helpers.js";
import { validateImagingStudyReferences } from "./imaging-study-reference-validation.js";

export async function registerImagingStudyCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  imagingStudyRepository: ImagingStudyRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/imaging-studies", async (request, reply) => {
    const actor = requirePermission(request, reply, "imaging-study:create");

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

    const parsed = CreateImagingStudyRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateImagingStudyReferences(
      params.patientId,
      parsed.data,
      {
        encounterRepository,
        serviceRequestRepository,
        diagnosticReportRepository
      }
    );

    if (validationError) {
      return sendValidationErrorResponse(reply, validationError);
    }

    try {
      const imagingStudy = ImagingStudy.record({
        id: `imaging-study-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await imagingStudyRepository.save(imagingStudy);
      const snapshot = imagingStudy.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "imaging-study.create",
        resourceType: "ImagingStudy",
        resourceId: imagingStudy.id,
        patientId: imagingStudy.patientId,
        metadata: {
          studyInstanceUid: snapshot.studyInstanceUid,
          accessionNumber: snapshot.accessionNumber,
          basedOnServiceRequestId: snapshot.basedOnServiceRequestId,
          diagnosticReportId: snapshot.diagnosticReportId,
          numberOfSeries: snapshot.numberOfSeries,
          numberOfInstances: snapshot.numberOfInstances
        }
      });

      return reply.status(201).send(toImagingStudyResponse(imagingStudy));
    } catch (error) {
      if (sendImagingStudyDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
