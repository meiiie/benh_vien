import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateMedicationRequestRequestSchema,
  PatientMedicationRequestsParamsSchema
} from "@benh-vien-so/contracts";
import { MedicationRequest } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  MedicationRequestRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { toMedicationRequestResponse } from "./medication-request-route-helpers.js";
import { validateMedicationRequestReferences } from "./medication-request-reference-validation.js";

export async function registerMedicationRequestCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  medicationRequestRepository: MedicationRequestRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/medication-requests", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-request:create");

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

    const parsed = CreateMedicationRequestRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateMedicationRequestReferences({
      patientId: params.patientId,
      command: parsed.data,
      encounterRepository,
      conditionRepository
    });

    if (validationError) {
      return reply.status(422).send(validationError);
    }

    try {
      const medicationRequest = MedicationRequest.prescribe({
        id: `medication-request-${nanoid(10)}`,
        patientId: params.patientId,
        ...parsed.data
      });

      await medicationRequestRepository.save(medicationRequest);
      await recordAuditEvent(auditRepository, request, {
        action: "medication-request.create",
        resourceType: "MedicationRequest",
        resourceId: medicationRequest.id,
        patientId: medicationRequest.patientId,
        metadata: {
          category: medicationRequest.toSnapshot().category,
          medicationCode: medicationRequest.toSnapshot().medicationCode
        }
      });

      return reply.status(201).send(toMedicationRequestResponse(medicationRequest));
    } catch (error) {
      if (
        sendDomainErrorResponse(reply, error, "MEDICATION_REQUEST_DOMAIN_ERROR")
      ) {
        return;
      }

      throw error;
    }
  });
}
