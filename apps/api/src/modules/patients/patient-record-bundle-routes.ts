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
import {
  requirePatientRecordAccess,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";
import {
  buildPatientRecordBundleAuditMetadata,
  loadPatientRecordBundleCollections,
  readBundleTransferContext
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
    const patient = await repository.findById(params.id);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccess(
        request,
        reply,
        actor,
        patient,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    const transferContext = readBundleTransferContext(request.headers);

    if (!transferContext) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 400,
        code: "required",
        diagnostics:
          "Thiếu x-consent-reference hoặc x-recipient-organization-id khi xuất FHIR Bundle hồ sơ bệnh nhân.",
        details: {
          code: "MISSING_BUNDLE_TRANSFER_CONTEXT",
          display: "Missing transfer context",
          text:
            "Cần khai báo consent và đơn vị nhận trước khi xuất Bundle phục vụ liên thông."
        }
      });
    }

    const consent = await consentRepository.findById(transferContext.consentReference);

    if (
      !consent?.allowsRecordSharing({
        patientId: params.id,
        granteeOrganizationId: transferContext.recipientOrganizationId
      })
    ) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 403,
        code: "suppressed",
        diagnostics:
          "Consent không tồn tại, không còn hiệu lực hoặc không khớp bệnh nhân/đơn vị nhận.",
        expression: ["Bundle.meta.security"],
        details: {
          code: "CONSENT_NOT_VALID_FOR_TRANSFER",
          display: "Consent not valid for transfer",
          text: "Không được xuất Bundle vì consent chia sẻ hồ sơ không hợp lệ."
        }
      });
    }

    const collections = await loadPatientRecordBundleCollections({
      patientId: params.id,
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
      providerDirectoryRepository
    });

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
    const patient = await repository.findById(params.id);

    if (!patient) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 404,
        code: "not-found",
        diagnostics: `Patient/${params.id} không tồn tại để xuất FHIR document Bundle.`,
        expression: ["Composition.subject.reference"],
        details: {
          code: "PATIENT_NOT_FOUND",
          display: "Patient not found",
          text: "Không tìm thấy hồ sơ bệnh nhân cần đóng gói document Bundle."
        }
      });
    }

    if (
      !(await requirePatientRecordAccess(
        request,
        reply,
        actor,
        patient,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    const transferContext = readBundleTransferContext(request.headers);

    if (!transferContext) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 400,
        code: "required",
        diagnostics:
          "Thiếu x-consent-reference hoặc x-recipient-organization-id khi xuất FHIR document Bundle hồ sơ bệnh nhân.",
        details: {
          code: "MISSING_BUNDLE_TRANSFER_CONTEXT",
          display: "Missing transfer context",
          text:
            "Cần khai báo consent và đơn vị nhận trước khi xuất document Bundle phục vụ liên thông."
        }
      });
    }

    const consent = await consentRepository.findById(transferContext.consentReference);

    if (
      !consent?.allowsRecordSharing({
        patientId: params.id,
        granteeOrganizationId: transferContext.recipientOrganizationId
      })
    ) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 403,
        code: "suppressed",
        diagnostics:
          "Consent không tồn tại, không còn hiệu lực hoặc không khớp bệnh nhân/đơn vị nhận.",
        expression: ["Bundle.meta.security"],
        details: {
          code: "CONSENT_NOT_VALID_FOR_TRANSFER",
          display: "Consent not valid for transfer",
          text: "Không được xuất document Bundle vì consent chia sẻ hồ sơ không hợp lệ."
        }
      });
    }

    const collections = await loadPatientRecordBundleCollections({
      patientId: params.id,
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
      providerDirectoryRepository
    });

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
