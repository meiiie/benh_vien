import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { nanoid } from "nanoid";
import {
  CreatePatientRequestSchema,
  MergePatientRequestSchema,
  PatientIdParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  Patient,
  PatientIdentifierConflictError,
  mapPatientRecordToFhirDocumentBundle,
  mapPatientRecordToFhirBundle,
  mapPatientToFhir
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  AllergyIntoleranceRepository,
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
  PatientSnapshot,
  PatientIdentifierConflict,
  ProcedureRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import {
  filterPatientsByAccess,
  requirePatientRecordAccess,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export async function registerPatientRoutes(
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
  app.get("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:list");

    if (!actor) {
      return;
    }

    const patients = await repository.findAll();
    const accessiblePatients = await filterPatientsByAccess(
      actor,
      patients,
      providerDirectoryRepository
    );
    await recordAuditEvent(auditRepository, request, {
      action: "patient.list",
      resourceType: "Patient",
      resourceId: "collection",
      metadata: {
        returnedCount: accessiblePatients.length,
        totalCount: patients.length
      }
    });

    return {
      items: accessiblePatients.map(toPatientResponse)
    };
  });

  app.post("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:create");

    if (!actor) {
      return;
    }

    const parsed = CreatePatientRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    let patient: Patient | undefined;

    try {
      patient = Patient.register({
        id: `patient-${nanoid(10)}`,
        ...parsed.data
      });

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

      const identifierConflict = await findPatientIdentifierConflict(repository, patient);

      if (identifierConflict) {
        return sendPatientIdentifierConflict(
          request,
          reply,
          auditRepository,
          patient,
          identifierConflict
        );
      }

      await repository.save(patient);
      await recordAuditEvent(auditRepository, request, {
        action: "patient.create",
        resourceType: "Patient",
        resourceId: patient.id,
        patientId: patient.id,
        metadata: {
          managingOrganizationId: patient.toSnapshot().managingOrganizationId
        }
      });

      return reply.status(201).send(toPatientResponse(patient));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "PATIENT_DOMAIN_ERROR",
          message: error.message
        });
      }

      if (error instanceof PatientIdentifierConflictError) {
        if (patient) {
          return sendPatientIdentifierConflict(
            request,
            reply,
            auditRepository,
            patient,
            error.conflict
          );
        }

        return reply.status(409).send({
          error: "PATIENT_IDENTIFIER_CONFLICT",
          message:
            "Định danh bệnh nhân đã thuộc về một hồ sơ khác. Cần đối soát/MPI thay vì tạo hồ sơ mới."
        });
      }

      throw error;
    }
  });

  app.post("/patients/:id/merge", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:merge");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const parsed = MergePatientRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const sourcePatient = await repository.findById(params.id);

    if (!sourcePatient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND",
        requestId: request.id
      });
    }

    const targetPatient = await repository.findById(parsed.data.targetPatientId);

    if (!targetPatient) {
      return reply.status(404).send({
        error: "TARGET_PATIENT_NOT_FOUND",
        requestId: request.id
      });
    }

    if (
      !(await requirePatientRecordAccess(
        request,
        reply,
        actor,
        sourcePatient,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    if (
      !(await requirePatientRecordAccess(
        request,
        reply,
        actor,
        targetPatient,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    try {
      sourcePatient.markMerged({
        targetPatientId: targetPatient.id,
        mergedByActorId: actor.actorId,
        reason: parsed.data.reason
      });

      await repository.save(sourcePatient);
      await recordAuditEvent(auditRepository, request, {
        action: "patient.merge",
        resourceType: "Patient",
        resourceId: sourcePatient.id,
        patientId: sourcePatient.id,
        metadata: {
          targetPatientId: targetPatient.id,
          mergeReason: parsed.data.reason
        }
      });

      return toPatientResponse(sourcePatient);
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "PATIENT_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/patients/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:read");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const patient = await repository.findById(params.id);

    if (!patient) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 404,
        code: "not-found",
        diagnostics: `Patient/${params.id} không tồn tại để xuất FHIR Patient.`,
        expression: ["Patient.id"],
        details: {
          code: "PATIENT_NOT_FOUND",
          display: "Patient not found",
          text: "Không tìm thấy hồ sơ bệnh nhân cần xuất FHIR."
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

    await recordAuditEvent(auditRepository, request, {
      action: "patient.read",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id
    });

    return toPatientResponse(patient);
  });

  app.get("/patients/:id/fhir", async (request, reply) => {
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
        diagnostics: `Patient/${params.id} không tồn tại để xuất FHIR Bundle.`,
        expression: ["Bundle.entry.resource.ofType(Patient).id"],
        details: {
          code: "PATIENT_NOT_FOUND",
          display: "Patient not found",
          text: "Không tìm thấy hồ sơ bệnh nhân cần đóng gói FHIR."
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

    await recordAuditEvent(auditRepository, request, {
      action: "patient.fhir-export",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Patient"
      }
    });

    return mapPatientToFhir(patient);
  });

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

    const [
      encounters,
      allergyIntolerances,
      documents,
      conditions,
      observations,
      diagnosticReports,
      imagingStudies,
      medicationRequests,
      medicationDispenses,
      medicationAdministrations,
      serviceRequests,
      workflowTasks,
      procedures,
      providerDirectory
    ] = await Promise.all([
      encounterRepository.findByPatientId(params.id),
      allergyIntoleranceRepository.findByPatientId(params.id),
      documentRepository.findByPatientId(params.id),
      conditionRepository.findByPatientId(params.id),
      observationRepository.findByPatientId(params.id),
      diagnosticReportRepository.findByPatientId(params.id),
      imagingStudyRepository.findByPatientId(params.id),
      medicationRequestRepository.findByPatientId(params.id),
      medicationDispenseRepository.findByPatientId(params.id),
      medicationAdministrationRepository.findByPatientId(params.id),
      serviceRequestRepository.findByPatientId(params.id),
      workflowTaskRepository.findByPatientId(params.id),
      procedureRepository.findByPatientId(params.id),
      providerDirectoryRepository.findDirectory()
    ]);

    await recordAuditEvent(auditRepository, request, {
      action: "patient.fhir-bundle-export",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Bundle",
        bundleType: "collection",
        consentReference: transferContext.consentReference,
        recipientOrganizationId: transferContext.recipientOrganizationId,
        encounterCount: encounters.length,
        allergyIntoleranceCount: allergyIntolerances.length,
        conditionCount: conditions.length,
        observationCount: observations.length,
        diagnosticReportCount: diagnosticReports.length,
        imagingStudyCount: imagingStudies.length,
        medicationRequestCount: medicationRequests.length,
        medicationDispenseCount: medicationDispenses.length,
        medicationAdministrationCount: medicationAdministrations.length,
        serviceRequestCount: serviceRequests.length,
        workflowTaskCount: workflowTasks.length,
        procedureCount: procedures.length,
        consentResourceCount: 1,
        documentCount: documents.length,
        providerDirectoryEntryCount:
          providerDirectory.toSnapshot().organizations.length +
          providerDirectory.toSnapshot().practitioners.length +
          providerDirectory.toSnapshot().practitionerRoles.length +
          providerDirectory.toSnapshot().endpoints.length
      }
    });

    return mapPatientRecordToFhirBundle({
      patient,
      encounters,
      allergyIntolerances,
      conditions,
      observations,
      diagnosticReports,
      imagingStudies,
      medicationRequests,
      medicationDispenses,
      medicationAdministrations,
      serviceRequests,
      workflowTasks,
      procedures,
      consents: [consent],
      documents,
      providerDirectory
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

    const [
      encounters,
      allergyIntolerances,
      documents,
      conditions,
      observations,
      diagnosticReports,
      imagingStudies,
      medicationRequests,
      medicationDispenses,
      medicationAdministrations,
      serviceRequests,
      workflowTasks,
      procedures,
      providerDirectory
    ] = await Promise.all([
      encounterRepository.findByPatientId(params.id),
      allergyIntoleranceRepository.findByPatientId(params.id),
      documentRepository.findByPatientId(params.id),
      conditionRepository.findByPatientId(params.id),
      observationRepository.findByPatientId(params.id),
      diagnosticReportRepository.findByPatientId(params.id),
      imagingStudyRepository.findByPatientId(params.id),
      medicationRequestRepository.findByPatientId(params.id),
      medicationDispenseRepository.findByPatientId(params.id),
      medicationAdministrationRepository.findByPatientId(params.id),
      serviceRequestRepository.findByPatientId(params.id),
      workflowTaskRepository.findByPatientId(params.id),
      procedureRepository.findByPatientId(params.id),
      providerDirectoryRepository.findDirectory()
    ]);

    await recordAuditEvent(auditRepository, request, {
      action: "patient.fhir-document-bundle-export",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Bundle",
        bundleType: "document",
        compositionResourceType: "Composition",
        consentReference: transferContext.consentReference,
        recipientOrganizationId: transferContext.recipientOrganizationId,
        encounterCount: encounters.length,
        allergyIntoleranceCount: allergyIntolerances.length,
        conditionCount: conditions.length,
        observationCount: observations.length,
        diagnosticReportCount: diagnosticReports.length,
        imagingStudyCount: imagingStudies.length,
        medicationRequestCount: medicationRequests.length,
        medicationDispenseCount: medicationDispenses.length,
        medicationAdministrationCount: medicationAdministrations.length,
        serviceRequestCount: serviceRequests.length,
        workflowTaskCount: workflowTasks.length,
        procedureCount: procedures.length,
        consentResourceCount: 1,
        documentCount: documents.length,
        providerDirectoryEntryCount:
          providerDirectory.toSnapshot().organizations.length +
          providerDirectory.toSnapshot().practitioners.length +
          providerDirectory.toSnapshot().practitionerRoles.length +
          providerDirectory.toSnapshot().endpoints.length
      }
    });

    return mapPatientRecordToFhirDocumentBundle({
      patient,
      encounters,
      allergyIntolerances,
      conditions,
      observations,
      diagnosticReports,
      imagingStudies,
      medicationRequests,
      medicationDispenses,
      medicationAdministrations,
      serviceRequests,
      workflowTasks,
      procedures,
      consents: [consent],
      documents,
      providerDirectory,
      authorPractitionerId: actor.actorId
    });
  });
}

function toPatientResponse(patient: Patient): PatientSnapshot {
  return patient.toSnapshot();
}

async function findPatientIdentifierConflict(
  repository: PatientRepository,
  patient: Patient
): Promise<PatientIdentifierConflict | undefined> {
  const snapshot = patient.toSnapshot();

  for (const identifier of snapshot.identifiers) {
    const existing = await repository.findByIdentifier(identifier);

    if (existing && existing.id !== snapshot.id) {
      return {
        existingPatientId: existing.id,
        identifier
      };
    }
  }

  return undefined;
}

async function sendPatientIdentifierConflict(
  request: FastifyRequest,
  reply: FastifyReply,
  auditRepository: AuditEventRepository,
  patient: Patient,
  conflict: PatientIdentifierConflict
) {
  const snapshot = patient.toSnapshot();
  await recordAuditEvent(auditRepository, request, {
    action: "patient.identifier-conflict",
    resourceType: "Patient",
    resourceId: conflict.existingPatientId,
    patientId: conflict.existingPatientId === "unknown" ? undefined : conflict.existingPatientId,
    metadata: {
      requestedPatientId: snapshot.id,
      requestedManagingOrganizationId: snapshot.managingOrganizationId,
      identifierSystem: conflict.identifier.system,
      identifierType: conflict.identifier.type
    }
  });

  return reply.status(409).send({
    error: "PATIENT_IDENTIFIER_CONFLICT",
    message:
      "Định danh bệnh nhân đã thuộc về một hồ sơ khác. Cần đối soát/MPI thay vì tạo hồ sơ mới.",
    identifier: {
      system: conflict.identifier.system,
      type: conflict.identifier.type
    }
  });
}

function readBundleTransferContext(
  headers: FastifyRequest["headers"]
):
  | {
      readonly consentReference: string;
      readonly recipientOrganizationId: string;
    }
  | undefined {
  const consentReference = readHeader(headers["x-consent-reference"])?.trim();
  const recipientOrganizationId = readHeader(headers["x-recipient-organization-id"])?.trim();

  if (!consentReference || !recipientOrganizationId) {
    return undefined;
  }

  return {
    consentReference,
    recipientOrganizationId
  };
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
