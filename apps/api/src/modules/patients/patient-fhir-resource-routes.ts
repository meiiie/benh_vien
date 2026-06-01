import type { FastifyInstance } from "fastify";
import { PatientIdParamsSchema } from "@benh-vien-so/contracts";
import { mapPatientToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccess,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export async function registerPatientFhirResourceRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:fhir-export");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const patient = await repository.findById(params.id);

    if (!patient) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 404,
        code: "not-found",
        diagnostics: `Patient/${params.id} không tồn tại để xuất FHIR Bundle.`,
        expression: ["Bundle.entry.resource.ofType(Patient).id"],
        details: {
          code: "PATIENT_NOT_FOUND",
          display: "Patient not found",
          text: "Không tìm thấy hồ sơ bệnh nhân cần đóng gói FHIR."
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
      action: "patient.fhir-export",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Patient"
      }
    });

    return mapPatientToFhir(patient);
  });
}
