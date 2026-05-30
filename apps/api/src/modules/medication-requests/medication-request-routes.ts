import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateMedicationRequestRequestSchema,
  MedicationRequestIdParamsSchema,
  PatientMedicationRequestsParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  mapMedicationRequestToFhir,
  MedicationRequest
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  MedicationRequestRepository,
  MedicationRequestSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerMedicationRequestRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  medicationRequestRepository: MedicationRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/medication-requests", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-request:list");

    if (!actor) {
      return;
    }

    const params = PatientMedicationRequestsParamsSchema.parse(request.params);
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

    const medicationRequests = await medicationRequestRepository.findByPatientId(
      params.patientId
    );
    await recordAuditEvent(auditRepository, request, {
      action: "medication-request.list",
      resourceType: "MedicationRequest",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: medicationRequests.length
      }
    });

    return {
      items: medicationRequests.map(toMedicationRequestResponse)
    };
  });

  app.post("/patients/:patientId/medication-requests", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-request:create");

    if (!actor) {
      return;
    }

    const params = PatientMedicationRequestsParamsSchema.parse(request.params);
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

    const parsed = CreateMedicationRequestRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Chỉ định thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    if (parsed.data.reasonConditionId) {
      const condition = await conditionRepository.findById(parsed.data.reasonConditionId);

      if (!condition || condition.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "CONDITION_MISMATCH",
          message: "Chẩn đoán liên quan phải thuộc cùng bệnh nhân."
        });
      }
    }

    try {
      const medicationRequest = MedicationRequest.prescribe({
        id: `medication-request-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await medicationRequestRepository.save(medicationRequest);
      await recordAuditEvent(auditRepository, request, {
        action: "medication-request.create",
        resourceType: "MedicationRequest",
        resourceId: medicationRequest.id,
        patientId: medicationRequest.patientId,
        metadata: {
          category: medicationRequest.toSnapshot().category,
          medicationCode: medicationRequest.toSnapshot().medicationCode
        }
      });

      return reply.status(201).send(toMedicationRequestResponse(medicationRequest));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "MEDICATION_REQUEST_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/medication-requests/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-request:read");

    if (!actor) {
      return;
    }

    const params = MedicationRequestIdParamsSchema.parse(request.params);
    const medicationRequest = await medicationRequestRepository.findById(params.id);

    if (!medicationRequest) {
      return reply.status(404).send({
        error: "MEDICATION_REQUEST_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        medicationRequest.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-request.read",
      resourceType: "MedicationRequest",
      resourceId: medicationRequest.id,
      patientId: medicationRequest.patientId
    });

    return toMedicationRequestResponse(medicationRequest);
  });

  app.get("/medication-requests/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-request:fhir-export");

    if (!actor) {
      return;
    }

    const params = MedicationRequestIdParamsSchema.parse(request.params);
    const medicationRequest = await medicationRequestRepository.findById(params.id);

    if (!medicationRequest) {
      return reply.status(404).send({
        error: "MEDICATION_REQUEST_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        medicationRequest.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-request.fhir-export",
      resourceType: "MedicationRequest",
      resourceId: medicationRequest.id,
      patientId: medicationRequest.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "MedicationRequest"
      }
    });

    return mapMedicationRequestToFhir(medicationRequest);
  });
}

function toMedicationRequestResponse(
  medicationRequest: MedicationRequest
): MedicationRequestSnapshot {
  return medicationRequest.toSnapshot();
}
