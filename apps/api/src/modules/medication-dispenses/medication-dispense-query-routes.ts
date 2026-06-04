import type { FastifyInstance } from "fastify";
import {
  MedicationDispenseIdParamsSchema,
  PatientMedicationDispensesParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  MedicationDispenseRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";
import { toMedicationDispenseResponse } from "./medication-dispense-route-helpers.js";

export async function registerMedicationDispenseQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  medicationDispenseRepository: MedicationDispenseRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/medication-dispenses", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-dispense:list");

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

  app.get("/medication-dispenses/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-dispense:read");

    if (!actor) {
      return;
    }

    const params = MedicationDispenseIdParamsSchema.parse(request.params);
    const medicationDispense = await medicationDispenseRepository.findById(params.id);

    if (!medicationDispense) {
      return sendNotFoundErrorResponse(reply, "MEDICATION_DISPENSE_NOT_FOUND");
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        medicationDispense.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-dispense.read",
      resourceType: "MedicationDispense",
      resourceId: medicationDispense.id,
      patientId: medicationDispense.patientId
    });

    return toMedicationDispenseResponse(medicationDispense);
  });
}
