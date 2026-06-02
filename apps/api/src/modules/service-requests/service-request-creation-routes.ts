import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateServiceRequestRequestSchema,
  PatientServiceRequestsParamsSchema
} from "@benh-vien-so/contracts";
import { ServiceRequest } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
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
  sendServiceRequestDomainError,
  toServiceRequestResponse
} from "./service-request-route-helpers.js";
import { validateServiceRequestReferences } from "./service-request-reference-validation.js";

export async function registerServiceRequestCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  serviceRequestRepository: ServiceRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
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

    const validationError = await validateServiceRequestReferences(
      params.patientId,
      parsed.data,
      {
        encounterRepository,
        conditionRepository
      }
    );

    if (validationError) {
      return reply.status(422).send(validationError);
    }

    try {
      const serviceRequest = ServiceRequest.order({
        id: `service-request-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await serviceRequestRepository.save(serviceRequest);
      const snapshot = serviceRequest.toSnapshot();
      await recordAuditEvent(auditRepository, request, {
        action: "service-request.create",
        resourceType: "ServiceRequest",
        resourceId: serviceRequest.id,
        patientId: serviceRequest.patientId,
        metadata: {
          category: snapshot.category,
          code: snapshot.code
        }
      });

      return reply.status(201).send(toServiceRequestResponse(serviceRequest));
    } catch (error) {
      if (sendServiceRequestDomainError(reply, error)) {
        return;
      }

      throw error;
    }
  });
}
