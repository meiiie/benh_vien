import type { FastifyInstance } from "fastify";
import { MedicationAdministrationIdParamsSchema } from "@benh-vien-so/contracts";
import { mapMedicationAdministrationToFhir } from "@benh-vien-so/domain";
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

export async function registerMedicationAdministrationFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  medicationAdministrationRepository: MedicationAdministrationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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
