import type { FastifyInstance } from "fastify";
import { MedicationRequestIdParamsSchema } from "@benh-vien-so/contracts";
import { mapMedicationRequestToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  MedicationRequestRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerMedicationRequestFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  medicationRequestRepository: MedicationRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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
