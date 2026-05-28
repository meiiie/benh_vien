import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateMedicationAdministrationRequestSchema,
  MedicationAdministrationIdParamsSchema,
  PatientMedicationAdministrationsParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  mapMedicationAdministrationToFhir,
  MedicationAdministration
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  MedicationAdministrationRepository,
  MedicationAdministrationSnapshot,
  MedicationRequestRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerMedicationAdministrationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationAdministrationRepository: MedicationAdministrationRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/medication-administrations", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-administration:list");

    if (!actor) {
      return;
    }

    const params = PatientMedicationAdministrationsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const medicationAdministrations =
      await medicationAdministrationRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "medication-administration.list",
      resourceType: "MedicationAdministration",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: medicationAdministrations.length
      }
    });

    return {
      items: medicationAdministrations.map(toMedicationAdministrationResponse)
    };
  });

  app.post("/patients/:patientId/medication-administrations", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-administration:create");

    if (!actor) {
      return;
    }

    const params = PatientMedicationAdministrationsParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateMedicationAdministrationRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateMedicationAdministrationReferences(
      params.patientId,
      parsed.data.encounterId,
      parsed.data.medicationRequestId,
      parsed.data.reasonConditionId,
      encounterRepository,
      medicationRequestRepository,
      conditionRepository
    );

    if (validationError) {
      return reply.status(422).send(validationError);
    }

    try {
      const medicationAdministration = MedicationAdministration.record({
        id: `medication-administration-${nanoid(10)}`,
        patientId: params.patientId,
        performers: [],
        ...parsed.data
      });

      await medicationAdministrationRepository.save(medicationAdministration);
      await recordAuditEvent(auditRepository, request, {
        action: "medication-administration.create",
        resourceType: "MedicationAdministration",
        resourceId: medicationAdministration.id,
        patientId: medicationAdministration.patientId,
        metadata: {
          status: medicationAdministration.toSnapshot().status,
          category: medicationAdministration.toSnapshot().category,
          medicationRequestId: medicationAdministration.toSnapshot().medicationRequestId,
          medicationCode: medicationAdministration.toSnapshot().medicationCode
        }
      });

      return reply
        .status(201)
        .send(toMedicationAdministrationResponse(medicationAdministration));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "MEDICATION_ADMINISTRATION_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/medication-administrations/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-administration:read");

    if (!actor) {
      return;
    }

    const params = MedicationAdministrationIdParamsSchema.parse(request.params);
    const medicationAdministration =
      await medicationAdministrationRepository.findById(params.id);

    if (!medicationAdministration) {
      return reply.status(404).send({
        error: "MEDICATION_ADMINISTRATION_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-administration.read",
      resourceType: "MedicationAdministration",
      resourceId: medicationAdministration.id,
      patientId: medicationAdministration.patientId
    });

    return toMedicationAdministrationResponse(medicationAdministration);
  });

  app.get("/medication-administrations/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-administration:fhir-export");

    if (!actor) {
      return;
    }

    const params = MedicationAdministrationIdParamsSchema.parse(request.params);
    const medicationAdministration =
      await medicationAdministrationRepository.findById(params.id);

    if (!medicationAdministration) {
      return reply.status(404).send({
        error: "MEDICATION_ADMINISTRATION_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-administration.fhir-export",
      resourceType: "MedicationAdministration",
      resourceId: medicationAdministration.id,
      patientId: medicationAdministration.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "MedicationAdministration"
      }
    });

    return mapMedicationAdministrationToFhir(medicationAdministration);
  });
}

function toMedicationAdministrationResponse(
  medicationAdministration: MedicationAdministration
): MedicationAdministrationSnapshot {
  return medicationAdministration.toSnapshot();
}

async function validateMedicationAdministrationReferences(
  patientId: string,
  encounterId: string | undefined,
  medicationRequestId: string | undefined,
  reasonConditionId: string | undefined,
  encounterRepository: EncounterRepository,
  medicationRequestRepository: MedicationRequestRepository,
  conditionRepository: ConditionRepository
): Promise<{ readonly error: string; readonly message: string } | undefined> {
  if (encounterId) {
    const encounter = await encounterRepository.findById(encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message: "Lần dùng thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
      };
    }
  }

  if (medicationRequestId) {
    const medicationRequest = await medicationRequestRepository.findById(
      medicationRequestId
    );

    if (!medicationRequest || medicationRequest.patientId !== patientId) {
      return {
        error: "MEDICATION_REQUEST_MISMATCH",
        message: "Lần dùng thuốc phải tham chiếu MedicationRequest thuộc cùng bệnh nhân."
      };
    }
  }

  if (reasonConditionId) {
    const condition = await conditionRepository.findById(reasonConditionId);

    if (!condition || condition.patientId !== patientId) {
      return {
        error: "CONDITION_MISMATCH",
        message: "Chẩn đoán/lý do dùng thuốc phải thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
