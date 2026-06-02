import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateMedicationDispenseRequestSchema,
  PatientMedicationDispensesParamsSchema
} from "@benh-vien-so/contracts";
import { MedicationDispense } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  EncounterRepository,
  MedicationDispenseRepository,
  MedicationRequestRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { toMedicationDispenseResponse } from "./medication-dispense-route-helpers.js";
import { validateMedicationDispenseReferences } from "./medication-dispense-reference-validation.js";

export async function registerMedicationDispenseCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationDispenseRepository: MedicationDispenseRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/medication-dispenses", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-dispense:create");

    if (!actor) {
      return;
    }

    const params = PatientMedicationDispensesParamsSchema.parse(request.params);
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

    const parsed = CreateMedicationDispenseRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateMedicationDispenseReferences({
      patientId: params.patientId,
      command: parsed.data,
      encounterRepository,
      medicationRequestRepository
    });

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
      if (
        sendDomainErrorResponse(reply, error, "MEDICATION_DISPENSE_DOMAIN_ERROR")
      ) {
        return;
      }

      throw error;
    }
  });
}
