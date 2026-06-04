import type { FastifyInstance } from "fastify";
import {
  MedicationAdministrationIdParamsSchema,
  PatientMedicationAdministrationsParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  MedicationAdministrationRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";
import { toMedicationAdministrationResponse } from "./medication-administration-route-helpers.js";

export async function registerMedicationAdministrationQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  medicationAdministrationRepository: MedicationAdministrationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/medication-administrations", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-administration:list");

    if (!actor) {
      return;
    }

    const params = PatientMedicationAdministrationsParamsSchema.parse(request.params);
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

  app.get("/medication-administrations/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-administration:read");

    if (!actor) {
      return;
    }

    const params = MedicationAdministrationIdParamsSchema.parse(request.params);
    const medicationAdministration =
      await medicationAdministrationRepository.findById(params.id);

    if (!medicationAdministration) {
      return sendNotFoundErrorResponse(
        reply,
        "MEDICATION_ADMINISTRATION_NOT_FOUND"
      );
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        medicationAdministration.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "medication-administration.read",
      resourceType: "MedicationAdministration",
      resourceId: medicationAdministration.id,
      patientId: medicationAdministration.patientId
    });

    return toMedicationAdministrationResponse(medicationAdministration);
  });
}
