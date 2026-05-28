import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateServiceRequestRequestSchema,
  PatientServiceRequestsParamsSchema,
  ServiceRequestIdParamsSchema
} from "@benh-vien-so/contracts";
import { DomainError, mapServiceRequestToFhir, ServiceRequest } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  PatientRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  ServiceRequestSnapshot
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function registerServiceRequestRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
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

  app.post("/patients/:patientId/service-requests", async (request, reply) => {
    const actor = requirePermission(request, reply, "service-request:create");

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

    const parsed = CreateServiceRequestRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    if (parsed.data.encounterId) {
      const encounter = await encounterRepository.findById(parsed.data.encounterId);

      if (!encounter || encounter.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "ENCOUNTER_MISMATCH",
          message: "Chỉ định dịch vụ phải gắn với lượt khám thuộc cùng bệnh nhân."
        });
      }
    }

    if (parsed.data.reasonConditionId) {
      const condition = await conditionRepository.findById(parsed.data.reasonConditionId);

      if (!condition || condition.patientId !== params.patientId) {
        return reply.status(422).send({
          error: "CONDITION_MISMATCH",
          message: "Chẩn đoán liên quan phải thuộc cùng bệnh nhân."
        });
      }
    }

    try {
      const serviceRequest = ServiceRequest.order({
        id: `service-request-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await serviceRequestRepository.save(serviceRequest);
      await recordAuditEvent(auditRepository, request, {
        action: "service-request.create",
        resourceType: "ServiceRequest",
        resourceId: serviceRequest.id,
        patientId: serviceRequest.patientId,
        metadata: {
          category: serviceRequest.toSnapshot().category,
          code: serviceRequest.toSnapshot().code
        }
      });

      return reply.status(201).send(toServiceRequestResponse(serviceRequest));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "SERVICE_REQUEST_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/service-requests/:id", async (request, reply) => {
    const actor = requirePermission(request, reply, "service-request:read");

    if (!actor) {
      return;
    }

    const params = ServiceRequestIdParamsSchema.parse(request.params);
    const serviceRequest = await serviceRequestRepository.findById(params.id);

    if (!serviceRequest) {
      return reply.status(404).send({
        error: "SERVICE_REQUEST_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        serviceRequest.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
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

  app.get("/service-requests/:id/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "service-request:fhir-export");

    if (!actor) {
      return;
    }

    const params = ServiceRequestIdParamsSchema.parse(request.params);
    const serviceRequest = await serviceRequestRepository.findById(params.id);

    if (!serviceRequest) {
      return reply.status(404).send({
        error: "SERVICE_REQUEST_NOT_FOUND"
      });
    }

    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        serviceRequest.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
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

function toServiceRequestResponse(serviceRequest: ServiceRequest): ServiceRequestSnapshot {
  return serviceRequest.toSnapshot();
}
