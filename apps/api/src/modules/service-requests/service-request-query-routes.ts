import type { FastifyInstance } from "fastify";
import {
  PatientServiceRequestsParamsSchema,
  ServiceRequestIdParamsSchema
} from "@benh-vien-so/contracts";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import {
  loadServiceRequestForPatientAccess,
  toServiceRequestResponse
} from "./service-request-route-helpers.js";

export async function registerServiceRequestQueryRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  serviceRequestRepository: ServiceRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/service-requests", async (request, reply) => {
    const actor = requirePermission(request, reply, "service-request:list");

    if (!actor) {
      return;
    }

    const params = PatientServiceRequestsParamsSchema.parse(request.params);
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

    const serviceRequests = await serviceRequestRepository.findByPatientId(params.patientId);
    await recordAuditEvent(auditRepository, request, {
      action: "service-request.list",
      resourceType: "ServiceRequest",
      resourceId: "collection",
      patientId: params.patientId,
      metadata: {
        returnedCount: serviceRequests.length
      }
    });

    return {
      items: serviceRequests.map(toServiceRequestResponse)
    };
  });

  app.get("/service-requests/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "service-request:read");

    if (!actor) {
      return;
    }

    const params = ServiceRequestIdParamsSchema.parse(request.params);
    const serviceRequest = await loadServiceRequestForPatientAccess(
      request,
      reply,
      actor,
      params.id,
      serviceRequestRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!serviceRequest) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "service-request.read",
      resourceType: "ServiceRequest",
      resourceId: serviceRequest.id,
      patientId: serviceRequest.patientId
    });

    return toServiceRequestResponse(serviceRequest);
  });
}
