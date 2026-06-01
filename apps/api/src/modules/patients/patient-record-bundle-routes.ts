import type { FastifyInstance } from "fastify";
import { PatientIdParamsSchema } from "@benh-vien-so/contracts";
import {
  mapPatientRecordToFhirDocumentBundle,
  mapPatientRecordToFhirBundle
} from "@benh-vien-so/domain";
import type {
  AllergyIntoleranceRepository,
  AuditEventRepository,
  ClinicalDocumentRepository,
  ConditionRepository,
  ConsentRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ImagingStudyRepository,
  MedicationAdministrationRepository,
  MedicationDispenseRepository,
  MedicationRequestRepository,
  ObservationRepository,
  PatientRepository,
  ProcedureRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { preparePatientRecordBundleContext } from "./patient-record-bundle-route-helpers.js";
import {
  buildPatientRecordBundleAuditMetadata
} from "./patient-route-helpers.js";

export async function registerPatientRecordBundleRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  encounterRepository: EncounterRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  documentRepository: ClinicalDocumentRepository,
  conditionRepository: ConditionRepository,
  observationRepository: ObservationRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationDispenseRepository: MedicationDispenseRepository,
  medicationAdministrationRepository: MedicationAdministrationRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  imagingStudyRepository: ImagingStudyRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  workflowTaskRepository: WorkflowTaskRepository,
  procedureRepository: ProcedureRepository,
  consentRepository: ConsentRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:id/fhir-bundle", async (request, reply) => {
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
      patientRepository: repository,
      encounterRepository,
      allergyIntoleranceRepository,
      documentRepository,
      conditionRepository,
      observationRepository,
      diagnosticReportRepository,
      imagingStudyRepository,
      medicationRequestRepository,
      medicationDispenseRepository,
      medicationAdministrationRepository,
      serviceRequestRepository,
      workflowTaskRepository,
      procedureRepository,
      providerDirectoryRepository,
      consentRepository,
      bundleType: "collection"
    });

    if (!context) {
      return;
    }

    const { patient, transferContext, consent, collections } = context;

    await recordAuditEvent(auditRepository, request, {
      action: "patient.fhir-bundle-export",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id,
      metadata: buildPatientRecordBundleAuditMetadata({
        bundleType: "collection",
        transferContext,
        collections
      })
    });

    return mapPatientRecordToFhirBundle({
      patient,
      ...collections,
      consents: [consent]
    });
  });

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
      patientRepository: repository,
      encounterRepository,
      allergyIntoleranceRepository,
      documentRepository,
      conditionRepository,
      observationRepository,
      diagnosticReportRepository,
      imagingStudyRepository,
      medicationRequestRepository,
      medicationDispenseRepository,
      medicationAdministrationRepository,
      serviceRequestRepository,
      workflowTaskRepository,
      procedureRepository,
      providerDirectoryRepository,
      consentRepository,
      bundleType: "document"
    });

    if (!context) {
      return;
    }

    const { patient, transferContext, consent, collections } = context;

    await recordAuditEvent(auditRepository, request, {
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
