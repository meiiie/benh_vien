import type { FastifyInstance } from "fastify";
import { PatientIdParamsSchema } from "@benh-vien-so/contracts";
import { mapPatientRecordToFhirDocumentBundle } from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  buildPatientRecordBundleAuditMetadata
} from "./patient-record-bundle-collections.js";
import type { PatientRecordBundleRouteDependencies } from "./patient-record-bundle-route-dependencies.js";
import { preparePatientRecordBundleContext } from "./patient-record-bundle-route-helpers.js";

export async function registerPatientFhirDocumentBundleRoutes(
  app: FastifyInstance,
  dependencies: PatientRecordBundleRouteDependencies
): Promise<void> {
  app.get("/patients/:id/fhir-document-bundle", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:fhir-export");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const context = await preparePatientRecordBundleContext({
      request,
      reply,
      actor,
      patientId: params.id,
      patientRepository: dependencies.patientRepository,
      encounterRepository: dependencies.encounterRepository,
      allergyIntoleranceRepository: dependencies.allergyIntoleranceRepository,
      documentRepository: dependencies.documentRepository,
      conditionRepository: dependencies.conditionRepository,
      observationRepository: dependencies.observationRepository,
      diagnosticReportRepository: dependencies.diagnosticReportRepository,
      imagingStudyRepository: dependencies.imagingStudyRepository,
      medicationRequestRepository: dependencies.medicationRequestRepository,
      medicationDispenseRepository: dependencies.medicationDispenseRepository,
      medicationAdministrationRepository: dependencies.medicationAdministrationRepository,
      serviceRequestRepository: dependencies.serviceRequestRepository,
      workflowTaskRepository: dependencies.workflowTaskRepository,
      procedureRepository: dependencies.procedureRepository,
      providerDirectoryRepository: dependencies.providerDirectoryRepository,
      consentRepository: dependencies.consentRepository,
      bundleType: "document"
    });

    if (!context) {
      return;
    }

    const { patient, transferContext, consent, collections } = context;

    await recordAuditEvent(dependencies.auditRepository, request, {
      action: "patient.fhir-document-bundle-export",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id,
      metadata: buildPatientRecordBundleAuditMetadata({
        bundleType: "document",
        compositionResourceType: "Composition",
        transferContext,
        collections
      })
    });

    return mapPatientRecordToFhirDocumentBundle({
      patient,
      ...collections,
      consents: [consent],
      authorPractitionerId: actor.actorId
    });
  });
}
