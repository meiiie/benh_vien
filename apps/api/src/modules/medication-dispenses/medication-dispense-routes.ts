import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateMedicationDispenseRequestSchema,
  MedicationDispenseIdParamsSchema,
  PatientMedicationDispensesParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  mapMedicationDispenseToFhir,
  MedicationDispense
} from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  MedicationDispenseRepository,
  MedicationDispenseSnapshot,
  MedicationRequestRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerMedicationDispenseRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationDispenseRepository: MedicationDispenseRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/medication-dispenses", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-dispense:list");

    if (!actor) {
      return;
    }

    const params = PatientMedicationDispensesParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const medicationDispenses =
      await medicationDispenseRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "medication-dispense.list",
      resourceType: "MedicationDispense",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: medicationDispenses.length
      }
    });

    return {
      items: medicationDispenses.map(toMedicationDispenseResponse)
    };
  });

  app.post("/patients/:patientId/medication-dispenses", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-dispense:create");

    if (!actor) {
      return;
    }

    const params = PatientMedicationDispensesParamsSchema.parse(request.params);
    const patient = await patientRepository.findById(params.patientId);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    const parsed = CreateMedicationDispenseRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_MEDICATION_DISPENSE_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    const validationError = await validateMedicationDispenseReferences(
      params.patientId,
      parsed.data.encounterId,
      parsed.data.medicationRequestId,
      encounterRepository,
      medicationRequestRepository
    );

    if (validationError) {
      return reply.status(422).send(validationError);
    }

    try {
      const medicationDispense = MedicationDispense.record({
        id: `medication-dispense-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await medicationDispenseRepository.save(medicationDispense);
      await recordAuditEvent(auditRepository, request, {
        action: "medication-dispense.create",
        resourceType: "MedicationDispense",
        resourceId: medicationDispense.id,
        patientId: medicationDispense.patientId,
        metadata: {
          status: medicationDispense.toSnapshot().status,
          category: medicationDispense.toSnapshot().category,
          medicationRequestId: medicationDispense.toSnapshot().medicationRequestId,
          medicationCode: medicationDispense.toSnapshot().medicationCode
        }
      });

      return reply.status(201).send(toMedicationDispenseResponse(medicationDispense));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "MEDICATION_DISPENSE_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/medication-dispenses/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-dispense:read");

    if (!actor) {
      return;
    }

    const params = MedicationDispenseIdParamsSchema.parse(request.params);
    const medicationDispense = await medicationDispenseRepository.findById(params.id);

    if (!medicationDispense) {
      return reply.status(404).send({
        error: "MEDICATION_DISPENSE_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-dispense.read",
      resourceType: "MedicationDispense",
      resourceId: medicationDispense.id,
      patientId: medicationDispense.patientId
    });

    return toMedicationDispenseResponse(medicationDispense);
  });

  app.get("/medication-dispenses/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-dispense:fhir-export");

    if (!actor) {
      return;
    }

    const params = MedicationDispenseIdParamsSchema.parse(request.params);
    const medicationDispense = await medicationDispenseRepository.findById(params.id);

    if (!medicationDispense) {
      return reply.status(404).send({
        error: "MEDICATION_DISPENSE_NOT_FOUND"
      });
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-dispense.fhir-export",
      resourceType: "MedicationDispense",
      resourceId: medicationDispense.id,
      patientId: medicationDispense.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "MedicationDispense"
      }
    });

    return mapMedicationDispenseToFhir(medicationDispense);
  });
}

function toMedicationDispenseResponse(
  medicationDispense: MedicationDispense
): MedicationDispenseSnapshot {
  return medicationDispense.toSnapshot();
}

async function validateMedicationDispenseReferences(
  patientId: string,
  encounterId: string | undefined,
  medicationRequestId: string | undefined,
  encounterRepository: EncounterRepository,
  medicationRequestRepository: MedicationRequestRepository
): Promise<{ readonly error: string; readonly message: string } | undefined> {
  if (encounterId) {
    const encounter = await encounterRepository.findById(encounterId);

    if (!encounter || encounter.patientId !== patientId) {
      return {
        error: "ENCOUNTER_MISMATCH",
        message:
          "Cấp phát thuốc phải gắn với lượt khám thuộc cùng bệnh nhân."
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
        message:
          "Cấp phát thuốc phải tham chiếu MedicationRequest thuộc cùng bệnh nhân."
      };
    }
  }

  return undefined;
}
