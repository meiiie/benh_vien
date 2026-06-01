import type { FastifyInstance } from "fastify";
import { ServiceRequestIdParamsSchema } from "@benh-vien-so/contracts";
import { mapServiceRequestToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadServiceRequestForPatientAccess } from "./service-request-route-helpers.js";

export async function registerServiceRequestFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  serviceRequestRepository: ServiceRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/service-requests/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "service-request:fhir-export");

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
      action: "service-request.fhir-export",
      resourceType: "ServiceRequest",
      resourceId: serviceRequest.id,
      patientId: serviceRequest.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "ServiceRequest"
      }
    });

    return mapServiceRequestToFhir(serviceRequest);
  });
}
