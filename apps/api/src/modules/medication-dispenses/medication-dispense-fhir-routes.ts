import type { FastifyInstance } from "fastify";
import { MedicationDispenseIdParamsSchema } from "@benh-vien-so/contracts";
import { mapMedicationDispenseToFhir } from "@benh-vien-so/domain";
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

export async function registerMedicationDispenseFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  medicationDispenseRepository: MedicationDispenseRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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
