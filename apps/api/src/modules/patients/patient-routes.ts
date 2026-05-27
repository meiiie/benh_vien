import type { FastifyInstance, FastifyRequest } from "fastify";
import { nanoid } from "nanoid";
import {
  CreatePatientRequestSchema,
  PatientIdParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  Patient,
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
  MedicationRequestRepository,
  ObservationRepository,
  PatientRepository,
  PatientSnapshot,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerPatientRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  encounterRepository: EncounterRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  documentRepository: ClinicalDocumentRepository,
  conditionRepository: ConditionRepository,
  observationRepository: ObservationRepository,
  medicationRequestRepository: MedicationRequestRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  imagingStudyRepository: ImagingStudyRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  workflowTaskRepository: WorkflowTaskRepository,
  consentRepository: ConsentRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:list");

    if (!actor) {
      return;
    }

    const patients = await repository.findAll();
    await recordAuditEvent(auditRepository, request, {
      action: "patient.list",
      resourceType: "Patient",
      resourceId: "collection",
      metadata: {
        returnedCount: patients.length
      }
    });

    return {
      items: patients.map(toPatientResponse)
    };
  });

  app.post("/patients", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:create");

    if (!actor) {
      return;
    }

    const parsed = CreatePatientRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_PATIENT_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    try {
      const patient = Patient.register({
        id: `patient-${nanoid(10)}`,
        ...parsed.data
      });

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
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
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
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
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

    const transferContext = readBundleTransferContext(request.headers);

    if (!transferContext) {
      return reply.status(400).send({
        error: "MISSING_BUNDLE_TRANSFER_CONTEXT",
        message:
          "Cần khai báo x-consent-reference và x-recipient-organization-id khi xuất FHIR Bundle hồ sơ bệnh nhân."
      });
    }

    const consent = await consentRepository.findById(transferContext.consentReference);

    if (
      !consent?.allowsRecordSharing({
        patientId: params.id,
        granteeOrganizationId: transferContext.recipientOrganizationId
      })
    ) {
      return reply.status(403).send({
        error: "CONSENT_NOT_VALID_FOR_TRANSFER",
        message:
          "Consent không tồn tại, không còn hiệu lực hoặc không khớp bệnh nhân/đơn vị nhận."
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
      serviceRequests,
      workflowTasks,
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
      serviceRequestRepository.findByPatientId(params.id),
      workflowTaskRepository.findByPatientId(params.id),
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
        serviceRequestCount: serviceRequests.length,
        workflowTaskCount: workflowTasks.length,
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
      serviceRequests,
      workflowTasks,
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
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const transferContext = readBundleTransferContext(request.headers);

    if (!transferContext) {
      return reply.status(400).send({
        error: "MISSING_BUNDLE_TRANSFER_CONTEXT",
        message:
          "Cần khai báo x-consent-reference và x-recipient-organization-id khi xuất FHIR document Bundle hồ sơ bệnh nhân."
      });
    }

    const consent = await consentRepository.findById(transferContext.consentReference);

    if (
      !consent?.allowsRecordSharing({
        patientId: params.id,
        granteeOrganizationId: transferContext.recipientOrganizationId
      })
    ) {
      return reply.status(403).send({
        error: "CONSENT_NOT_VALID_FOR_TRANSFER",
        message:
          "Consent không tồn tại, không còn hiệu lực hoặc không khớp bệnh nhân/đơn vị nhận."
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
      serviceRequests,
      workflowTasks,
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
      serviceRequestRepository.findByPatientId(params.id),
      workflowTaskRepository.findByPatientId(params.id),
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
        serviceRequestCount: serviceRequests.length,
        workflowTaskCount: workflowTasks.length,
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
      serviceRequests,
      workflowTasks,
      documents,
      providerDirectory,
      authorPractitionerId: actor.actorId
    });
  });
}

function toPatientResponse(patient: Patient): PatientSnapshot {
  return patient.toSnapshot();
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
