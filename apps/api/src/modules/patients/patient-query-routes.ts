import type { FastifyInstance } from "fastify";
import { PatientIdParamsSchema } from "@benh-vien-so/contracts";
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
import { toPatientResponse } from "./patient-route-helpers.js";

export async function registerPatientQueryRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "patient:read");

    if (!actor) {
      return;
    }

    const params = PatientIdParamsSchema.parse(request.params);
    const patient = await repository.findById(params.id);

    if (!patient) {
      return sendFhirOperationOutcome(reply, {
        statusCode: 404,
        code: "not-found",
        diagnostics: `Patient/${params.id} không tồn tại để xuất FHIR Patient.`,
        expression: ["Patient.id"],
        details: {
          code: "PATIENT_NOT_FOUND",
          display: "Patient not found",
          text: "Không tìm thấy hồ sơ bệnh nhân cần xuất FHIR."
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
      action: "patient.read",
      resourceType: "Patient",
      resourceId: patient.id,
      patientId: patient.id
    });

    return toPatientResponse(patient);
  });
}
