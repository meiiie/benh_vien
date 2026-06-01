import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreatePatientRequestSchema,
  MergePatientRequestSchema,
  PatientIdParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  Patient,
  PatientIdentifierConflictError
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
import { registerPatientFhirRoutes } from "./patient-fhir-routes.js";
import {
  findPatientIdentifierConflict,
  sendPatientIdentifierConflict,
  toPatientResponse
} from "./patient-route-helpers.js";

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

  await registerPatientFhirRoutes(
    app,
    repository,
    encounterRepository,
    allergyIntoleranceRepository,
    documentRepository,
    conditionRepository,
    observationRepository,
    medicationRequestRepository,
    medicationDispenseRepository,
    medicationAdministrationRepository,
    serviceRequestRepository,
    diagnosticReportRepository,
    imagingStudyRepository,
    providerDirectoryRepository,
    workflowTaskRepository,
    procedureRepository,
    consentRepository,
    auditRepository
  );
}
