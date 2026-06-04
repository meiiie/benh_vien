import type { FastifyInstance } from "fastify";
import {
  MedicationRequestIdParamsSchema,
  PatientMedicationRequestsParamsSchema
} from "@benh-vien-so/contracts";
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
import { sendNotFoundErrorResponse } from "../http/http-not-found-error-response.js";
import { toMedicationRequestResponse } from "./medication-request-route-helpers.js";

export async function registerMedicationRequestQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  medicationRequestRepository: MedicationRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/medication-requests", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-request:list");

    if (!actor) {
      return;
    }

    const params = PatientMedicationRequestsParamsSchema.parse(request.params);
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

    const medicationRequests = await medicationRequestRepository.findByPatientId(
      params.patientId
    );
    await recordAuditEvent(auditRepository, request, {
      action: "medication-request.list",
      resourceType: "MedicationRequest",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: medicationRequests.length
      }
    });

    return {
      items: medicationRequests.map(toMedicationRequestResponse)
    };
  });

  app.get("/medication-requests/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-request:read");

    if (!actor) {
      return;
    }

    const params = MedicationRequestIdParamsSchema.parse(request.params);
    const medicationRequest = await medicationRequestRepository.findById(params.id);

    if (!medicationRequest) {
      return sendNotFoundErrorResponse(reply, "MEDICATION_REQUEST_NOT_FOUND");
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
      action: "medication-request.read",
      resourceType: "MedicationRequest",
      resourceId: medicationRequest.id,
      patientId: medicationRequest.patientId
    });

    return toMedicationRequestResponse(medicationRequest);
  });
}
